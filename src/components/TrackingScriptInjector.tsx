import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Map routes to target_page identifiers
function getPageKey(pathname: string): string {
  if (pathname === '/') return 'homepage';
  const slug = pathname.replace(/^\//, '').split('/')[0];
  return slug || 'homepage';
}

export function TrackingScriptInjector() {
  const location = useLocation();
  const injectedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const inject = async () => {
      const pageKey = getPageKey(location.pathname);

      const { data: codes } = await supabase
        .from('tracking_codes')
        .select('*')
        .eq('is_active', true);

      if (cancelled || !codes) return;

      // Filter codes relevant to this page
      const relevant = codes.filter(
        c => c.target_page === 'all' || c.target_page === pageKey
      );

      for (const code of relevant) {
        if (injectedIds.current.has(code.id)) continue;
        injectedIds.current.add(code.id);

        if (code.provider_type === 'google_tag_manager' && code.tracking_id) {
          injectGTM(code.tracking_id);
        } else if (code.code_snippet) {
          injectSnippet(code.code_snippet, code.placement);
        } else if (code.tracking_id && code.provider_type === 'google_ads') {
          injectGoogleAds(code.tracking_id, code.placement);
        } else if (code.tracking_id && code.provider_type === 'meta_pixel') {
          injectMetaPixel(code.tracking_id);
        }
      }
    };

    inject();
    return () => { cancelled = true; };
  }, [location.pathname]);

  return null;
}

function injectGTM(containerId: string) {
  // Head script
  if (!document.querySelector(`script[data-gtm-id="${containerId}"]`)) {
    const script = document.createElement('script');
    script.setAttribute('data-gtm-id', containerId);
    script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`;
    document.head.appendChild(script);
  }

  // Body noscript
  if (!document.querySelector(`noscript[data-gtm-ns="${containerId}"]`)) {
    const ns = document.createElement('noscript');
    ns.setAttribute('data-gtm-ns', containerId);
    ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(ns, document.body.firstChild);
  }
}

function injectSnippet(snippet: string, placement: string) {
  const container = document.createElement('div');
  container.innerHTML = snippet;

  const target = placement === 'head' ? document.head
    : placement === 'body_start' ? document.body
    : document.body;

  // Extract and re-create script elements so they execute
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
