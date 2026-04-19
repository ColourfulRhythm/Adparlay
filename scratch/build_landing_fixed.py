import re

with open('scratch/landing_body.jsx', 'r', encoding='utf-8') as f:
    jsx = f.read()

# Fix ONLY the specific font-family issues safely
jsx = jsx.replace("fontFamily: ''Outfit',sans-serif'", 'fontFamily: "\'Outfit\',sans-serif"')
jsx = jsx.replace("fontFamily: ''Epilogue',sans-serif'", 'fontFamily: "\'Epilogue\',sans-serif"')

# Replace canvas
jsx = jsx.replace('<canvas id="hero-canvas"></canvas>', '<div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}><AetherFlowCanvas /></div>')

# Replace buttons with Links
jsx = jsx.replace('<button className="btn-ghost">Sign In</button>', '<Link to="/login" className="btn-ghost" style={{ textDecoration: "none" }}>Sign In</Link>')
jsx = jsx.replace('<button className="btn-primary">Get Started</button>', '<Link to="/register" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>Get Started</Link>')

jsx = jsx.replace('<button className="btn-cta">', '<Link to="/register" className="btn-cta" style={{ textDecoration: "none" }}>')
jsx = jsx.replace('</svg />\n      </button>', '</svg>\n      </Link>')
jsx = jsx.replace('<button className="btn-cta reveal" style={{ margin: \'0 auto\' }}>', '<Link to="/register" className="btn-cta reveal" style={{ margin: \'0 auto\', textDecoration: \'none\', display: \'inline-flex\' }}>')

jsx = jsx.replace('<button className="btn-plan">Get Started Free</button>', '<Link to="/register" className="btn-plan" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>Get Started Free</Link>')
jsx = jsx.replace('<button className="btn-plan btn-purple">Start Premium Trial</button>', '<Link to="/register" className="btn-plan btn-purple" style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>Start Premium Trial</Link>')

# Fix onclick to onClick
jsx = jsx.replace('onclick="setPricing(\'monthly\')"', 'onClick={() => setBillingMode(\'monthly\')}')
jsx = jsx.replace('onclick="setPricing(\'annual\')"', 'onClick={() => setBillingMode(\'annual\')}')

# Dynamic pricing classes and values
jsx = jsx.replace('<button className="toggle-btn active" id="btn-monthly"', '<button className={`toggle-btn ${billingMode === \'monthly\' ? \'active\' : \'\'} `}')
jsx = jsx.replace('<button className="toggle-btn" id="btn-annual"', '<button className={`toggle-btn ${billingMode === \'annual\' ? \'active\' : \'\'} `}')

jsx = jsx.replace('<span className="price-val" id="premium-price">2,099</span>', '<span className="price-val">{billingMode === \'annual\' ? \'1,679\' : \'2,099\'}</span>')
jsx = jsx.replace('<p className="price-billing" id="billing-free">Billed Monthly</p>', '<p className="price-billing">{billingMode === \'annual\' ? \'Billed Annually\' : \'Billed Monthly\'}</p>')
jsx = jsx.replace('<p className="price-billing" id="billing-premium">Billed Monthly</p>', '<p className="price-billing">{billingMode === \'annual\' ? \'Billed Annually\' : \'Billed Monthly\'}</p>')

# Clean up any leftover SVG self closing if I messed up
jsx = jsx.replace('</svg />', '</svg>')

# Check if `class=` still exists anywhere
jsx = jsx.replace('class="', 'className="')

# Wrap in component
component = f"""import React, {{ useState, useEffect }} from 'react';
import {{ Link }} from 'react-router-dom';
import AetherFlowCanvas from '../components/AetherFlowCanvas';
import './LandingPage.css';

const LandingPage: React.FC = () => {{
  const [billingMode, setBillingMode] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {{
    const observer = new IntersectionObserver(entries => {{
      entries.forEach(e => {{ 
        if (e.isIntersecting) e.target.classList.add('in'); 
      }});
    }}, {{ threshold: 0.1 }});
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }}, []);

  return (
    <div className="landing-container">
{jsx}
    </div>
  );
}};

export default LandingPage;
"""

with open('src/pages/LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(component)

print("Written LandingPage.tsx fixed")
