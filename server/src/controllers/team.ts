import type { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import crypto from 'crypto';
import { parseInvitationPayload, parseRoleUpdatePayload } from '../validators/team.js';

const logControllerError = (scope: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${message}`);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const countTeamOwners = async (teamId: string) => prisma.teamMember.count({
    where: { teamId, role: 'owner' }
});

interface TeamMemberSummary {
  userId: string;
}

interface TeamMembershipWithTeam {
  team: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    members?: TeamMemberSummary[];
  };
}

interface TeamMemberWithProfile {
  id: string;
  role: string;
  createdAt: Date;
  userId: string;
  teamId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface TeamInvitationRecord {
  id: string;
  email: string;
  status: string;
  teamId: string;
  invitationCode: string;
  createdAt: Date;
  expiresAt: Date;
}

interface TeamInvitationWithTeam extends TeamInvitationRecord {
  team: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    members?: TeamMemberSummary[];
  };
}

// Creating a Team
export const createTeam = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { name, description } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const team = await prisma.team.create({
            data: { name, description },
        });

        // Automatically add owner
        await prisma.teamMember.create({
            data: {
                teamId: team.id,
                userId: userId,
                role: 'owner'
            }
        });

        res.status(201).json(team);
    } catch (error) {
        logControllerError('team.createTeam', error);
        res.status(500).json({ message: 'Error creating team' });
    }
};

// Fetching Teams for a user
export const getTeams = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const memberships = await prisma.teamMember.findMany({
            where: { userId: userId as string },
            include: { team: { include: { members: { where: { role: 'owner' } } } } }
        });

        const teams = memberships.map((membership: TeamMembershipWithTeam) => ({
            id: membership.team.id,
            name: membership.team.name,
            description: membership.team.description,
            created_at: membership.team.createdAt.toISOString(),
            owner_id: membership.team.members?.[0]?.userId || userId
        }));
        res.json(teams);
    } catch (error) {
        logControllerError('team.getTeams', error);
        res.status(500).json({ message: 'Error fetching teams' });
    }
};

// Fetching members of a team
export const getTeamMembers = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = req.user?.id;
    try {
        // Must be a member to see other members
        const membership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId }
        });
        if (!membership) return res.status(403).json({ message: 'Forbidden' });

        const members = await prisma.teamMember.findMany({
            where: { teamId: teamId as string },
            include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } }
        });

        // Transform for frontend
        const result = members.map((member: TeamMemberWithProfile) => ({
            id: member.id,
            role: member.role,
            joined_at: member.createdAt.toISOString(),
            user_id: member.userId,
            team_id: member.teamId,
            profile: {
                id: member.user.id,
                email: member.user.email,
                full_name: member.user.name,
                avatar_url: member.user.avatarUrl
            }
        }));

        res.json(result);
    } catch (error) {
        logControllerError('team.getTeamMembers', error);
        res.status(500).json({ message: 'Error fetching team members' });
    }
};

// Update team member role
export const updateTeamMemberRole = async (req: Request, res: Response) => {
    const { teamId, userId } = req.params;
    const requesterId = req.user?.id;
    try {
        const roleResult = parseRoleUpdatePayload(req.body);
        if (!roleResult.success) {
            return res.status(400).json({ message: roleResult.message });
        }

        // Check if requester is owner/admin
        const requesterMembership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId: requesterId, role: { in: ['owner', 'admin'] } }
        });
        if (!requesterMembership) return res.status(403).json({ message: 'Forbidden' });

        const member = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId: userId as string }
        });

        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        if (member.role === 'owner') {
            const ownerCount = await countTeamOwners(teamId as string);
            if (ownerCount <= 1) {
                return res.status(400).json({ message: 'Cannot demote the last team owner' });
            }

            return res.status(400).json({ message: 'Owner role changes require a dedicated ownership transfer flow' });
        }

        const updated = await prisma.teamMember.update({
            where: { id: member.id },
            data: { role: roleResult.data.role }
        });

        res.json(updated);
    } catch (error) {
        logControllerError('team.updateTeamMemberRole', error);
        res.status(500).json({ message: 'Error updating member role' });
    }
};

// Remove team member
export const removeTeamMember = async (req: Request, res: Response) => {
    const { teamId, userId } = req.params;
    const requesterId = req.user?.id;
    try {
        // Check if requester is owner/admin OR removing self
        const requesterMembership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId: requesterId }
        });

        if (!requesterMembership) return res.status(403).json({ message: 'Forbidden' });

        const isSelf = requesterId === userId;
        const isAdmin = ['owner', 'admin'].includes(requesterMembership.role);

        if (!isSelf && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const member = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId: userId as string }
        });

        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        if (member.role === 'owner' && !isSelf) {
            return res.status(400).json({ message: 'Cannot remove team owner' });
        }

        if (member.role === 'owner' && isSelf) {
            const ownerCount = await countTeamOwners(teamId as string);
            if (ownerCount <= 1) {
                return res.status(400).json({ message: 'Cannot remove the last team owner' });
            }
        }

        await prisma.teamMember.delete({ where: { id: member.id } });
        res.json({ message: 'Removed team member' });
    } catch (error) {
        logControllerError('team.removeTeamMember', error);
        res.status(500).json({ message: 'Error removing team member' });
    }
};

// Update Team
export const updateTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = req.user?.id;
    const { name, description } = req.body;
    try {
        const membership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId, role: { in: ['owner', 'admin'] } }
        });
        if (!membership) return res.status(403).json({ message: 'Forbidden' });

        const team = await prisma.team.update({
            where: { id: teamId as string },
            data: { name, description }
        });
        res.json(team);
    } catch (error) {
        logControllerError('team.updateTeam', error);
        res.status(500).json({ message: 'Error updating team' });
    }
}

// Delete Team
export const deleteTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = req.user?.id;
    try {
        const membership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId, role: 'owner' }
        });
        if (!membership) return res.status(403).json({ message: 'Forbidden: Only owners can delete teams' });

        await prisma.team.delete({
            where: { id: teamId as string }
        });
        res.json({ message: 'Team deleted' });
    } catch (error) {
        logControllerError('team.deleteTeam', error);
        res.status(500).json({ message: 'Error deleting team' });
    }
}

// Send Invitation
export const sendInvitation = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const requesterId = req.user?.id;

    try {
        const invitationResult = parseInvitationPayload(req.body);
        if (!invitationResult.success) {
            return res.status(400).json({ message: invitationResult.message });
        }

        const membership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId: requesterId, role: { in: ['owner', 'admin'] } }
        });
        if (!membership) return res.status(403).json({ message: 'Forbidden' });

        const email = invitationResult.data.email;
        const invitedUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (invitedUser) {
            const existingMembership = await prisma.teamMember.findFirst({
                where: { teamId: teamId as string, userId: invitedUser.id },
            });
            if (existingMembership) {
                return res.status(400).json({ message: 'User is already a team member' });
            }
        }

        const existingInvitation = await prisma.teamInvitation.findFirst({
            where: {
                teamId: teamId as string,
                email,
                status: 'pending',
                expiresAt: { gt: new Date() },
            },
        });

        if (existingInvitation) {
            return res.status(400).json({ message: 'A pending invitation already exists for this email' });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const invitationCode = crypto.randomUUID();

        const invitation = await prisma.teamInvitation.create({
            data: {
                teamId: teamId as string,
                email,
                role: invitationResult.data.role ?? 'member',
                expiresAt,
                invitationCode
            }
        });

        res.status(201).json(invitation);
    } catch (error) {
        logControllerError('team.sendInvitation', error);
        res.status(500).json({ message: 'Error sending invitation' });
    }
}

// Get Team Invitations
export const getTeamInvitations = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const userId = req.user?.id;
    try {
        const membership = await prisma.teamMember.findFirst({
            where: { teamId: teamId as string, userId, role: { in: ['owner', 'admin'] } }
        });
        if (!membership) return res.status(403).json({ message: 'Forbidden' });

        const invitations = await prisma.teamInvitation.findMany({
            where: { teamId: teamId as string, status: 'pending' }
        });

        const formatted = invitations.map((invitation: TeamInvitationRecord) => ({
            id: invitation.id,
            email: invitation.email,
            status: invitation.status,
            team_id: invitation.teamId,
            invitation_code: invitation.invitationCode,
            created_at: invitation.createdAt.toISOString(),
            expires_at: invitation.expiresAt.toISOString()
        }));

        res.json(formatted);
    } catch (error) {
        logControllerError('team.getTeamInvitations', error);
        res.status(500).json({ message: 'Error fetching invitations' });
    }
}

// Get User Invitations
export const getUserInvitations = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!currentUser?.email) {
            return res.status(404).json({ message: 'User not found' });
        }

        const invitations = await prisma.teamInvitation.findMany({
            where: {
                email: normalizeEmail(currentUser.email),
                status: 'pending',
                expiresAt: { gt: new Date() }
            },
            include: { team: { include: { members: { where: { role: 'owner' } } } } }
        });

        const formatted = invitations.map((invitation: TeamInvitationWithTeam) => ({
            id: invitation.id,
            team_id: invitation.teamId,
            email: invitation.email,
            created_at: invitation.createdAt.toISOString(),
            expires_at: invitation.expiresAt.toISOString(),
            invitation_code: invitation.invitationCode,
            status: invitation.status,
            team: {
                id: invitation.team.id,
                name: invitation.team.name,
                description: invitation.team.description,
                created_at: invitation.team.createdAt.toISOString(),
                owner_id: invitation.team.members?.[0]?.userId || ''
            }
        }));

        res.json(formatted);
    } catch (error) {
        logControllerError('team.getUserInvitations', error);
        res.status(500).json({ message: 'Error fetching user invitations' });
    }
}

// Accept Invitation
export const acceptInvitation = async (req: Request, res: Response) => {
    const { invitationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId as string }
        });

        if (!invitation || invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invalid or processed invitation' });
        }

        if (invitation.expiresAt <= new Date()) {
            return res.status(400).json({ message: 'Invitation has expired' });
        }

        // Email validation: must match the invitation email
        if (!currentUser?.email || invitation.email !== normalizeEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Forbidden: Invitation was sent to a different email address' });
        }

        const existingMembership = await prisma.teamMember.findFirst({
            where: { teamId: invitation.teamId, userId },
        });
        if (existingMembership) {
            return res.status(400).json({ message: 'User is already a team member' });
        }

        // update invitation
        await prisma.teamInvitation.update({
            where: { id: invitationId as string },
            data: { status: 'accepted' }
        });

        // Add to team
        await prisma.teamMember.create({
            data: {
                teamId: invitation.teamId,
                userId: userId,
                role: invitation.role
            }
        });

        res.json({ teamId: invitation.teamId });
    } catch (error) {
        logControllerError('team.acceptInvitation', error);
        res.status(500).json({ message: 'Error accepting invitation' });
    }
}

// Reject Invitation
export const rejectInvitation = async (req: Request, res: Response) => {
    const { invitationId } = req.params;
    const userId = req.user?.id;
    try {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        const invitation = await prisma.teamInvitation.findUnique({ where: { id: invitationId as string } });

        if (!invitation) return res.status(404).json({ message: 'Invitation not found' });
        if (!currentUser?.email || invitation.email !== normalizeEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Forbidden: You can only reject invitations sent to your email' });
        }

        const updated = await prisma.teamInvitation.update({
            where: { id: invitationId as string },
            data: { status: 'rejected' }
        });
        res.json(updated);
    } catch (error) {
        logControllerError('team.rejectInvitation', error);
        res.status(500).json({ message: 'Error rejecting invitation' });
    }
}
