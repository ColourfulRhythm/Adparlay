import re

with open('src/pages/LandingPageView.tsx', 'r') as f:
    content = f.read()

css_string = """
        .landing-page-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .landing-page-wrapper { 
            font-family: '${landingPage.fontFamily}', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #1e293b; 
            background: #f8fafc;
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
            background: linear-gradient(135deg, ${landingPage.primaryColor}0a 0%, ${landingPage.secondaryColor}10 100%);
            position: relative;
            border-bottom: 1px solid rgba(255,255,255,0.8);
            animation: fadeIn 1s ease-out;
        }
        
        .lp-header::before {
            content: '';
            position: absolute;
            top: -50%; left: -50%; right: -50%; bottom: -50%;
            background: radial-gradient(circle at center, ${landingPage.primaryColor}15 0%, transparent 50%);
            z-index: 0;
            pointer-events: none;
            animation: pulse 8s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.1); opacity: 1; }
        }
        
        .lp-header > * { position: relative; z-index: 1; }
        
        .lp-headline { 
            font-size: clamp(3rem, 6vw, 5.5rem); 
            font-weight: 900; 
            color: #0f172a;
            margin-bottom: 24px; 
            line-height: 1.05;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, ${landingPage.primaryColor}, ${landingPage.secondaryColor});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: slideUp 1s ease-out;
            padding: 0 16px;
        }
        
        .lp-tagline { 
            font-size: clamp(1.2rem, 2.5vw, 1.5rem); 
            color: #475569; 
            max-width: 750px; 
            margin: 0 auto; 
            font-weight: 400;
            animation: slideUp 1s ease-out 0.2s both;
            padding: 0 16px;
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .lp-media-section { 
            padding: 0 20px;
            margin-top: -80px;
            text-align: center; 
            position: relative;
            z-index: 10;
            animation: slideUp 1s ease-out 0.4s both;
        }
        
        .lp-media-container {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            padding: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.8) inset;
            transform: perspective(1000px) rotateX(2deg);
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .lp-media-container:hover {
            transform: perspective(1000px) rotateX(0deg) translateY(-10px);
        }
        
        .lp-media-placeholder { 
            width: 100%; 
            height: auto;
            aspect-ratio: 16/9;
            background: #f1f5f9;
            border-radius: 16px; 
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
            padding: 100px 0; 
            background: #ffffff;
            position: relative;
        }
        
        .lp-body-content { 
            max-width: 800px; 
            margin: 0 auto; 
            text-align: center; 
            font-size: 1.25rem;
            color: #334155;
            line-height: 1.8;
            padding: 0 20px;
        }
        
        .lp-body-content ul { 
            list-style: none; 
            text-align: left; 
            display: inline-block; 
            margin-top: 40px;
            width: 100%;
            max-width: 600px;
        }
        
        .lp-body-content li { 
            margin-bottom: 24px; 
            position: relative; 
            background: #f8fafc;
            padding: 24px 24px 24px 72px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .lp-body-content li:hover {
            transform: translateX(10px);
            background: #ffffff;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05);
            border-color: ${landingPage.primaryColor}40;
        }
        
        .lp-body-content li:before { 
            content: "✨"; 
            position: absolute; 
            left: 24px; 
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.5rem;
        }
        
        .lp-cta-section { 
            padding: 120px 0; 
            text-align: center; 
            background: #0f172a;
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .lp-cta-section::before {
            content: '';
            position: absolute;
            top: -50%; left: -50%; right: -50%; bottom: -50%;
            background: radial-gradient(circle at 50% 50%, ${landingPage.primaryColor}40 0%, transparent 60%);
            z-index: 0;
            pointer-events: none;
        }
        
        .lp-form-container { 
            max-width: 650px; 
            margin: 0 auto; 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            padding: 56px; 
            border-radius: 32px; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            z-index: 10;
        }
        
        .lp-form-container h2 { 
            color: #ffffff; 
            margin-bottom: 40px; 
            font-size: 2.2rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        
        .lp-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
        }
        
        .lp-form-group { 
            text-align: left; 
        }
        
        .lp-form-group label { 
            display: block; 
            margin-bottom: 10px; 
            font-weight: 600; 
            color: #cbd5e1; 
            font-size: 0.95rem;
        }
        
        .lp-form-group input, 
        .lp-form-group textarea { 
            width: 100%; 
            padding: 18px 24px; 
            border: 1px solid rgba(255,255,255,0.15); 
            border-radius: 16px; 
            font-size: 16px; 
            transition: all 0.3s ease; 
            background: rgba(0,0,0,0.2);
            color: white;
            font-family: inherit;
        }
        
        .lp-form-group input:focus { 
            outline: none; 
            border-color: ${landingPage.primaryColor};
            background: rgba(0,0,0,0.4);
            /* Removed glow as requested */
            box-shadow: none;
        }
        
        .lp-form-group input::placeholder {
            color: rgba(255,255,255,0.4);
        }
        
        .lp-submit-btn { 
            width: 100%; 
            padding: 20px 32px; 
            background: linear-gradient(135deg, ${landingPage.primaryColor}, ${landingPage.secondaryColor}); 
            color: white; 
            border: none; 
            border-radius: 16px; 
            font-size: 1.1rem; 
            font-weight: 700; 
            cursor: pointer; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            box-shadow: 0 10px 25px -5px ${landingPage.primaryColor}60;
        }
        
        .lp-submit-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 20px 35px -5px ${landingPage.primaryColor}80;
        }
        
        .lp-whatsapp-btn { 
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            gap: 12px; 
            width: 100%; 
            padding: 20px 32px; 
            background: #25D366; 
            color: white; 
            text-decoration: none; 
            border-radius: 16px; 
            font-weight: 700; 
            font-size: 1.1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
            box-shadow: 0 10px 25px -5px rgba(37, 211, 102, 0.4);
            border: none;
        }
        
        .lp-whatsapp-btn:hover { 
            background: #22c55e; 
            transform: translateY(-2px); 
            box-shadow: 0 20px 35px -5px rgba(37, 211, 102, 0.6);
        }
        
        .lp-cta-buttons {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .lp-button-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 32px;
        }
        
        .lp-cta-btn {
            display: inline-block;
            padding: 20px 32px;
            background: linear-gradient(135deg, ${landingPage.primaryColor}, ${landingPage.secondaryColor});
            color: white;
            text-decoration: none;
            border-radius: 16px;
            font-weight: 700;
            font-size: 1.1rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 25px -5px ${landingPage.primaryColor}60;
            border: none;
            cursor: pointer;
            width: 100%;
            text-align: center;
        }
        
        .lp-cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 35px -5px ${landingPage.primaryColor}80;
        }

        .lp-thank-you { 
            text-align: center; 
            padding: 40px 20px; 
        }
        
        .lp-thank-you h2 { 
            color: #ffffff; 
            margin-bottom: 20px; 
            font-size: 2.5rem;
        }

        .lp-thank-you p {
            color: #cbd5e1;
            font-size: 1.2rem;
            margin-bottom: 32px;
        }
        
        .lp-signup-btn { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(135deg, ${landingPage.primaryColor}, ${landingPage.secondaryColor});
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600; 
            font-size: 18px; 
            transition: all 0.3s ease; 
            box-shadow: 0 4px 14px rgba(0,0,0,0.1);
        }
        
        .lp-signup-btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) { 
            .lp-headline { font-size: 2.5rem; } 
            .lp-tagline { font-size: 1.2rem; } 
            .lp-media-section { margin-top: -40px; }
            .lp-form-grid { grid-template-columns: 1fr; gap: 16px; }
            .lp-button-grid { grid-template-columns: 1fr; }
            .lp-form-container { padding: 32px 24px; }
            .lp-body-content li { padding: 20px 20px 20px 56px; }
            .lp-body-content li:before { left: 16px; }
        }
"""

