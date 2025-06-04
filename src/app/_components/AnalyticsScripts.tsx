'use client';

import Script from 'next/script';

const isProdTracking = process.env.NEXT_PUBLIC_ANALYTICS_TRACKING_ENV === 'production';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const HOTJAR_VERSION = process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function AnalyticsScripts() {
  if (!isProdTracking) return null;

  return (
    <>
      {/* ✅ Google Analytics */}

      {GA_ID && (
        <>
          <Script
            id='google-analytics'
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id='google-analytics-gtag' strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {/* ✅ Hotjar */}
      {HOTJAR_ID && HOTJAR_VERSION && (
        <Script id='hotjar' strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${HOTJAR_ID},hjsv:${HOTJAR_VERSION}};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}

      {/* ✅ Microsoft Clarity */}
      {CLARITY_ID && (
        <Script id='microsoft-clarity' strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}
    </>
  );
}
