import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase client (server-side, uses service role if available) ────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ─── In-memory fallback for local dev (no Supabase configured) ───────────────
const localSessions = new Map();

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

const TTL_MS = 10 * 60 * 1000; // 10 minutos

// ─── POST: create new QR session (called by smartwatch) ──────────────────────
export async function POST() {
  const token = generateToken();
  const createdAt = new Date().toISOString();

  if (supabase) {
    // Delete expired sessions older than 20 minutes first
    await supabase
      .from('qr_sessions')
      .delete()
      .lt('created_at', new Date(Date.now() - 20 * 60 * 1000).toISOString());

    const { error } = await supabase
      .from('qr_sessions')
      .insert([{ token, status: 'pending', user_id: null, created_at: createdAt }]);

    if (error) {
      console.error('Supabase QR session insert error:', error);
      // Fallback to memory
      localSessions.set(token, { status: 'pending', userId: null, createdAt: Date.now() });
    }
  } else {
    localSessions.set(token, { status: 'pending', userId: null, createdAt: Date.now() });
  }

  return NextResponse.json({ token, expiresInSeconds: 600 });
}

// ─── GET: check session status (polled by smartwatch) ────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  if (supabase) {
    const { data, error } = await supabase
      .from('qr_sessions')
      .select('status, user_id, created_at')
      .eq('token', token)
      .single();

    if (error || !data) return NextResponse.json({ status: 'expired' });

    const ageMs = Math.abs(Date.now() - new Date(data.created_at).getTime());
    if (ageMs > TTL_MS) {
      await supabase.from('qr_sessions').delete().eq('token', token);
      return NextResponse.json({ status: 'expired' });
    }

    return NextResponse.json({ status: data.status, userId: data.user_id });
  }

  // Local memory fallback
  const session = localSessions.get(token);
  if (!session) return NextResponse.json({ status: 'expired' });
  if (Date.now() - session.createdAt > TTL_MS) {
    localSessions.delete(token);
    return NextResponse.json({ status: 'expired' });
  }
  return NextResponse.json({ status: session.status, userId: session.userId });
}

// ─── PUT: web confirms the QR token ──────────────────────────────────────────
export async function PUT(request) {
  const body = await request.json();
  const { token, userId } = body;
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  if (supabase) {
    const { data, error } = await supabase
      .from('qr_sessions')
      .select('status, created_at')
      .eq('token', token)
      .single();

    if (error || !data) return NextResponse.json({ success: false, error: 'Token expired or invalid' });

    const ageMs = Math.abs(Date.now() - new Date(data.created_at).getTime());
    if (ageMs > TTL_MS) {
      await supabase.from('qr_sessions').delete().eq('token', token);
      return NextResponse.json({ success: false, error: 'Token expired' });
    }

    if (data.status === 'confirmed') {
      return NextResponse.json({ success: false, error: 'Token already used' });
    }

    const { error: updateError } = await supabase
      .from('qr_sessions')
      .update({ status: 'confirmed', user_id: userId || 'guest' })
      .eq('token', token);

    if (updateError) {
      console.error('Supabase QR session update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to confirm session' });
    }

    return NextResponse.json({ success: true, userId: userId || 'guest' });
  }

  // Local memory fallback
  const session = localSessions.get(token);
  if (!session) return NextResponse.json({ success: false, error: 'Token expired or invalid' });
  if (Date.now() - session.createdAt > TTL_MS) {
    localSessions.delete(token);
    return NextResponse.json({ success: false, error: 'Token expired' });
  }
  if (session.status === 'confirmed') {
    return NextResponse.json({ success: false, error: 'Token already used' });
  }
  session.status = 'confirmed';
  session.userId = userId || 'guest';
  return NextResponse.json({ success: true, userId: session.userId });
}
