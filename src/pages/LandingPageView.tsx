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
  conversionEvents?: any;
  scrollDepthThresholds?: number[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  captureUtm?: boolean;
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
  const embeddedFormRef = useRef<HTMLIFrameElement>(null);
  const [embeddedFormHeight, setEmbeddedFormHeight] = useState<number>(720);

  // ─── Meta Pixel Loader ──────────────────────────────────────────────────
  useEffect(() => {
    if (!landingPage?.pixelId) return;
    const pixelId = String(landingPage.pixelId || '').trim();
    if (!/^\d{8,20}$/.test(pixelId)) return;
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
      fbq('init','${pixelId}');
      fbq('track','PageView');
    `;
    document.head.appendChild(script);
    return () => { document.querySelectorAll('script[data-meta-pixel]').forEach(el => el.remove()); };
  }, [landingPage?.pixelId]);

  // ─── Scroll Depth tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (!landingPage) return;
    const ev = (landingPage as any).conversionEvents;
    const scrollEnabled = typeof ev === 'object' ? (ev.scrollDepth ?? true) : true;
    if (!scrollEnabled) return;
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
    document.title = landingPage.shareTitle || landingPage.ogTitle || landingPage.title;

    const set = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr === 'content' ? 'property' : 'name', sel.replace(/.*["']([^"']+)["'].*/, '$1')); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };

    const img = landingPage.shareImage || landingPage.ogImage || landingPage.mediaUrl || `${getBaseUrl()}/default-preview.svg`;
    const title = landingPage.shareTitle || landingPage.ogTitle || landingPage.title;
    const desc = landingPage.shareDesc || landingPage.ogDescription || landingPage.tagline;

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
            ogTitle: d.ogTitle || '',
            ogDescription: d.ogDescription || '',
            ogImage: d.ogImage || '',
            captureUtm: d.captureUtm !== undefined ? d.captureUtm : true,
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
    const ev = (landingPage as any).conversionEvents;
    const buttonEnabled = typeof ev === 'object' ? (ev.buttonClick ?? true) : true;
    if (!buttonEnabled) return;
    firePixel('InitiateCheckout', { content_name: landingPage.buttonLabel, ...utmParams });
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data: any = event.data;
      if (!data) return;
      if (data.type === 'ADPARLAY_FORM_HEIGHT') {
        const next = Math.max(420, Math.min(Number(data.height) || 0, 6000));
        if (next) setEmbeddedFormHeight(next);
      }
      if (data.type === 'ADPARLAY_FORM_SUBMIT') {
        const ev = (landingPage as any)?.conversionEvents;
        const submitEnabled = typeof ev === 'object' ? (ev.formSubmit ?? true) : true;
        if (!landingPage || !submitEnabled) return;
        firePixel('Lead', { content_name: landingPage.title, ...utmParams });
        if ((window as any).fbq) {
          (window as any).fbq('trackCustom', 'FormComplete', { landingPageId: landingPage.id, ...utmParams });
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [landingPage, utmParams]);

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
  const logoJustifyContent = landingPage.logoPosition === 'right'
    ? 'flex-end'
    : landingPage.logoPosition === 'center'
      ? 'center'
      : 'flex-start';


  return (
    <div className="landing-page-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-page-wrapper * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Epilogue', sans-serif; }
        
        .landing-page-wrapper { 
            line-height: 1.6; 
            color: #1e293b; 
            background: #ffffff;
            overflow-x: hidden;
            min-height: 100vh;
        }
        
        .lp-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
        }
        
        .lp-header { 
            text-align: center; 
            padding: 140px 0 120px; 
            background: radial-gradient(circle at 50% 0%, ${landingPage.primaryColor}08 0%, transparent 70%);
            position: relative;
            animation: fadeIn 1.2s ease-out;
        }
        
        .lp-header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, #eee, transparent);
        }
        
        .logo-container {
            display: flex;
            width: 100%;
            align-items: center;
            margin-bottom: 40px;
        }

        .logo-container img {
            max-height: 60px;
            max-width: 180px;
            width: auto;
            height: auto;
            object-fit: contain;
            display: block;
        }
        
        .lp-headline { 
            font-family: 'Outfit', sans-serif;
            font-size: clamp(3.2rem, 8vw, 6rem); 
            font-weight: 900; 
            color: #0f172a;
            margin-bottom: 24px; 
            line-height: 1;
            letter-spacing: -0.04em;
            background: linear-gradient(135deg, #000, #444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1);
            padding: 0 20px;
            max-width: 16ch;
            margin-left: auto;
            margin-right: auto;
        }
        
        .lp-tagline { 
            font-size: clamp(1.1rem, 2.2vw, 1.4rem); 
            color: #64748b; 
            max-width: 800px; 
            margin: 0 auto; 
            font-weight: 500;
            animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
            padding: 0 20px;
            line-height: 1.5;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .lp-media-section { 
            padding: 0 20px;
            margin-top: -60px;
            text-align: center; 
            position: relative;
            z-index: 10;
            animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
        
        .lp-media-container {
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            border-radius: 40px;
            background: #ffffff;
            padding: 16px;
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08), 0 0 0 1px #f1f1f1;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .lp-media-container:hover {
            transform: scale(1.01);
        }
        
        .lp-media-placeholder { 
            width: 100%; 
            height: auto;
            aspect-ratio: 16/9;
            background: #fdfdfd;
            border-radius: 28px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden;
            position: relative;
        }
        
        .lp-media-placeholder img,
        .lp-media-placeholder video,
        .lp-media-placeholder iframe {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0; left: 0;
            border: none;
        }
        
        .lp-body-section { 
            padding: 120px 0; 
            background: #ffffff;
        }
        
        .lp-body-content { 
            max-width: 900px; 
            margin: 0 auto; 
            text-align: center; 
            font-size: 1.3rem;
            color: #475569;
            line-height: 1.7;
            padding: 0 24px;
        }
        
        .lp-body-content li { 
            margin-bottom: 20px; 
            position: relative; 
            background: #fcfcfc;
            padding: 32px 32px 32px 80px;
            border-radius: 24px;
            border: 1px solid #f1f1f1;
            text-align: left;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .lp-body-content li:hover {
            transform: translateY(-4px);
            border-color: ${landingPage.primaryColor}30;
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.03);
        }
        
        .lp-body-content li:before { 
            content: "✦"; 
            position: absolute; 
            left: 32px; 
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.8rem;
            color: ${landingPage.primaryColor};
        }
        
        .lp-cta-section { 
            padding: 140px 0; 
            text-align: center; 
            background: #fafafa;
            position: relative;
            border-top: 1px solid #f1f1f1;
        }
        
        .lp-form-container { 
            max-width: 720px; 
            margin: 0 auto; 
            background: #ffffff; 
            padding: 64px; 
            border-radius: 48px; 
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.06);
            border: 1px solid #f1f1f1;
            position: relative;
            z-index: 10;
        }
        
        .lp-form-container h2 { 
            font-family: 'Outfit', sans-serif;
            color: #0f172a; 
            margin-bottom: 40px; 
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: -0.04em;
        }
        
        .lp-form-group { 
            text-align: left; 
            margin-bottom: 24px;
        }
        
        .lp-form-group label { 
            display: block; 
            margin-bottom: 12px; 
            font-weight: 700; 
            color: #0f172a; 
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .lp-form-group input { 
            width: 100%; 
            padding: 20px 24px; 
            border: 1px solid #e5e7eb; 
            border-radius: 18px; 
            font-size: 16px; 
            transition: all 0.3s ease; 
            background: #f9fafb;
            color: #0f172a;
            font-weight: 500;
        }
        
        .lp-form-group input:focus { 
            outline: none; 
            border-color: ${landingPage.primaryColor};
            background: #ffffff;
            box-shadow: 0 0 0 4px ${landingPage.primaryColor}10;
        }
        
        .lp-submit-btn { 
            width: 100%; 
            padding: 22px 32px; 
            background: #0f172a; 
            color: white; 
            border: none; 
            border-radius: 20px; 
            font-size: 1.1rem; 
            font-weight: 800; 
            cursor: pointer; 
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
            box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        
        .lp-submit-btn:hover { 
            background: #000;
            transform: translateY(-2px); 
            box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
        }
        
        .lp-whatsapp-btn { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 12px; 
            width: 100%; 
            padding: 22px 32px; 
            background: #ffffff; 
            color: #0f172a; 
            text-decoration: none; 
            border-radius: 20px; 
            font-weight: 800; 
            font-size: 1.1rem;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
            border: 1px solid #e5e7eb;
        }
        
        .lp-whatsapp-btn:hover { 
            background: #f9fafb;
            transform: translateY(-2px); 
        }
        
        .lp-cta-btn {
            display: inline-block;
            padding: 22px 32px;
            background: #0f172a;
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-weight: 800;
            font-size: 1.1rem;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            width: 100%;
            text-align: center;
        }
        
        .lp-cta-btn:hover {
            background: #000;
            transform: translateY(-2px);
        }

        .lp-thank-you h2 { 
            font-family: 'Outfit', sans-serif;
            color: #0f172a; 
            margin-bottom: 20px; 
            font-size: 3rem;
            font-weight: 900;
        }

        .lp-thank-you p {
            color: #64748b;
            font-size: 1.2rem;
            margin-bottom: 40px;
        }
        
        @media (max-width: 768px) { 
            .lp-header { padding: 100px 0 80px; }
            .lp-headline { font-size: 2.8rem; } 
            .lp-form-container { padding: 40px 24px; border-radius: 32px; }
            .lp-media-container { border-radius: 24px; padding: 10px; }
            .lp-body-content li { padding: 24px 24px 24px 64px; }
            .lp-body-content li:before { left: 24px; }
        }
` }} />
      
      {Object.keys(utmParams).length > 0 && (
        <div className="sr-only" aria-hidden="true" data-utm={JSON.stringify(utmParams)} />
      )}

      <div className="lp-container">
        <div className="lp-header">
          {landingPage.showLogo && landingPage.logoUrl && (
            <div className="logo-container" style={{ justifyContent: logoJustifyContent }}>
              <img src={landingPage.logoUrl} alt="Logo" />
            </div>
          )}
          <h1 className="lp-headline">{landingPage.headline}</h1>
          <p className="lp-tagline">{landingPage.tagline}</p>
        </div>

        {landingPage.showMedia && landingPage.mediaUrl && (
          <div className="lp-media-section">
            <div className="lp-media-container">
              <div className="lp-media-placeholder">
                {(() => {
                  const url = landingPage.mediaUrl;
                  if (url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return <img src={url} alt="Campaign Media" loading="lazy" decoding="async" />;
                  }
                  if (url.startsWith('data:video/') || url.match(/\.(mp4|webm|mov)$/i)) {
                    return <video src={url} controls autoPlay muted loop playsInline preload="none" />;
                  }
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    return <iframe src={convertToYouTubeEmbed(url)} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" title="Video" />;
                  }
                  return <p style={{color: '#6b7280', fontSize: '1.2rem'}}>Unsupported media format</p>;
                })()}
              </div>
            </div>
          </div>
        )}

        <div className="lp-body-section">
          <div className="lp-body-content">
            <div style={{ whiteSpace: 'pre-line' }}>{landingPage.bodyContent}</div>

            {landingPage.additionalLinks?.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: landingPage.secondaryColor, marginBottom: '24px', fontSize: '1.5rem', fontWeight: 600 }}>Additional Resources</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {landingPage.additionalLinks.map(link => (
                    <div key={link.id} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: `1px solid ${landingPage.primaryColor}20`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>
                      <h4 style={{ color: landingPage.primaryColor, marginBottom: '8px', fontSize: '1.1rem', fontWeight: 600 }}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{link.label}</a>
                      </h4>
                      <p style={{ color: landingPage.secondaryColor, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{link.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lp-cta-section">
          <div className="lp-form-container">
            <h2>{landingPage.buttonLabel}</h2>

            {landingPage.showForm && landingPage.formUrl ? (
              <iframe
                ref={embeddedFormRef}
                src={`${getBaseUrl()}/form/${landingPage.formUrl}${(landingPage.captureUtm !== false && Object.keys(utmParams).length) ? `?${new URLSearchParams(utmParams).toString()}` : ''}`}
                style={{ width: '100%', height: `${embeddedFormHeight}px`, border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}
                title="Embedded Form"
                scrolling="no"
              />
            ) : landingPage.showForm ? (
              !submitted ? (
                <form ref={formRef} onSubmit={handleFormSubmit}>
                  <div className="lp-form-grid">
                    <div className="lp-form-group">
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" name="name" required placeholder="Enter your full name" />
                    </div>
                    <div className="lp-form-group">
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" name="email" required placeholder="Enter your email" />
                    </div>
                  </div>
                  <div className="lp-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" />
                  </div>
                  
                  {Object.entries(utmParams).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

                  <div className="lp-button-grid">
                    <button type="submit" className="lp-submit-btn">{landingPage.buttonLabel}</button>
                    {landingPage.whatsappNumber && (
                      <a href={whatsappLink} onClick={handleButtonClick} className="lp-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </form>
              ) : (
                <div className="lp-thank-you">
                  <h2>Thank You!</h2>
                  <p>Your submission has been received. We'll be in touch soon!</p>
                  <a href="/register" className="lp-signup-btn">Build Your One Page on AdParlay</a>
                </div>
              )
            ) : (
              <div className="lp-cta-buttons">
                {landingPage.buttonLink && (
                  <a href={landingPage.buttonLink} onClick={handleButtonClick} className="lp-cta-btn" target="_blank" rel="noopener noreferrer">
                    {landingPage.buttonLabel}
                  </a>
                )}
                {landingPage.whatsappNumber && (
                  <a href={whatsappLink} onClick={handleButtonClick} className="lp-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageView;
