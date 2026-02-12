import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrders } from '@/lib/api/orders';
import type { OrderFilters } from '@/types';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') as 'buyer' | 'seller' | null;

  if (!role || !['buyer', 'seller'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role parameter' }, { status: 400 });
  }

  // Get authenticated user from Supabase session (server-side)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get('status') || undefined;
  const dateFrom = request.nextUrl.searchParams.get('dateFrom') || undefined;
  const dateTo = request.nextUrl.searchParams.get('dateTo') || undefined;
  const page = Number(request.nextUrl.searchParams.get('page') || '1');
  const pageSize = Number(request.nextUrl.searchParams.get('pageSize') || '10');

  const filters: OrderFilters = { dateFrom, dateTo };
  if (status) {
    filters.status = status as OrderFilters['status'];
  }

  try {
    const result = await getOrders(
      user.id,
      role,
      filters,
      page,
      pageSize
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