replacement = f"""
  return (
    <div className="landing-page-wrapper">
      <style dangerouslySetInnerHTML={{{{ __html: `{css_string}` }}}} />
      
      {{Object.keys(utmParams).length > 0 && (
        <div className="sr-only" aria-hidden="true" data-utm={{JSON.stringify(utmParams)}} />
      )}}

      <div className="lp-container">
        <div className="lp-header">
          {{landingPage.showLogo && landingPage.logoUrl && (
            <div className="logo-container" style={{{{ textAlign: landingPage.logoPosition, marginBottom: '40px' }}}}>
              <img src={{landingPage.logoUrl}} alt="Logo" style={{{{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }}}} />
            </div>
          )}}
          <h1 className="lp-headline">{{landingPage.headline}}</h1>
          <p className="lp-tagline">{{landingPage.tagline}}</p>
        </div>

        {{landingPage.showMedia && landingPage.mediaUrl && (
          <div className="lp-media-section">
            <div className="lp-media-container">
              <div className="lp-media-placeholder">
                {{(() => {{
                  const url = landingPage.mediaUrl;
                  if (url.startsWith('data:image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {{
                    return <img src={{url}} alt="Campaign Media" loading="lazy" decoding="async" />;
                  }}
                  if (url.startsWith('data:video/') || url.match(/\.(mp4|webm|mov)$/i)) {{
                    return <video src={{url}} controls autoPlay muted loop playsInline preload="none" />;
                  }}
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {{
                    return <iframe src={{convertToYouTubeEmbed(url)}} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" title="Video" />;
                  }}
                  return <p style={{{{color: '#6b7280', fontSize: '1.2rem'}}}}>Unsupported media format</p>;
                }})()}}
              </div>
            </div>
          </div>
        )}}

        <div className="lp-body-section">
          <div className="lp-body-content">
            <div style={{{{ whiteSpace: 'pre-line' }}}}>{{landingPage.bodyContent}}</div>

            {{landingPage.additionalLinks?.length > 0 && (
              <div style={{{{ marginTop: '40px' }}}}>
                <h3 style={{{{ color: landingPage.secondaryColor, marginBottom: '24px', fontSize: '1.5rem', fontWeight: 600 }}}}>Additional Resources</h3>
                <div style={{{{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}}}>
                  {{landingPage.additionalLinks.map(link => (
                    <div key={{link.id}} style={{{{ background: 'white', padding: '24px', borderRadius: '12px', border: `1px solid ${{landingPage.primaryColor}}20`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}}}>
                      <h4 style={{{{ color: landingPage.primaryColor, marginBottom: '8px', fontSize: '1.1rem', fontWeight: 600 }}}}>
                        <a href={{link.url}} target="_blank" rel="noopener noreferrer" style={{{{ color: 'inherit', textDecoration: 'none' }}}}>{{link.label}}</a>
                      </h4>
                      <p style={{{{ color: landingPage.secondaryColor, fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}}}>{{link.description}}</p>
                    </div>
                  ))}}
                </div>
              </div>
            )}}
          </div>
        </div>

        <div className="lp-cta-section">
          <div className="lp-form-container">
            <h2>{{landingPage.buttonLabel}}</h2>

            {{landingPage.showForm && landingPage.formUrl ? (
              <iframe 
                  src={{`${{getBaseUrl()}}/form/${{landingPage.formUrl}}`}} 
                  style={{{{ width: '100%', height: '600px', border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}}}
                  title="Embedded Form"
              ></iframe>
            ) : landingPage.showForm ? (
              !submitted ? (
                <form ref={{formRef}} onSubmit={{handleFormSubmit}}>
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
                  
                  {{Object.entries(utmParams).map(([k, v]) => <input key={{k}} type="hidden" name={{k}} value={{v}} />)}}

                  <div className="lp-button-grid">
                    <button type="submit" className="lp-submit-btn">{{landingPage.buttonLabel}}</button>
                    {{landingPage.whatsappNumber && (
                      <a href={{whatsappLink}} onClick={{handleButtonClick}} className="lp-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}}
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
                {{landingPage.buttonLink && (
                  <a href={{landingPage.buttonLink}} onClick={{handleButtonClick}} className="lp-cta-btn" target="_blank" rel="noopener noreferrer">
                    {{landingPage.buttonLabel}}
                  </a>
                )}}
                {{landingPage.whatsappNumber && (
                  <a href={{whatsappLink}} onClick={{handleButtonClick}} className="lp-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp
                  </a>
                )}}
              </div>
            )}}
          </div>
        </div>
      </div>
    </div>
  );
"""

import re
new_content = re.sub(r'  return \(\n    <div className="min-h-screen" style={{ fontFamily: landingPage\.fontFamily }}>.*?  \);\n', replacement, content, flags=re.DOTALL)

with open('src/pages/LandingPageView.tsx', 'w') as f:
    f.write(new_content)
