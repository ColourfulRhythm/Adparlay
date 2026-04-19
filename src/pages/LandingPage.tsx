import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AetherFlowCanvas from '../components/AetherFlowCanvas';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [billingMode, setBillingMode] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { 
        if (e.isIntersecting) e.target.classList.add('in'); 
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-container">


<nav>
  <div className="nav-brand">AdParlay</div>
  <div className="nav-links">
    <a href="#features">Features</a>
    <a href="#pricing">Pricing</a>
    <a href="#about">About</a>
  </div>
  <div className="nav-auth">
    <Link to="/login" className="btn-ghost" style={{ textDecoration: "none" }}>Sign In</Link>
    <Link to="/register" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>Get Started</Link>
  </div>
</nav>

<section className="hero" id="hero">
  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}><AetherFlowCanvas /></div>
  <div className="hero-inner">
    <div className="hero-badge"><span className="dot"></span> AdParlay</div>
    <h1 className="hero-title">
      <span className="line-dim">Business Intelligence</span>
      <span className="line-built">built around</span>
      <span className="line-accent">lead capture</span>
    </h1>
    <p className="hero-sub">AdParlay is the central hub for your organization's lead generation, uniting marketing teams and business teams around data to drive business outcomes.</p>
    <div className="hero-cta">
      <Link to="/register" className="btn-cta" style={{ textDecoration: "none" }}>
        Try for free
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </div>
    <div className="hero-card">
      <div className="hero-card-label">What You Get</div>
      <p>Perform complex, ad hoc analysis and empower simple self-service reporting, all on the same platform.</p>
      <div className="mini-cards">
        <div className="mini-card"><div className="mc-label">Hub</div><div className="mc-val">Lead Generation</div></div>
        <div className="mini-card"><div className="mc-label">Connects</div><div className="mc-val">Marketing + Business</div></div>
      </div>
    </div>
  </div>
</section>

