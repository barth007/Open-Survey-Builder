import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { config } from '../config.js';

const logControllerError = (scope: string, error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${scope}] ${message}`);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const profileSelect = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    emailNotifications: true,
    marketingEmails: true,
    role: true,
    status: true,
    updatedAt: true,
} as const;

export const register = async (req: Request, res: Response) => {
    const { password, name } = req.body;
    const email = typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '';

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                status: 'pending',
                role: 'user',
            },
        });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        logControllerError('auth.register', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { password } = req.body;
    const email = typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : '';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'approved') {
            return res.status(403).json({ message: 'Account pending approval' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!config.jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
            expiresIn: '24h',
        });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status } });
    } catch (error) {
        logControllerError('auth.login', error);
        res.status(500).json({ message: 'Error logging in' });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: profileSelect
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        logControllerError('auth.getProfile', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { name, avatarUrl, emailNotifications, marketingEmails } = req.body;

    const data: {
        name?: string | null;
        avatarUrl?: string | null;
        emailNotifications?: boolean;
        marketingEmails?: boolean;
    } = {};

    if (typeof name === 'string' || name === null) {
        data.name = name;
    }

    if (typeof avatarUrl === 'string' || avatarUrl === null) {
        data.avatarUrl = avatarUrl;
    }

    if (typeof emailNotifications === 'boolean') {
        data.emailNotifications = emailNotifications;
    }

    if (typeof marketingEmails === 'boolean') {
        data.marketingEmails = marketingEmails;
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: profileSelect
        });
        res.json(user);
    } catch (error) {
        logControllerError('auth.updateProfile', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Admin Endpoints
export const getPendingProfiles = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const adminUser = await prisma.user.findUnique({ where: { id: userId } });
        if (adminUser?.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const pendingUsers = await prisma.user.findMany({
            where: { status: 'pending' },
            select: { id: true, email: true, name: true, role: true, status: true, updatedAt: true }
        });
        res.json(pendingUsers);
    } catch (error) {
        logControllerError('auth.getPendingProfiles', error);
        res.status(500).json({ message: 'Error fetching pending profiles' });
    }
};

export const updateProfileStatus = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    try {
        const adminUser = await prisma.user.findUnique({ where: { id: userId } });
        if (adminUser?.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const user = await prisma.user.update({
            where: { id: id as string },
            data: { status },
            select: profileSelect
        });
        res.json(user);
    } catch (error) {
        logControllerError('auth.updateProfileStatus', error);
        res.status(500).json({ message: 'Error updating profile status' });
    }
};
export const updatePassword = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { currentPassword, password } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (typeof currentPassword !== 'string' || !currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }

    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        logControllerError('auth.updatePassword', error);
        res.status(500).json({ message: 'Error updating password' });
    }
};

export const exportAccountData = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: profileSelect,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [surveys, folders, memberships, invitations, responses] = await prisma.$transaction([
            prisma.survey.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.folder.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.teamMember.findMany({
                where: { userId },
                include: {
                    team: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.teamInvitation.findMany({
                where: { email: user.email },
                include: {
                    team: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.surveyResponse.findMany({
                where: { participantId: userId },
                orderBy: { submittedAt: 'desc' },
            }),
        ]);

        res.json({
            exportedAt: new Date().toISOString(),
            user,
            surveys,
            folders,
            teamMemberships: memberships,
            invitations,
            responses,
        });
    } catch (error) {
        logControllerError('auth.exportAccountData', error);
        res.status(500).json({ message: 'Error exporting account data' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { currentPassword, confirmation } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (confirmation !== 'DELETE') {
        return res.status(400).json({ message: 'Deletion confirmation must match DELETE' });
    }

    if (typeof currentPassword !== 'string' || !currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                passwordHash: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const ownerMemberships = await prisma.teamMember.findMany({
            where: {
                userId,
                role: 'owner',
            },
            select: {
                teamId: true,
            },
        });

        for (const membership of ownerMemberships) {
            const ownerCount = await prisma.teamMember.count({
                where: {
                    teamId: membership.teamId,
                    role: 'owner',
                },
            });

            if (ownerCount <= 1) {
                return res.status(400).json({
                    message: 'Transfer team ownership before deleting this account',
                });
            }
        }

        await prisma.$transaction([
            prisma.surveyResponse.deleteMany({
                where: { participantId: userId },
            }),
            prisma.teamInvitation.deleteMany({
                where: { email: user.email },
            }),
            prisma.survey.deleteMany({
                where: { userId },
            }),
            prisma.folder.deleteMany({
                where: { userId },
            }),
            prisma.teamMember.deleteMany({
                where: { userId },
            }),
            prisma.user.delete({
                where: { id: userId },
            }),
        ]);

        res.status(204).send();
    } catch (error) {
        logControllerError('auth.deleteAccount', error);
        res.status(500).json({ message: 'Error deleting account' });
    }
};
