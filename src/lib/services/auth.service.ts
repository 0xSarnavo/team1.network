import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '@/lib/db/client';
import { AUTH } from '@/lib/config/constants';
import { AppError } from '@/lib/helpers/errors';
import { generateUsername } from '@/lib/helpers/username';
import { auditService } from './audit.service';
import type { TokenPayload, AuthUser } from '@/types/api.types';

// ============================================================
// Auth Service — Handles all authentication logic
// ============================================================

class AuthService {
  // ----------------------------------------------------------
  // Builder Hub Integration
  // ----------------------------------------------------------

  /**
   * Validate a Builder Hub JWT token against their API.
   * Returns the decoded user data from Builder Hub.
   */
  async validateBuilderHubToken(builderHubJwt: string): Promise<BuilderHubUser> {
    const validateUrl = process.env.BUILDER_HUB_VALIDATE_URL;
    if (!validateUrl) {
      throw new AppError('INTERNAL_ERROR', 'Builder Hub validation URL not configured');
    }

    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${builderHubJwt}`,
      },
    });

    if (!response.ok) {
      throw new AppError('TOKEN_INVALID', 'Builder Hub token validation failed');
    }

    const data = await response.json();
    return data as BuilderHubUser;
  }

  /**
   * Login or create user from Builder Hub authentication.
   * This is the main entry point when a user authenticates via Builder Hub popup.
   *
   * Flow:
   * 1. Validate the Builder Hub JWT
   * 2. Find or create user in our database
   * 3. Sync profile data from Builder Hub
   * 4. Generate our own access + refresh tokens
   * 5. Create session
   */
  async loginWithBuilderHub(params: {
    builderHubToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    isNewUser: boolean;
  }> {
    // 1. Validate Builder Hub token
    const bhUser = await this.validateBuilderHubToken(params.builderHubToken);

    if (!bhUser.email) {
      throw new AppError('VALIDATION_ERROR', 'Email not provided by Builder Hub');
    }

    // 2. Find or create user
    let user = await db.user.findUnique({
      where: { email: bhUser.email.toLowerCase() },
      include: { authAccounts: true },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user from Builder Hub data
      isNewUser = true;
      const username = await generateUsername(bhUser.name || bhUser.email.split('@')[0]);

      user = await db.user.create({
        data: {
          email: bhUser.email.toLowerCase(),
          displayName: bhUser.name || bhUser.email.split('@')[0],
          username,
          avatarUrl: bhUser.image || bhUser.avatar || null,
          emailVerified: true, // Verified by Builder Hub
          emailVerifiedAt: new Date(),
          authAccounts: {
            create: {
              provider: 'builder_hub',
              providerId: bhUser.id,
              email: bhUser.email,
            },
          },
        },
        include: { authAccounts: true },
      });

      await auditService.log({
        userId: user.id,
        module: 'auth',
        action: 'auth.signup.builder_hub',
        entityType: 'user',
        entityId: user.id,
        entityName: user.displayName,
        details: {
          authentication_mode: bhUser.authentication_mode,
          builder_hub_id: bhUser.id,
        },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } else {
      // Update existing user — sync avatar/name if changed
      const updates: Record<string, unknown> = {};
      if (bhUser.image && !user.avatarUrl) updates.avatarUrl = bhUser.image;
      if (bhUser.name && bhUser.name !== user.displayName && !user.displayName) {
        updates.displayName = bhUser.name;
      }

      if (Object.keys(updates).length > 0) {
        await db.user.update({
          where: { id: user.id },
          data: updates,
        });
      }

      // Ensure Builder Hub auth account exists
      const hasAccount = user.authAccounts.some(a => a.provider === 'builder_hub');
      if (!hasAccount) {
        await db.authAccount.create({
          data: {
            userId: user.id,
            provider: 'builder_hub',
            providerId: bhUser.id,
            email: bhUser.email,
          },
        });
      }
    }

    // 3. Generate tokens and create session
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken();

    await this.createSession({
      userId: user.id,
      refreshToken,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    // 4. Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await auditService.log({
      userId: user.id,
      module: 'auth',
      action: 'auth.login.builder_hub',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: this.buildAuthUser(user),
      isNewUser,
    };
  }

  // ----------------------------------------------------------
  // Email/Password Auth (Fallback / Internal)
  // ----------------------------------------------------------

  /**
   * Register a new user with email + password.
   */
  async signup(params: {
    email: string;
    password: string;
    displayName: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ userId: string; message: string }> {
    const email = params.email.toLowerCase().trim();

    // Check if email already exists
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new AppError('CONFLICT', 'An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(params.password, AUTH.BCRYPT_ROUNDS);

    // Generate username
    const username = await generateUsername(params.displayName);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        displayName: params.displayName,
        username,
      },
    });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    await db.authEmailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + AUTH.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    // TODO: Send verification email via SendGrid/Resend
    console.log(`[EMAIL] Verification link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`);

    await auditService.log({
      userId: user.id,
      module: 'auth',
      action: 'auth.signup.email',
      entityType: 'user',
      entityId: user.id,
      entityName: user.displayName,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { userId: user.id, message: 'Check your email to verify your account' };
  }

  /**
   * Login with email + password.
   */
  async login(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    requires2fa?: boolean;
    tempToken?: string;
  }> {
    const email = params.email.toLowerCase().trim();

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        authAccounts: true,
        platformAdmin: true,
        moduleLead: { where: { isActive: true } },
      },
    });

    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Check if this is an OAuth-only user
    if (!user.passwordHash) {
      const providers = user.authAccounts.map(a => a.provider).join(', ');
      throw new AppError(
        'INVALID_CREDENTIALS',
        `This account uses ${providers} authentication. Please log in with that method.`
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(params.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Check email verified
    if (!user.emailVerified) {
      throw new AppError('EMAIL_NOT_VERIFIED', 'Please verify your email first');
    }

    // Check account status
    if (!user.isActive) {
      if (user.deactivatedAt) {
        throw new AppError('ACCOUNT_DEACTIVATED', 'Account is deactivated');
      }
      if (user.deletionRequestedAt) {
        throw new AppError('ACCOUNT_DELETED', 'Account is scheduled for deletion');
      }
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { userId: user.id, purpose: '2fa' },
        process.env.JWT_SECRET!,
        { expiresIn: '5m' }
      );
      return {
        accessToken: '',
        refreshToken: '',
        user: this.buildAuthUser(user),
        requires2fa: true,
        tempToken,
      };
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken();

    await this.createSession({
      userId: user.id,
      refreshToken,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await auditService.log({
      userId: user.id,
      module: 'auth',
      action: 'auth.login.email',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: this.buildAuthUser(user),
    };
  }

  // ----------------------------------------------------------
  // Email Verification
  // ----------------------------------------------------------

  async verifyEmail(token: string): Promise<{ message: string }> {
    const verification = await db.authEmailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      throw new AppError('TOKEN_INVALID', 'Invalid verification token');
    }

    if (verification.verifiedAt) {
      throw new AppError('CONFLICT', 'Email already verified');
    }

    if (new Date() > verification.expiresAt) {
      throw new AppError('TOKEN_EXPIRED', 'Verification token has expired');
    }

    await db.$transaction([
      db.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      db.authEmailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  // ----------------------------------------------------------
  // Password Reset
  // ----------------------------------------------------------

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Always return success to avoid email enumeration
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await db.authPasswordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + AUTH.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000),
        },
      });

      // TODO: Send password reset email
      console.log(`[EMAIL] Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`);
    }

    return { message: 'If an account with that email exists, we sent a reset link' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const reset = await db.authPasswordReset.findUnique({
      where: { token },
    });

    if (!reset) {
      throw new AppError('TOKEN_INVALID', 'Invalid reset token');
    }

    if (reset.usedAt) {
      throw new AppError('CONFLICT', 'Reset token already used');
    }

    if (new Date() > reset.expiresAt) {
      throw new AppError('TOKEN_EXPIRED', 'Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, AUTH.BCRYPT_ROUNDS);

    await db.$transaction([
      db.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      db.authPasswordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all sessions
      db.authSession.updateMany({
        where: { userId: reset.userId, isActive: true },
        data: { isActive: false },
      }),
    ]);

    await auditService.log({
      userId: reset.userId,
      module: 'auth',
      action: 'auth.password.reset',
      severity: 'sensitive',
    });

    return { message: 'Password reset successfully. Please log in.' };
  }

  // ----------------------------------------------------------
  // Token Refresh
  // ----------------------------------------------------------

  async refreshTokens(currentRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // Find active session
    const session = await db.authSession.findUnique({
      where: { refreshToken: currentRefreshToken },
      include: { user: true },
    });

    if (!session || !session.isActive) {
      throw new AppError('TOKEN_INVALID', 'Invalid refresh token');
    }

    if (new Date() > session.expiresAt) {
      // Expire the session
      await db.authSession.update({
        where: { id: session.id },
        data: { isActive: false },
      });
      throw new AppError('TOKEN_EXPIRED', 'Refresh token expired');
    }

    // Rotate: invalidate old, create new
    const newRefreshToken = this.generateRefreshToken();

    await db.$transaction([
      db.authSession.update({
        where: { id: session.id },
        data: { isActive: false },
      }),
      db.authSession.create({
        data: {
          userId: session.userId,
          refreshToken: newRefreshToken,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          expiresAt: new Date(
            Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || AUTH.REFRESH_TOKEN_EXPIRY_DAYS) * 24 * 60 * 60 * 1000
          ),
        },
      }),
    ]);

    const accessToken = this.generateAccessToken(session.userId, session.user.email);

    return { accessToken, refreshToken: newRefreshToken };
  }

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------

  async logout(refreshToken: string): Promise<void> {
    await db.authSession.updateMany({
      where: { refreshToken },
      data: { isActive: false },
    });
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await db.authSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    await auditService.log({
      userId,
      module: 'auth',
      action: 'auth.logout.all',
      severity: 'sensitive',
    });
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  private generateAccessToken(userId: string, email: string): string {
    const expiresIn = process.env.JWT_EXPIRES_IN || AUTH.ACCESS_TOKEN_EXPIRY;
    return jwt.sign(
      { userId, email } as TokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private async createSession(params: {
    userId: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    // Enforce max sessions limit
    const activeSessions = await db.authSession.count({
      where: { userId: params.userId, isActive: true },
    });

    if (activeSessions >= AUTH.MAX_SESSIONS_PER_USER) {
      // Remove oldest session
      const oldest = await db.authSession.findFirst({
        where: { userId: params.userId, isActive: true },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) {
        await db.authSession.update({
          where: { id: oldest.id },
          data: { isActive: false },
        });
      }
    }

    await db.authSession.create({
      data: {
        userId: params.userId,
        refreshToken: params.refreshToken,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt: new Date(
          Date.now() + (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || AUTH.REFRESH_TOKEN_EXPIRY_DAYS) * 24 * 60 * 60 * 1000
        ),
      },
    });
  }

  private buildAuthUser(user: {
    id: string;
    email: string;
    displayName: string;
    username: string | null;
    avatarUrl: string | null;
    level: number;
    totalXp: number;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    platformAdmin?: { role: string } | null;
    moduleLead?: Array<{ module: string; isActive: boolean }>;
  }): AuthUser {
    const moduleRoles: Record<string, string> = {};
    if (user.moduleLead) {
      for (const lead of user.moduleLead) {
        if (lead.isActive) moduleRoles[lead.module] = 'lead';
      }
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      level: user.level,
      totalXp: user.totalXp,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      platformRole: (user.platformAdmin?.role as 'super_super_admin' | 'super_admin') ?? null,
      moduleRoles,
      modulePermissions: {},
    };
  }
}

// ============================================================
// Types for Builder Hub Integration
// ============================================================

interface BuilderHubUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  avatar?: string;
  user_name?: string;
  authentication_mode?: string;
  custom_attributes?: string[];
}

export const authService = new AuthService();
