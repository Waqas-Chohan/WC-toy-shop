import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import { getAdminUserId } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const supabase = getServerSupabase();
    const adminUserId = await getAdminUserId(supabase, request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) || 'products';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${folder}/${fileName}`;
    const bucket = 'toyshop-images';

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
