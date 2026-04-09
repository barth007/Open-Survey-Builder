import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { config } from '../config.js';
import { sendTransactionalEmail } from '../mailer.js';
import {
    adminProfileStatusSchema,
    deleteAccountSchema,
    getValidationMessage,
    loginSchema,
    profileUpdateSchema,
    registerSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    updatePasswordSchema,
} from '../validators/auth.js';

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
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { password, name } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // First registered user is automatically approved as admin
        const userCount = await prisma.user.count();
        const isFirstUser = userCount === 0;

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                status: isFirstUser ? 'approved' : 'pending',
                role: isFirstUser ? 'admin' : 'user',
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
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { password } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

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
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { name, avatarUrl, emailNotifications, marketingEmails } = parsed.data;

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
    const parsed = adminProfileStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { status } = parsed.data;

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

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const parsed = updatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { currentPassword, password } = parsed.data;

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

export const requestPasswordReset = async (req: Request, res: Response) => {
    const parsed = requestPasswordResetSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const email = normalizeEmail(parsed.data.email);

    // Always respond with the same message to prevent email enumeration
    const successMessage = 'If that email is registered, a reset link has been sent.';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.json({ message: successMessage });
        }

        // Invalidate any existing unused tokens for this user
        await prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
        });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.create({
            data: { userId: user.id, token, expiresAt },
        });

        const frontendUrl = config.frontendUrl || 'http://localhost:3100';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        await sendTransactionalEmail({
            to: email,
            subject: 'Reset your password',
            text: [
                'You requested a password reset for your Survey Builder account.',
                '',
                `Reset your password here: ${resetUrl}`,
                '',
                'This link expires in 1 hour.',
                '',
                'If you did not request this, you can safely ignore this email.',
            ].join('\n'),
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin-bottom:4px">Reset your password</h2>
  <p style="color:#555;margin-top:0">
    You requested a password reset for your Survey Builder account.
  </p>
  <p style="margin:24px 0">
    <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
      Reset Password
    </a>
  </p>
  <p style="color:#888;font-size:13px">
    Or copy this link: <a href="${resetUrl}" style="color:#6366f1">${resetUrl}</a>
  </p>
  <p style="color:#888;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
    This link expires in 1 hour. If you did not request this, you can safely ignore this email.
  </p>
</body>
</html>
`.trim(),
        });

        res.json({ message: successMessage });
    } catch (error) {
        logControllerError('auth.requestPasswordReset', error);
        res.status(500).json({ message: 'Error sending reset email' });
    }
};

export const resetPasswordWithToken = async (req: Request, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { token, password } = parsed.data;

    try {
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: { select: { id: true } } },
        });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        logControllerError('auth.resetPasswordWithToken', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const parsed = deleteAccountSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: getValidationMessage(parsed.error.issues) });
    }

    const { currentPassword } = parsed.data;

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
