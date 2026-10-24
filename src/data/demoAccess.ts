export const ADMIN_DEMO_ID = 'demo:admin'
export const isAdminDemo = (profileId?: string | null) =>
  profileId === ADMIN_DEMO_ID
