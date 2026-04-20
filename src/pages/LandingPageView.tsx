import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { getBaseUrl } from '../utils/getBaseUrl';

interface LandingPage {
  id: string;
  title: string;
  headline: string;
  tagline: string;
  mediaUrl: string;
  showMedia: boolean;
  bodyContent: string;
  buttonLabel: string;
  buttonLink: string;
  formUrl: string;
  whatsappMessage: string;
  whatsappNumber: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  views: number;
  submissions: number;
  showForm: boolean;
  pixelId: string;
  additionalLinks: Array<{ id: string; label: string; url: string; description: string }>;
  logoUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  showLogo: boolean;
  // New feature fields
  shareImage?: string;
  shareTitle?: string;
  shareDesc?: string;
  conversionEvents?: string[];
  scrollDepthThresholds?: number[];
}

// ─── UTM helper ───────────────────────────────────────────────────────────────
function getUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const result: Record<string, string> = {};
  keys.forEach(k => { const v = params.get(k); if (v) result[k] = v; });
  return result;
}

// ─── Pixel fire helper ────────────────────────────────────────────────────────
function firePixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, params || {});
  }
}

const LandingPageView: React.FC = () => {
  const { landingId } = useParams();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [utmParams] = useState<Record<string, string>>(getUtmParams());
  const scrollFired = useRef<Set<number>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  // ─── Meta Pixel Loader ──────────────────────────────────────────────────
  useEffect(() => {
    if (!landingPage?.pixelId) return;
    const existingPixels = document.querySelectorAll('script[data-meta-pixel]');
    existingPixels.forEach(el => el.remove());

    const script = document.createElement('script');
    script.setAttribute('data-meta-pixel', 'true');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${landingPage.pixelId}');
      fbq('track','PageView');
    `;
    document.head.appendChild(script);
    return () => { document.querySelectorAll('script[data-meta-pixel]').forEach(el => el.remove()); };
  }, [landingPage?.pixelId]);

  // ─── Scroll Depth tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (!landingPage) return;
    const thresholds = landingPage.scrollDepthThresholds?.length ? landingPage.scrollDepthThresholds : [25, 50, 75, 100];

    const onScroll = () => {
      const scrolled = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      thresholds.forEach(t => {
        if (scrolled >= t && !scrollFired.current.has(t)) {
          scrollFired.current.add(t);
          firePixel('ViewContent', { scroll_depth: t, content_name: landingPage.title });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [landingPage]);

  // ─── OG / social meta tags ──────────────────────────────────────────────
  useEffect(() => {
    if (!landingPage) return;
    document.title = landingPage.shareTitle || landingPage.title;

    const set = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr === 'content' ? 'property' : 'name', sel.replace(/.*["']([^"']+)["'].*/, '$1')); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };

    const img = landingPage.shareImage || landingPage.mediaUrl || `${getBaseUrl()}/default-preview.svg`;
    const title = landingPage.shareTitle || landingPage.title;
    const desc = landingPage.shareDesc || landingPage.tagline;

    // OG
    [['og:title', title], ['og:description', desc], ['og:image', img], ['og:url', window.location.href], ['og:type', 'website'], ['og:site_name', 'AdParlay']].forEach(([p, v]) => {
      let el = document.querySelector(`meta[property="${p}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', p); document.head.appendChild(el); }
      el.setAttribute('content', v);
    });

    // Twitter
    [['twitter:card', 'summary_large_image'], ['twitter:title', title], ['twitter:description', desc], ['twitter:image', img]].forEach(([n, v]) => {
      let el = document.querySelector(`meta[name="${n}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', n); document.head.appendChild(el); }
      el.setAttribute('content', v);
    });

    let descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!descEl) { descEl = document.createElement('meta'); descEl.setAttribute('name', 'description'); document.head.appendChild(descEl); }
    descEl.setAttribute('content', desc);
  }, [landingPage]);

  // ─── Fetch landing page ──────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      if (!landingId) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'landingPages', landingId));
        if (snap.exists()) {
          const d = snap.data();
          setLandingPage({
            id: snap.id,
            title: d.title || '',
            headline: d.headline || '',
            tagline: d.tagline || '',
            mediaUrl: d.mediaUrl || '',
            showMedia: d.showMedia !== undefined ? d.showMedia : true,
            bodyContent: d.bodyContent || '',
            buttonLabel: d.buttonLabel || 'Join Now',
            buttonLink: d.buttonLink || '',
            formUrl: d.formUrl || '',
            whatsappMessage: d.whatsappMessage || '',
            whatsappNumber: d.whatsappNumber || '',
            primaryColor: d.primaryColor || '#3B82F6',
            secondaryColor: d.secondaryColor || '#1F2937',
            fontFamily: d.fontFamily || 'Inter',
            userId: d.userId || '',
            createdAt: d.createdAt?.toDate() || new Date(),
            updatedAt: d.updatedAt?.toDate() || new Date(),
            status: d.status || 'draft',
            views: d.views || 0,
            submissions: d.submissions || 0,
            showForm: d.showForm !== undefined ? d.showForm : true,
            pixelId: d.pixelId || '',
            additionalLinks: d.additionalLinks || [],
            logoUrl: d.logoUrl || '',
            logoPosition: d.logoPosition || 'left',
            showLogo: d.showLogo !== undefined ? d.showLogo : false,
            shareImage: d.shareImage || '',
            shareTitle: d.shareTitle || '',
            shareDesc: d.shareDesc || '',
            conversionEvents: d.conversionEvents || [],
            scrollDepthThresholds: d.scrollDepthThresholds || [25, 50, 75, 100],
          });
          await updateDoc(doc(db, 'landingPages', snap.id), { views: (d.views || 0) + 1 });
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetch();
  }, [landingId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landingPage) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const leadData: Record<string, string> = {
      landingPageId: landingPage.id,
      landingPageTitle: landingPage.title,
      submittedAt: new Date().toISOString(),
      ...utmParams,
    };
    formData.forEach((v, k) => { leadData[k] = String(v); });

    try {
      await addDoc(collection(db, 'leads'), leadData);
      await updateDoc(doc(db, 'landingPages', landingPage.id), { submissions: (landingPage.submissions || 0) + 1, updatedAt: new Date() });
      firePixel('Lead', { content_name: landingPage.title, ...utmParams });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    }
  };

  const handleButtonClick = () => {
    if (!landingPage) return;
    firePixel('InitiateCheckout', { content_name: landingPage.buttonLabel, ...utmParams });
  };

  const convertToYouTubeEmbed = (url: string): string => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/];
    for (const p of patterns) {
      const m = url.match(p);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&playsinline=1`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600">This landing page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const whatsappLink = landingPage.whatsappNumber
    ? `https://wa.me/${landingPage.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(landingPage.whatsappMessage)}`
    : '#';

  return (
    <div className="min-h-screen" style={{ fontFamily: landingPage.fontFamily }}>
      {/* UTM badge (dev hint, invisible in prod) */}
      {Object.keys(utmParams).length > 0 && (
        <div className="sr-only" aria-hidden="true" data-utm={JSON.stringify(utmParams)} />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center py-24 px-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${landingPage.primaryColor}08, ${landingPage.secondaryColor}08)` }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${landingPage.primaryColor}15 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${landingPage.secondaryColor}15 0%, transparent 50%)` }} />
          <div className="relative z-10">
            {landingPage.showLogo && landingPage.logoUrl && (
              <div className={`mb-8 ${landingPage.logoPosition === 'left' ? 'text-left' : landingPage.logoPosition === 'right' ? 'text-right' : 'text-center'}`}>
                <img src={landingPage.logoUrl} alt="Logo" className="inline-block max-h-20 max-w-48 object-contain" loading="lazy" />
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight" style={{ color: landingPage.primaryColor }}>{landingPage.headline}</h1>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto opacity-90" style={{ color: landingPage.secondaryColor }}>{landingPage.tagline}</p>
          </div>
        </div>

        {/* Media - lazy loaded */}
        {landingPage.showMedia && landingPage.mediaUrl && (
          <div className="py-20 px-6 text-center">
            <div className="max-w-5xl mx-auto">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                {(() => {
                  const url = landingPage.mediaUrl;
                  if (url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return <img src={url} alt="Campaign Media" className="w-full h-auto" loading="lazy" decoding="async" />;
                  }
                  if (url.startsWith('data:video/') || url.match(/\.(mp4|webm|mov)$/i)) {
                    return <video src={url} controls autoPlay muted loop playsInline preload="none" className="w-full h-auto" />;
                  }
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    return <iframe src={convertToYouTubeEmbed(url)} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full aspect-video" loading="lazy" title="Video" />;
                  }
                  return <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg"><p className="text-gray-500">Unsupported media format</p></div>;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block text-left p-8 rounded-2xl" style={{ background: `${landingPage.primaryColor}05`, border: `1px solid ${landingPage.primaryColor}15` }}>
              <div className="whitespace-pre-line text-lg leading-relaxed" style={{ color: landingPage.secondaryColor }}>{landingPage.bodyContent}</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-24 px-6 text-center text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${landingPage.primaryColor}, ${landingPage.primaryColor}ee)` }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{landingPage.buttonLabel}</h2>

            {landingPage.showForm && landingPage.formUrl ? (
              <div className="max-w-2xl mx-auto">
                <iframe src={`${getBaseUrl()}/form/${landingPage.formUrl}`} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '12px' }} title="Embedded Form" loading="lazy" />
              </div>
            ) : landingPage.showForm ? (
              !submitted ? (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
                    <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Full Name</label>
                          <input name="name" type="text" required className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-all" placeholder="Enter your full name" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Email Address</label>
                          <input name="email" type="email" required className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-all" placeholder="Enter your email" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input name="phone" type="tel" className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500 transition-all" placeholder="Enter your phone number" />
                      </div>
                      {/* Hidden UTM fields */}
                      {Object.entries(utmParams).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <button type="submit" className="w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all transform hover:scale-[1.02] hover:shadow-lg focus:outline-none" style={{ background: landingPage.primaryColor, color: 'white', boxShadow: `0 4px 14px ${landingPage.primaryColor}30` }}>
                          {landingPage.buttonLabel}
                        </button>
                        {landingPage.whatsappNumber && (
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={handleButtonClick} className="w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all transform hover:scale-[1.02] bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: landingPage.primaryColor }}>Thank You!</h3>
                    <p className="text-gray-600 mb-6">Your submission has been received. We'll be in touch soon!</p>
                    <a href="/register" className="inline-block px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105" style={{ background: landingPage.primaryColor, color: 'white' }}>
                      Build Your Own Page on AdParlay
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-auto">
                <div className="space-y-4">
                  {landingPage.buttonLink && (
                    <a href={landingPage.buttonLink} target="_blank" rel="noopener noreferrer" onClick={handleButtonClick} className="block w-full px-8 py-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 hover:shadow-xl" style={{ background: landingPage.primaryColor, color: 'white' }}>
                      {landingPage.buttonLabel}
                    </a>
                  )}
                  {landingPage.whatsappNumber && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" onClick={handleButtonClick} className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Links */}
        {landingPage.additionalLinks?.length > 0 && (
          <div className="py-20 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12" style={{ color: landingPage.primaryColor }}>Additional Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {landingPage.additionalLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={handleButtonClick} className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: landingPage.primaryColor }}>{link.label}</h3>
                    {link.description && <p className="text-gray-600 text-sm">{link.description}</p>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageView;
