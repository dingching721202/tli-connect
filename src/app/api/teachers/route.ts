import { NextRequest, NextResponse } from 'next/server';

// Temporary mock data for testing while we fix Supabase connection
const mockTeachers = [
  {
    id: '1',
    name: 'Jennifer Smith',
    email: 'jennifer@tliconnect.com',
    phone: '+886-2-1234-5678',
    status: 'active',
    teaching_hours: 800,
    rating: 4.8,
    total_students: 250,
    completed_courses: 120,
    created_at: '2024-01-01T00:00:00+00:00'
  },
  {
    id: '2',
    name: '王老師',
    email: 'teacher@example.com',
    phone: '+886-2-2345-6789',
    status: 'active',
    teaching_hours: 620,
    rating: 4.6,
    total_students: 180,
    completed_courses: 95,
    created_at: '2024-01-15T00:00:00+00:00'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael@tliconnect.com',
    phone: '+886-2-3456-7890',
    status: 'active',
    teaching_hours: 920,
    rating: 4.9,
    total_students: 300,
    completed_courses: 145,
    created_at: '2024-02-01T00:00:00+00:00'
  }
];

export async function GET(_request: NextRequest) {
  try {
    // For now, return mock data to test the dashboard
    // TODO: Fix Supabase connection and replace with real data
    return NextResponse.json({
      success: true,
      data: mockTeachers
    });
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}