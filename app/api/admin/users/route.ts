import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { getAdminUserId } from '@/lib/admin-auth';

// GET: list all users
export async function GET(request: Request) {
  try {
    const supabase = getServerSupabase();
    const adminId = await getAdminUserId(supabase, request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: admin registers a new user (with a given role)
export async function POST(request: Request) {
  try {
    const supabase = getServerSupabase();
    const adminId = await getAdminUserId(supabase, request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 });
    }

    // Create auth user via service role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // Upsert profile (trigger might already have created it)
    await supabase.from('user_profiles').upsert({
      id: userId,
      name,
      email,
      role: role === 'admin' ? 'admin' : 'customer',
      avatar_url: `https://i.pravatar.cc/150?u=${userId}`,
    });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, name, email, role, created_at')
      .eq('id', userId)
      .single();

    return NextResponse.json({ user: profile }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: admin removes a user (by id in body)
export async function DELETE(request: Request) {
  try {
    const supabase = getServerSupabase();
    const adminId = await getAdminUserId(supabase, request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (user_id === adminId) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Delete from auth.users — cascades to user_profiles
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