<section id="features">
  <div className="reveal"><span className="section-tag">Capabilities</span></div>
  <div className="reveal"><h2 className="section-title">Capabilities you can count on</h2></div>
  <div className="reveal"><p className="section-sub">From simple contact forms to complex multi-step surveys — enterprise-grade features that scale with you.</p></div>

  <div className="feat-bento reveal">

    {/*  A: 100% Customizable  */}
    <div className="fb fb-span2">
      <div className="fb-stat">
        <div className="fb-stat-ring">
          <svg viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z" fill="currentColor"/>
          </svg>
          <div className="fb-big-num">100<span>%</span></div>
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginBottom: '6px', textAlign: 'center' }}>Customizable</h3>
        <p style={{ fontSize: '0.82rem', color: '#777', textAlign: 'center' }}>Every field, every flow — yours to own.</p>
      </div>
    </div>

    {/*  B: Secure by default  */}
    <div className="fb fb-span2 fb-secure">
      <div className="fb-ring-wrap">
        <div className="fb-ring">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bf80ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      </div>
      <div className="fb-inner" style={{ paddingTop: '0' }}>
        <h3>Secure by default</h3>
        <p>Enterprise-grade encryption on every submission, zero config needed.</p>
      </div>
    </div>

    {/*  C: Split-screen builder  */}
    <div className="fb fb-span2 fb-builder">
      <div className="fb-builder-top">
        <div className="fb-builder-bar">
          <span className="fb-bar-dot"></span>
          <span className="fb-bar-dot"></span>
          <span className="fb-bar-dot purple"></span>
        </div>
        <div className="fb-builder-rows">
          <div className="fb-builder-row"><span className="fb-builder-dot"></span><span className="fb-builder-label">Name field</span><span className="fb-builder-badge">live</span></div>
          <div className="fb-builder-row"><span className="fb-builder-dot"></span><span className="fb-builder-label">Email capture</span><span className="fb-builder-badge">live</span></div>
          <div className="fb-builder-row"><span className="fb-builder-dot dim"></span><span className="fb-builder-label">Follow-up logic</span></div>
          <div className="fb-builder-row"><span className="fb-builder-dot dim"></span><span className="fb-builder-label">Submit CTA</span></div>
        </div>
      </div>
      <div className="fb-builder-text">
        <h3>Split-Screen Builder</h3>
        <p>Build and preview simultaneously — no guessing, no back and forth.</p>
      </div>
    </div>

    {/*  D: Analytics wave (4 cols)  */}
    <div className="fb fb-span4 fb-wave">
      <svg className="fb-wave-chart" viewBox="0 0 386 123" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="386" height="123" rx="0" fill="transparent"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M3 123C3 123 14.3298 94.153 35.1282 88.0957C55.9266 82.0384 65.9333 80.5508 65.9333 80.5508C65.9333 80.5508 80.699 80.5508 92.1777 80.5508C103.656 80.5508 100.887 63.5348 109.06 63.5348C117.233 63.5348 117.217 91.9728 124.78 91.9728C132.343 91.9728 142.264 78.03 153.831 80.5508C165.398 83.0716 186.825 91.9728 193.761 91.9728C200.697 91.9728 206.296 63.5348 214.07 63.5348C221.844 63.5348 238.653 93.7771 244.234 91.9728C249.814 90.1684 258.8 60 266.19 60C272.075 60 284.1 88.057 286.678 88.0957C294.762 88.2171 300.192 72.9284 305.423 72.9284C312.323 72.9284 323.377 65.2437 335.553 63.5348C347.729 61.8259 348.218 82.07 363.639 80.5508C367.875 80.1335 372.949 82.2017 376.437 87.1008C379.446 91.3274 381.054 97.4325 382.521 104.647C383.479 109.364 382.521 123 382.521 123" fill="url(#featWaveGrad)"/>
        <path d="M3 121.077C3 121.077 15.3041 93.6691 36.0195 87.756C56.7349 81.8429 66.6632 80.9723 66.6632 80.9723C66.6632 80.9723 80.0327 80.9723 91.4656 80.9723C102.898 80.9723 100.415 64.2824 108.556 64.2824C116.696 64.2824 117.693 92.1332 125.226 92.1332C132.759 92.1332 142.07 78.5115 153.591 80.9723C165.113 83.433 186.092 92.1332 193 92.1332C199.908 92.1332 205.274 64.2824 213.017 64.2824C220.76 64.2824 237.832 93.8946 243.39 92.1332C248.948 90.3718 257.923 60.5 265.284 60.5C271.145 60.5 283.204 87.7182 285.772 87.756C293.823 87.8746 299.2 73.0802 304.411 73.0802C311.283 73.0802 321.425 65.9506 333.552 64.2824C345.68 62.6141 346.91 82.4553 362.27 80.9723C377.629 79.4892 383 106.605 383 106.605" stroke="#bf80ff" strokeWidth="2.5"/>
        <defs>
          <linearGradient id="featWaveGrad" x1="3" y1="60" x2="3" y2="123" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(191,128,255,0.2)"/><stop offset="1" stopColor="transparent" stopOpacity="0.04"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="fb-wave-text">
        <h3>Instant Analytics</h3>
        <p>Conversion rates, lead quality, and drop-off points — all live, all in one place.</p>
      </div>
    </div>

    {/*  E: Conditional logic  */}
    <div className="fb fb-span2 fb-logic">
      <span className="fb-eyebrow">Smart forms</span>
      <div className="fb-logic-tree">
        <div className="fb-tree-row active"><span className="fb-tree-key">If role =</span><span className="fb-tree-val">Manager</span><span className="fb-tree-arrow" style={{ marginLeft: 'auto' }}>↓</span></div>
        <div className="fb-tree-row child"><span className="fb-tree-child-label">→ Show budget question</span></div>
        <div className="fb-tree-row"><span className="fb-tree-key">Else</span><span className="fb-tree-arrow" style={{ marginLeft: 'auto', color: '#444' }}>↓</span></div>
        <div className="fb-tree-row child" style={{ borderColor: 'rgba(255,255,255,0.04)' }}><span style={{ color: '#555' }}>→ Skip to summary</span></div>
      </div>
      <h3>Conditional Logic</h3>
      <p>Smart forms that adapt and route every lead based on their answers.</p>
    </div>

    {/*  F: Team collaboration (4 cols)  */}
    <div className="fb fb-span4 fb-teams">
      <div>
        <span className="fb-eyebrow">Collaboration</span>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Keep your whole team aligned</h3>
        <p style={{ fontSize: '0.875rem', color: '#999', lineHeight: '1.65' }}>Marketing, sales, and ops — all working from the same lead data, in real time.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="fb-team-row">
          <div className="fb-team-avatar">TL</div>
          <div className="fb-team-info"><div className="fb-team-name">Tunde L.</div><div className="fb-team-role">Marketing Lead</div></div>
          <span className="fb-team-tag">Viewed analytics</span>
        </div>
        <div className="fb-team-row">
          <div className="fb-team-avatar" style={{ background: 'linear-gradient(135deg,#a060ee,#5020aa)' }}>SA</div>
          <div className="fb-team-info"><div className="fb-team-name">Sade A.</div><div className="fb-team-role">Sales Manager</div></div>
          <span className="fb-team-tag">Exported leads</span>
        </div>
        <div className="fb-team-row">
          <div className="fb-team-avatar" style={{ background: 'linear-gradient(135deg,#c090ff,#8050dd)' }}>KB</div>
          <div className="fb-team-info"><div className="fb-team-name">Kola B.</div><div className="fb-team-role">Growth</div></div>
          <span className="fb-team-tag">Built new form</span>
        </div>
      </div>
    </div>

    {/*  G: Wide PNG + Share  */}
    <div className="fb fb-span6 fb-wide">
      <div className="fb-wide-left">
        <span className="fb-eyebrow">Delivery</span>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>One-click sharing + PNG summaries</h3>
        <p style={{ fontSize: '0.875rem', color: '#999', maxWidth: '380px', lineHeight: '1.65' }}>Every lead auto-receives a beautiful summary. Share forms with previews that look like full, professional websites.</p>
      </div>
      <div className="fb-wide-right">
        <span className="fb-pill on">PNG Summaries</span>
        <span className="fb-pill on">One-Click Share</span>
        <span className="fb-pill">Mobile-First</span>
        <span className="fb-pill">Auto-Delivery</span>
        <span className="fb-pill">Link Preview</span>
        <span className="fb-pill">Custom Branding</span>
        <span className="fb-pill">Responsive</span>
        <span className="fb-pill">Instant Notify</span>
      </div>
    </div>

  </div>
</section>

<section className="about-section" id="about">
  <div className="about-top">
    <div className="reveal"><span className="section-tag">About</span></div>
    <div className="reveal"><h2 className="section-title">Clear the path from data to insights, together</h2></div>
    <div className="reveal"><p className="section-sub">Perform complex, ad hoc analysis and empower simple self-service reporting — all on the same platform.</p></div>
  </div>

  <div className="about-layout">

    {/*  Left: narrative blocks  */}
    <div className="about-left reveal">
      <div className="about-narrative">
        <span className="about-narrative-num">01 — Marketing</span>
        <h3>Made for your marketing team</h3>
        <p>In AdParlay, form building, analytics, and lead management are all connected — giving your marketing team the tools they need, big and small. No switching tabs, no lost context.</p>
      </div>
      <div className="about-narrative">
        <span className="about-narrative-num">02 — Collaboration</span>
        <h3>And the teams you work with</h3>
        <p>Deliver tools for easy, trusted self-service — without long implementation times or tedious maintenance. Sales, ops, and leadership all get the data they need, in the format they prefer.</p>
      </div>
      <div className="about-narrative">
        <span className="about-narrative-num">03 — Intelligence</span>
        <h3>The intelligence layer for your stack</h3>
        <p>AdParlay amplifies the investment you've made in every layer of your marketing stack — getting data you've made meaningful into everyone's hands, instantly.</p>
      </div>
    </div>

    {/*  Right: live data panel  */}
    <div className="about-right reveal">
      <div className="about-panel-new">
        <div className="ab-panel-header">
          <div className="ab-panel-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <div className="ab-panel-title">Lead Activity Feed</div>
            <div className="ab-panel-sub">Live — updated in real time</div>
          </div>
        </div>
        <div className="ab-live-rows">
          <div className="ab-live-row">
            <span className="ab-live-indicator ab-ind-green"></span>
            <span className="ab-live-label">New lead captured — <strong style={{ color: '#ddd' }}>Emeka O.</strong></span>
            <span className="ab-live-meta">2s ago</span>
          </div>
          <div className="ab-live-row">
            <span className="ab-live-indicator ab-ind-purple"></span>
            <span className="ab-live-label">Form shared — <strong style={{ color: '#ddd' }}>Product Survey v2</strong></span>
            <span className="ab-live-meta">14s ago</span>
          </div>
          <div className="ab-live-row">
            <span className="ab-live-indicator ab-ind-green"></span>
            <span className="ab-live-label">PNG summary sent — <strong style={{ color: '#ddd' }}>Amara K.</strong></span>
            <span className="ab-live-meta">1m ago</span>
          </div>
          <div className="ab-live-row">
            <span className="ab-live-indicator ab-ind-purple"></span>
            <span className="ab-live-label">Analytics export — <strong style={{ color: '#ddd' }}>Q4 Campaign</strong></span>
            <span className="ab-live-meta">3m ago</span>
          </div>
          <div className="ab-live-row">
            <span className="ab-live-indicator ab-ind-dim"></span>
            <span className="ab-live-label">Form updated — <strong style={{ color: '#888' }}>Onboarding Flow</strong></span>
            <span className="ab-live-meta">9m ago</span>
          </div>
        </div>
        <div className="ab-stats-bar">
          <div className="ab-stat-cell">
            <div className="ab-stat-big">3<em>×</em></div>
            <div className="ab-stat-tiny">faster capture</div>
          </div>
          <div className="ab-stat-cell">
            <div className="ab-stat-big"><em>∞</em></div>
            <div className="ab-stat-tiny">Premium forms</div>
          </div>
          <div className="ab-stat-cell">
            <div className="ab-stat-big">100<em>%</em></div>
            <div className="ab-stat-tiny">customizable</div>
          </div>
        </div>
      </div>

      <div className="ab-stack">
        <div className="ab-stack-label">Integrates with your stack</div>
        <div className="ab-pills">
          <div className="ab-p"><span className="ab-p-dot"></span>CRM sync</div>
          <div className="ab-p"><span className="ab-p-dot"></span>Email tools</div>
          <div className="ab-p"><span className="ab-p-dot"></span>Ad platforms</div>
          <div className="ab-p"><span className="ab-p-dot"></span>Analytics</div>
          <div className="ab-p"><span className="ab-p-dot"></span>Webhooks</div>
          <div className="ab-p"><span className="ab-p-dot"></span>API access</div>
        </div>
      </div>
    </div>

  </div>
</section>

<section id="pricing">
  <div className="reveal"><span className="section-tag">Pricing</span></div>
  <div className="reveal"><h2 className="section-title">Simple, Transparent Pricing</h2></div>
  <div className="reveal"><p className="section-sub">Start free, upgrade when you need more power.</p></div>
  <div className="reveal">
    <div className="pricing-toggle">
      <button className={`toggle-btn ${billingMode === 'monthly' ? 'active' : ''} `} onClick={() => setBillingMode('monthly')}>Monthly</button>
      <button className={`toggle-btn ${billingMode === 'annual' ? 'active' : ''} `} onClick={() => setBillingMode('annual')}>Annual (Save 20%)</button>
    </div>
  </div>
  <div className="pricing-grid reveal">
    <div className="price-card">
      <h3>Free</h3>
      <p className="plan-desc">Perfect for getting started</p>
      <div className="price-amount"><span className="price-currency">$</span><span className="price-val">0</span><span className="price-period">/mo</span></div>
      <p className="price-billing">{billingMode === 'annual' ? 'Billed Annually' : 'Billed Monthly'}</p>
      <ul className="price-features">
        <li><span className="check">✓</span> Up to 3 forms</li>
        <li><span className="check">✓</span> Up to 100 leads</li>
        <li><span className="check">✓</span> Basic analytics</li>
        <li><span className="check">✓</span> PNG summaries</li>
      </ul>
      <Link to="/register" className="btn-plan" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>Get Started Free</Link>
    </div>
    <div className="price-card popular">
      <div className="price-badge">Most Popular</div>
      <h3>Premium</h3>
      <p className="plan-desc">For growing businesses</p>
      <div className="price-amount"><span className="price-currency">₦</span><span className="price-val">{billingMode === 'annual' ? '1,679' : '2,099'}</span><span className="price-period">/mo</span></div>
      <p className="price-billing">{billingMode === 'annual' ? 'Billed Annually' : 'Billed Monthly'}</p>
      <ul className="price-features">
        <li><span className="check">✓</span> Unlimited forms</li>
        <li><span className="check">✓</span> Unlimited leads</li>
        <li><span className="check">✓</span> Advanced analytics</li>
        <li><span className="check">✓</span> AI-powered form builder</li>
        <li><span className="check">✓</span> Priority support</li>
      </ul>
      <Link to="/register" className="btn-plan btn-purple" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>Start Premium Trial</Link>
    </div>
  </div>
</section>

<section className="cta-section">
  <h2 className="reveal">Ready to Start Capturing Leads?</h2>
  <p className="reveal">Join thousands of businesses already using AdParlay to grow their customer base.</p>
  <Link to="/register" className="btn-cta reveal" style={{ margin: '0 auto', textDecoration: 'none', display: 'inline-flex' }}>
    Start Building Today
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
  </Link>
</section>

<footer>
  <div className="footer-top">
    <div>
      <div className="footer-brand">AdParlay</div>
      <p className="footer-tagline">Building the future of lead capture, one form at a time.</p>
    </div>
    <div className="footer-col">
      <h4>Product</h4>
      <a href="#">Features</a><a href="#">Pricing</a><a href="#">Templates</a>
    </div>
    <div className="footer-col">
      <h4>Company</h4>
      <a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a>
    </div>
    <div className="footer-col">
      <h4>Support</h4>
      <a href="#">Help Center</a><a href="#">Contact</a><a href="#">Status</a>
    </div>
  </div>
  <div className="footer-bottom">
    <span>© 2024 AdParlay. All rights reserved.</span>
    <div className="footer-legal"><a href="#">Terms & Conditions</a><a href="#">Privacy Policy</a></div>
  </div>
</footer>


    </div>
  );
};

export default LandingPage;
