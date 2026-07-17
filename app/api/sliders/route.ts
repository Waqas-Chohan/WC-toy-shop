import { getServerSupabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('sliders')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ sliders: data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('sliders')
      .insert([
        {
          title: body.title,
          subtitle: body.subtitle,
          image: body.image,
          badge: body.badge,
          cta_text: body.cta_text,
          cta_link: body.cta_link,
          display_order: body.display_order || 1,
          is_active: body.is_active !== false,
          created_by: adminUserId,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ slider: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Slider ID required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('sliders')
      .update({
        title: body.title,
        subtitle: body.subtitle,
        image: body.image,
        badge: body.badge,
        cta_text: body.cta_text,
        cta_link: body.cta_link,
        display_order: body.display_order,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ slider: data[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Slider ID required' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('sliders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
