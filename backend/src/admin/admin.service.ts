import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProfileService } from '../profile/profile.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly adminStorePath = path.join(__dirname, '..', '..', 'admin-store.json');
  private readonly subStorePath = path.join(__dirname, '..', '..', 'subscription-store.json');

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly profileService: ProfileService,
  ) {}

  /**
   * Returns aggregated platform statistics for the administrator.
   */
  async getStats() {
    const adminClient = this.supabaseService.getAdminClient() ?? this.supabaseService.getClient();

    let totalUsers = 0;
    let authUsers: any[] = [];
    try {
      if (this.supabaseService.hasAdminClient()) {
        const { data } = await this.supabaseService.getAdminClient()!.auth.admin.listUsers();
        if (data?.users) {
          authUsers = data.users;
          totalUsers = data.users.length;
        }
      }
    } catch (e) {
      this.logger.warn(`Could not list auth users: ${e.message}`);
    }

    let profiles: any[] = [];
    try {
      const { data } = await adminClient.from('profiles').select('*');
      if (data) profiles = data;
    } catch (e) {
      this.logger.warn(`Could not list profiles: ${e.message}`);
    }

    if (totalUsers === 0) totalUsers = profiles.length;

    let premiumCount = 0;
    let adminCount = 0;

    profiles.forEach((p) => {
      if (p.is_premium) premiumCount++;
      const role = this.profileService.getUserRole(
        authUsers.find((u) => u.id === p.id) || { id: p.id, email: p.email },
        p.role,
      );
      if (role === 'admin') adminCount++;
    });

    return {
      overview: {
        totalUsers,
        premiumUsers: premiumCount,
        freeUsers: Math.max(0, totalUsers - premiumCount),
        adminsCount: adminCount,
      },
      revenue: {
        currency: 'USD',
        estimatedMRR: premiumCount * 5.0,
      },
      system: {
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        serverUptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Returns all users with their full profile and role information.
   */
  async getUsers() {
    const adminClient = this.supabaseService.getAdminClient() ?? this.supabaseService.getClient();

    let authUsers: any[] = [];
    if (this.supabaseService.hasAdminClient()) {
      try {
        const { data } = await this.supabaseService.getAdminClient()!.auth.admin.listUsers();
        if (data?.users) authUsers = data.users;
      } catch (e) {
        this.logger.warn(`Could not fetch auth users: ${e.message}`);
      }
    }

    let profiles: any[] = [];
    try {
      const { data } = await adminClient.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) profiles = data;
    } catch (e) {
      this.logger.warn(`Could not fetch profiles: ${e.message}`);
    }

    // Merge auth users and profiles map
    const profilesMap = new Map(profiles.map((p) => [p.id, p]));

    const result = authUsers.map((u) => {
      const p = profilesMap.get(u.id) || {};
      const role = this.profileService.getUserRole(u, p.role);
      return {
        id: u.id,
        email: u.email,
        full_name: p.full_name || [u.user_metadata?.first_name, u.user_metadata?.last_name].filter(Boolean).join(' ') || 'Utilisateur',
        avatar_url: p.avatar_url || u.user_metadata?.avatar_url || null,
        role,
        is_premium: Boolean(p.is_premium),
        plan_name: p.plan_name || 'free',
        email_confirmed: Boolean(u.email_confirmed_at),
        created_at: p.created_at || u.created_at,
        last_sign_in_at: u.last_sign_in_at || null,
      };
    });

    // If auth users listing was empty, fallback to profiles
    if (result.length === 0) {
      return profiles.map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name || 'Utilisateur',
        avatar_url: p.avatar_url,
        role: this.profileService.getUserRole({ id: p.id, email: p.email }, p.role),
        is_premium: Boolean(p.is_premium),
        plan_name: p.plan_name || 'free',
        email_confirmed: true,
        created_at: p.created_at,
        last_sign_in_at: null,
      }));
    }

    return result;
  }

  /**
   * Returns details of all active and past subscriptions.
   */
  async getSubscriptions() {
    const adminClient = this.supabaseService.getAdminClient() ?? this.supabaseService.getClient();
    let subscribers: any[] = [];
    try {
      const { data } = await adminClient
        .from('profiles')
        .select('id, email, full_name, is_premium, plan_name, created_at')
        .eq('is_premium', true);
      if (data) subscribers = data;
    } catch (_) {}

    let fallbackStore: Record<string, any> = {};
    try {
      if (fs.existsSync(this.subStorePath)) {
        fallbackStore = JSON.parse(fs.readFileSync(this.subStorePath, 'utf8'));
      }
    } catch (_) {}

    return {
      activeSubscribers: subscribers,
      totalActive: subscribers.length,
      fallbackStore,
    };
  }

  /**
   * Allows an administrator to promote or demote another user's role.
   */
  async updateUserRole(adminUser: any, targetUserId: string, newRole: 'user' | 'admin') {
    if (!['user', 'admin'].includes(newRole)) {
      throw new BadRequestException('Role invalide. Valeurs permises: user, admin.');
    }

    if (adminUser.id === targetUserId && newRole === 'user') {
      throw new BadRequestException('Vous ne pouvez pas révoquer vos propres droits administrateur.');
    }

    const adminClient = this.supabaseService.getAdminClient();
    if (!adminClient) {
      throw new BadRequestException('Service role client unavailable.');
    }

    // 1. Update Auth metadata
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(targetUserId);
    if (userError || !userData?.user) {
      throw new NotFoundException(`Utilisateur ${targetUserId} introuvable.`);
    }

    const existingAppMetadata = userData.user.app_metadata || {};
    await adminClient.auth.admin.updateUserById(targetUserId, {
      app_metadata: {
        ...existingAppMetadata,
        role: newRole,
      },
    });

    // 2. Update profiles table if possible
    try {
      await adminClient.from('profiles').update({ role: newRole }).eq('id', targetUserId);
    } catch (_) {}

    // 3. Update admin-store.json
    try {
      let store = { admins: [] as string[] };
      if (fs.existsSync(this.adminStorePath)) {
        store = JSON.parse(fs.readFileSync(this.adminStorePath, 'utf8'));
      }
      if (!Array.isArray(store.admins)) store.admins = [];

      const targetEmail = (userData.user.email || '').toLowerCase().trim();
      if (newRole === 'admin') {
        if (!store.admins.includes(targetUserId)) store.admins.push(targetUserId);
        if (targetEmail && !store.admins.includes(targetEmail)) store.admins.push(targetEmail);
      } else {
        store.admins = store.admins.filter((e) => e !== targetUserId && e !== targetEmail);
      }
      fs.writeFileSync(this.adminStorePath, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {
      this.logger.warn(`Could not sync admin store: ${e.message}`);
    }

    return {
      success: true,
      userId: targetUserId,
      role: newRole,
    };
  }
}
