"""
Add 5 features to LandingPageView.tsx:
1. UTM capture  2. Conversion events (scroll, click, submit)
3. OG social preview fields  4. Lazy images  5. Drop-off hooks
"""

with open('src/pages/LandingPageView.tsx', 'r') as f:
    src = f.read()

# 1. Extend the LandingPage interface with new fields
old_iface_end = """  logoUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  showLogo: boolean;
}"""
new_iface_end = """  logoUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  showLogo: boolean;
  // OG / social preview
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  // Conversion events
  conversionEvents?: {
    scrollDepth: boolean;
    buttonClick: boolean;
    formSubmit: boolean;
  };
  // UTM capture
  captureUtm?: boolean;
}"""
src = src.replace(old_iface_end, new_iface_end)

# 2. Add UTM + conversion + scroll tracking hooks after the pixel useEffect
utm_and_events_hook = """
  // UTM parameter capture
  const [utmData, setUtmData] = React.useRef<Record<string,string>>({});
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string,string> = {};
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });
    // persist in sessionStorage so embedded forms can read it
    if (Object.keys(utm).length) {
      sessionStorage.setItem('ap_utm', JSON.stringify(utm));
    }
    utmData.current = JSON.parse(sessionStorage.getItem('ap_utm') || '{}');
  }, []);

  // Scroll-depth conversion events
  useEffect(() => {
    if (!landingPage?.pixelId || !landingPage?.conversionEvents?.scrollDepth) return;
    const fired = new Set<number>();
    const thresholds = [25, 50, 75, 100];
    const onScroll = () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      thresholds.forEach(t => {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          (window as any).fbq?.('trackCustom', 'ScrollDepth', { depth: t });
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [landingPage]);

  // Button click event
  const fireButtonClick = () => {
    if (landingPage?.pixelId && landingPage?.conversionEvents?.buttonClick) {
      (window as any).fbq?.('trackCustom', 'CTAClick', { label: landingPage.buttonLabel });
    }
  };

"""

# Insert right after the existing pixel useEffect closing
old_hook_end = "  }, [landingPage?.pixelId]);\n\n  // Utility function"
new_hook_end = "  }, [landingPage?.pixelId]);\n" + utm_and_events_hook + "  // Utility function"
src = src.replace(old_hook_end, new_hook_end)

# 3. Extend handleFormSubmit to attach UTM data to Firestore + fire custom pixel event
old_submit_track = """      // Trigger Meta Pixel Lead event
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead');
        console.log('Meta Pixel Lead event fired for pixel:', landingPage.pixelId);
      } else if (landingPage.pixelId) {
        // Fallback if fbq isn't loaded yet
        console.warn('Meta Pixel not loaded, Lead event will not be tracked');
      }"""
new_submit_track = """      // Trigger Meta Pixel Lead event + conversion events
      if (typeof window !== 'undefined' && (window as any).fbq) {
        const utm = JSON.parse(sessionStorage.getItem('ap_utm') || '{}');
        (window as any).fbq('track', 'Lead', utm);
        if (landingPage?.conversionEvents?.formSubmit) {
          (window as any).fbq('trackCustom', 'FormComplete', { page: landingPage.title, ...utm });
        }
      }"""
src = src.replace(old_submit_track, new_submit_track)

# 4. Extend Firestore write in handleFormSubmit to include UTM data
old_firestore_write = """      const docRef = doc(db, 'landingPages', landingPage.id);
      await updateDoc(docRef, {
        submissions: (landingPage.submissions || 0) + 1,
        updatedAt: new Date()
      });"""
new_firestore_write = """      const docRef = doc(db, 'landingPages', landingPage.id);
      const utm = JSON.parse(sessionStorage.getItem('ap_utm') || '{}');
      await updateDoc(docRef, {
        submissions: (landingPage.submissions || 0) + 1,
        updatedAt: new Date(),
        lastLeadUtm: utm,
        lastLeadAt: new Date()
      });"""
src = src.replace(old_firestore_write, new_firestore_write)

# 5. OG social preview — update the useEffect to use custom ogTitle/ogImage if set
old_og = "      updateMetaTag('og:title', landingPage.title);\n      updateMetaTag('og:description', landingPage.tagline);"
new_og = """      updateMetaTag('og:title', landingPage.ogTitle || landingPage.title);
      updateMetaTag('og:description', landingPage.ogDescription || landingPage.tagline);"""
src = src.replace(old_og, new_og)

old_og_img = "      const previewImage = landingPage.mediaUrl || `${getBaseUrl()}/default-preview.svg`;"
new_og_img = "      const previewImage = landingPage.ogImage || landingPage.mediaUrl || `${getBaseUrl()}/default-preview.svg`;"
src = src.replace(old_og_img, new_og_img)

old_tw = "      updateMetaName('twitter:title', landingPage.title);\n      updateMetaName('twitter:description', landingPage.tagline);"
new_tw = """      updateMetaName('twitter:title', landingPage.ogTitle || landingPage.title);
      updateMetaName('twitter:description', landingPage.ogDescription || landingPage.tagline);"""
src = src.replace(old_tw, new_tw)

# 6. Lazy-load images (add loading="lazy" and decoding="async")
src = src.replace(
    'className="w-full h-auto"\n                      />\n                     );\n                  }\n                  \n                  if (url.startsWith(\'data:video/\'))',
    'className="w-full h-auto" loading="lazy" decoding="async"\n                      />\n                     );\n                  }\n                  \n                  if (url.startsWith(\'data:video/\'))'
)
src = src.replace(
    'src={url} \n                        alt="Campaign Media" \n                        className="w-full h-auto"\n                      />',
    'src={url} \n                        alt="Campaign Media" \n                        className="w-full h-auto" loading="lazy" decoding="async"\n                      />'
)

# 7. Fire button click event on the CTA buttons
src = src.replace(
    'href={landingPage.buttonLink}\n                              target="_blank"\n                              rel="noopener noreferrer"\n                              className="inline-block px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-xl"',
    'href={landingPage.buttonLink}\n                              target="_blank"\n                              rel="noopener noreferrer"\n                              onClick={fireButtonClick}\n                              className="inline-block px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 hover:shadow-xl"'
)

# 8. Add React import if not already using useRef
src = src.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
)
# Fix the utmData ref
src = src.replace(
    "  const [utmData, setUtmData] = React.useRef<Record<string,string>>({});",
    "  const utmData = useRef<Record<string,string>>({});"
)

with open('src/pages/LandingPageView.tsx', 'w') as f:
    f.write(src)
print("LandingPageView.tsx updated")
