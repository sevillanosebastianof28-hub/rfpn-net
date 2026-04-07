import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

function getPageKey(pathname: string): string {
  if (pathname === '/') return 'homepage';
  const slug = pathname.replace(/^\//, '').split('/')[0];
  return slug || 'homepage';
}

export function TrackingScriptInjector() {
  const location = useLocation();

  useEffect(() => {
    const inject = async () => {
      const pageKey = getPageKey(location.pathname);

      const { data: codes } = await supabase
        .from('tracking_codes')
        .select('*')
        .eq('is_active', true);

      if (!codes) return;

      const relevant = codes.filter(
        c => c.target_page === 'all' || c.target_page === pageKey
      );

      for (const code of relevant) {
        // Skip GTM — it's installed statically in index.html
        if (code.provider_type === 'google_tag_manager') continue;

        if (code.code_snippet) {
          injectSnippet(code.code_snippet, code.placement);
        } else if (code.tracking_id && code.provider_type === 'google_ads') {
          injectGoogleAds(code.tracking_id, code.placement);
        } else if (code.tracking_id && code.provider_type === 'meta_pixel') {
          injectMetaPixel(code.tracking_id);
        }
      }
    };

    inject();
  }, [location.pathname]);

  return null;
}

function injectSnippet(snippet: string, placement: string) {
  const container = document.createElement('div');
  container.innerHTML = snippet;

  const target = placement === 'head' ? document.head
    : placement === 'body_start' ? document.body
    : document.body;

  const nodes = Array.from(container.childNodes);
  for (const node of nodes) {
    if (node instanceof HTMLScriptElement) {
      const s = document.createElement('script');
      if (node.src) s.src = node.src;
      if (node.textContent) s.textContent = node.textContent;
      node.getAttributeNames().forEach(a => {
        if (a !== 'src') s.setAttribute(a, node.getAttribute(a)!);
      });
      if (placement === 'body_start') {
        target.insertBefore(s, target.firstChild);
      } else {
        target.appendChild(s);
      }
    } else {
      if (placement === 'body_start') {
        target.insertBefore(node, target.firstChild);
      } else {
        target.appendChild(node);
      }
    }
  }
}

function injectGoogleAds(trackingId: string, placement: string) {
  const snippet = `<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${trackingId}');</script>`;
  injectSnippet(snippet, placement);
}

function injectMetaPixel(pixelId: string) {
  const snippet = `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');</script>`;
  injectSnippet(snippet, 'head');
}
