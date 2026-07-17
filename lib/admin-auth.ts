import { getServerSupabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

// Whitelist of emails allowed as admin
const ADMIN_WHITELIST = ['waqaschohan3355@gmail.com', 'f233041@cfd.nu.edu.pk'];

const isAdminEmail = (email: string) => ADMIN_WHITELIST.includes(email.toLowerCase());

/**
 * Validates admin access from request headers.
 * Checks: whitelist → user_id profile lookup → email profile lookup
 * Returns the admin user ID if authorized, or null if forbidden.
 */
export async function getAdminUserId(
  supabase: ReturnType<typeof getServerSupabase>,
  request: NextRequest | Request
): Promise<string | null> {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email')?.toLowerCase();

  // Fast path: whitelisted email
  if (userEmail && isAdminEmail(userEmail)) {
    return userId || userEmail;
  }

  // Check by user ID
  if (userId) {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!error && profile?.role === 'admin') {
      return profile.id;
    }
  }

  // Check by email
  if (userEmail) {
    const { data: profileByEmail, error: emailError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .ilike('email', userEmail)
      .single();

    if (!emailError && profileByEmail?.role === 'admin') {
      return profileByEmail.id;
    }
  }

  return null;
}

/**
 * Gets a user ID from request headers (for non-admin endpoints like cart/wishlist).
 */
export async function getUserIdFromRequest(
  supabase: ReturnType<typeof getServerSupabase>,
  req: NextRequest | Request
): Promise<string | null> {
  const headerId = req.headers.get('x-user-id');
  const headerEmail = req.headers.get('x-user-email')?.toLowerCase();

  if (headerId) return headerId;
  if (!headerEmail) return null;

  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .ilike('email', headerEmail)
    .single();

  return data?.id || null;
}