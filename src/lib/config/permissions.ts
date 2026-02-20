// ============================================================
// Module Permission Definitions
// ============================================================

export const MODULE_PERMISSIONS = {
  portal: [
    'view_members',
    'manage_members',
    'create_events',
    'manage_events',
    'create_quests',
    'manage_quests',
    'create_guides',
    'manage_guides',
    'manage_programs',
    'view_analytics',
    'manage_team',
  ],
  grants: [
    'view_applications',
    'review_applications',
    'accept_applications',
    'manage_types',
    'manage_rounds',
    'manage_milestones',
    'manage_categories',
    'manage_partner_requests',
    'view_analytics',
    'manage_team',
  ],
  bounty: [
    'view_submissions',
    'approve_submissions',
    'select_winners',
    'create_bounties',
    'edit_bounties',
    'publish_bounties',
    'manage_categories',
    'block_users',
    'manage_partner_requests',
    'view_analytics',
    'manage_team',
  ],
  ecosystem: [
    'view_submissions',
    'approve_submissions',
    'manage_projects',
    'manage_categories',
    'manage_labels',
    'manage_featured',
    'bulk_import',
    'manage_api_keys',
    'view_analytics',
    'manage_team',
  ],
  home: [
    'edit_hero',
    'edit_about',
    'manage_announcements',
    'manage_regions',
    'manage_stats',
    'manage_partners',
    'edit_footer',
    'manage_team',
  ],
} as const;

export type ModuleName = keyof typeof MODULE_PERMISSIONS;
export type ModulePermission<T extends ModuleName> = (typeof MODULE_PERMISSIONS)[T][number];
