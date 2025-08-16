import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Use the new users_with_roles view which properly handles multiple roles
    const { data: users, error: usersError } = await supabase
      .from('users_with_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    // Transform data to match expected format - no need for complex role joining now
    const transformedUsers = (users || []).map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      roles: user.roles && user.roles.length > 0 ? user.roles : ['STUDENT'], // Multiple roles support
      membership_status: 'non_member', // TODO: Add membership logic
      account_status: user.is_active ? 'ACTIVE' : 'INACTIVE',
      campus: user.campus,
      created_at: user.created_at
    }));

    return NextResponse.json({
      success: true,
      data: transformedUsers
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}