"""
Add OG preview settings, conversion event toggles, UTM toggle, drop-off UI
to LandingPageBuilder.tsx - in the settings/advanced section of the editor form
"""

with open('src/pages/LandingPageBuilder.tsx', 'r') as f:
    src = f.read()

# 1. Extend the LandingPage interface
old_iface_end = """  logoUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  showLogo: boolean;
}"""
new_iface_end = """  logoUrl: string;
  logoPosition: 'left' | 'center' | 'right';
  showLogo: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  conversionEvents?: { scrollDepth: boolean; buttonClick: boolean; formSubmit: boolean; };
  captureUtm?: boolean;
}"""
src = src.replace(old_iface_end, new_iface_end, 1)

# 2. Extend default state
old_default = """    logoUrl: '',
    logoPosition: 'left',
    showLogo: false"""
new_default = """    logoUrl: '',
    logoPosition: 'left',
    showLogo: false,
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    conversionEvents: { scrollDepth: true, buttonClick: true, formSubmit: true },
    captureUtm: true"""
src = src.replace(old_default, new_default, 1)

# 3. Extend fetchLandingPage to read new fields
old_fetch_end = """            logoUrl: data.logoUrl || '',
            logoPosition: data.logoPosition || 'left',
            showLogo: data.showLogo !== undefined ? data.showLogo : false"""
new_fetch_end = """            logoUrl: data.logoUrl || '',
            logoPosition: data.logoPosition || 'left',
            showLogo: data.showLogo !== undefined ? data.showLogo : false,
            ogTitle: data.ogTitle || '',
            ogDescription: data.ogDescription || '',
            ogImage: data.ogImage || '',
            conversionEvents: data.conversionEvents || { scrollDepth: true, buttonClick: true, formSubmit: true },
            captureUtm: data.captureUtm !== undefined ? data.captureUtm : true"""
src = src.replace(old_fetch_end, new_fetch_end, 1)

# 4. Add the new settings UI section into the builder form
# Find the end of the existing form to inject our new panel
old_form_anchor = """              </motion.div>
            </form>"""

NEW_SETTINGS_PANEL = """
              {/* ── Performance & Analytics Panel ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="border-t border-gray-100 pt-6 space-y-6"
              >
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Analytics & Performance
                </h3>

                {/* OG Social Preview */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-gray-700">🔗 Social Share Preview</span>
                    <span className="text-[11px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">WhatsApp / Twitter / LinkedIn</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Share Title <span className="text-gray-400">(overrides page title)</span></label>
                    <input type="text" value={landingPage.ogTitle || ''} onChange={e => handleInputChange('ogTitle', e.target.value)}
                      placeholder={landingPage.title || 'e.g. Join Our Lagos Promo — Limited Slots!'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Share Description</label>
                    <input type="text" value={landingPage.ogDescription || ''} onChange={e => handleInputChange('ogDescription', e.target.value)}
                      placeholder={landingPage.tagline || 'e.g. Get 30% off when you sign up before Friday'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Share Image URL <span className="text-gray-400">(1200×630px recommended)</span></label>
                    <input type="url" value={landingPage.ogImage || ''} onChange={e => handleInputChange('ogImage', e.target.value)}
                      placeholder="https://... or leave blank to use media above"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent bg-white" />
                    {landingPage.ogImage && (
                      <img src={landingPage.ogImage} alt="OG preview" className="mt-2 w-full h-24 object-cover rounded-lg border border-gray-200" loading="lazy" />
                    )}
                  </div>
                </div>

                {/* UTM Capture */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-[13px] font-medium text-gray-700">📍 UTM Parameter Capture</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Auto-attach utm_source, utm_medium, utm_campaign to every lead</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLandingPage(p => ({ ...p, captureUtm: !p.captureUtm }))}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${landingPage.captureUtm !== false ? 'bg-[#8B5CF6]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${landingPage.captureUtm !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Conversion Events */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="text-[13px] font-medium text-gray-700 mb-1">🎯 Pixel Conversion Events</div>
                  <div className="text-[11px] text-gray-500 -mt-1 mb-2">Fire specific events beyond PageView — required for real retargeting</div>
                  {([
                    { key: 'scrollDepth', label: 'Scroll Depth', desc: '25%, 50%, 75%, 100%' },
                    { key: 'buttonClick', label: 'CTA Button Click', desc: 'Tracks every CTA tap' },
                    { key: 'formSubmit', label: 'Form Submission', desc: 'Fires Lead + FormComplete' },
                  ] as const).map(ev => (
                    <div key={ev.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] text-gray-700">{ev.label}</div>
                        <div className="text-[11px] text-gray-500">{ev.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLandingPage(p => ({
                          ...p,
                          conversionEvents: { ...(p.conversionEvents || { scrollDepth:true,buttonClick:true,formSubmit:true }), [ev.key]: !(p.conversionEvents?.[ev.key] ?? true) }
                        }))}
                        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${(landingPage.conversionEvents?.[ev.key] ?? true) ? 'bg-[#8B5CF6]' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(landingPage.conversionEvents?.[ev.key] ?? true) ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Speed / Performance hint */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[12px] text-blue-700 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <div>
                    <div className="font-medium">Speed tips for Nigerian mobile networks</div>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-blue-600">
                      <li>• Images are lazy-loaded automatically</li>
                      <li>• Use a YouTube link for video (saves bandwidth vs upload)</li>
                      <li>• Keep body text under 300 words for fast paint</li>
                    </ul>
                  </div>
                </div>

              </motion.div>
"""

src = src.replace(old_form_anchor, NEW_SETTINGS_PANEL + "\n              </motion.div>\n            </form>", 1)

with open('src/pages/LandingPageBuilder.tsx', 'w') as f:
    f.write(src)
print("LandingPageBuilder.tsx updated")
