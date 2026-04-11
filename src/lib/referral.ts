import { supabase } from '@/integrations/supabase/client';

const COOKIE_NAME = 'rfpn_ref';
const STORAGE_KEY = 'rfpn_referral';
const COOKIE_DAYS = 30;

export function setReferralCookie(code: string) {
  const expires = new Date(Date.now() + COOKIE_DAYS * 86400000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(code)};expires=${expires};path=/;SameSite=Lax`;
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
}

export function getReferralCode(): string | null {
  // Try cookie first
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match) return decodeURIComponent(match[1]);
  // Fallback to localStorage
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function clearReferral() {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export async function trackClick(affiliateCode: string, landingUrl: string) {
  // Lookup affiliate
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('affiliate_code', affiliateCode)
    .eq('status', 'active')
    .maybeSingle();

  if (!affiliate) return;

  // Session dedup
  const sessionKey = `rfpn_click_${affiliateCode}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, '1');

  await supabase.from('affiliate_clicks').insert({
    affiliate_id: affiliate.id,
    landing_url: landingUrl,
    user_agent: navigator.userAgent,
    session_id: crypto.randomUUID(),
  });
}

export function captureReferralFromURL() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    setReferralCookie(ref);
    trackClick(ref, window.location.href);
    // Clean URL
    params.delete('ref');
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }
}
