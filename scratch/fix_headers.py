import re

# ─── FormBuilder: Replace entire header actions area ───────────────────────
with open('src/pages/FormBuilder.tsx', 'r') as f:
    fb = f.read()

# Replace the entire actions div in the compact form header
old = fb[fb.find('{/* Actions - Mobile Hamburger + Desktop Buttons */}'):fb.find('{/* Toolbar - Compact dark bar */}')]
new_actions = """{/* Actions - Publish + More dropdown */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {lastSaved && (
                <span className="hidden lg:block text-[11px] text-[#555] whitespace-nowrap">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}

              {/* Publish - always visible */}
              <button
                onClick={publishForm}
                disabled={saving || !form?.blocks?.length}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  saving || !form?.blocks?.length
                    ? 'bg-[#333] text-[#666] cursor-not-allowed'
                    : form?.status === 'published'
                    ? 'bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#22c55e]'
                    : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                {form?.status === 'published' ? 'Live' : 'Publish'}
              </button>

              {/* More dropdown - Save, Preview, Share, Integrations */}
              <div className="relative" ref={integrationsDropdownRef}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  data-mobile-menu-button
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333] text-[#aaa] text-[13px] font-medium rounded-md hover:border-[#555] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
                </button>

                {showMobileMenu && (
                  <div data-mobile-menu className="absolute top-full right-0 mt-2 w-56 bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-1">
                      <button onClick={() => { saveForm(); setShowMobileMenu(false); }} disabled={saving}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#ccc] hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button onClick={() => { setPreviewMode(!previewMode); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#ccc] hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-[#777] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        {previewMode ? 'Exit Preview' : 'Preview'}
                      </button>
                      <button onClick={() => { setShowShareModal(true); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#ccc] hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-[#777] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                        Share
                      </button>
                      <div className="h-px bg-[#222] my-1" />
                      <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#555] font-semibold">Integrations</div>
                      <button onClick={() => { setShowGoogleSheetsModal(true); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#ccc] hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                        Google Sheets
                      </button>
                      <button onClick={() => { setShowCRMModal(true); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#ccc] hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        CRM Tools
                      </button>
                      <button onClick={() => { setShowZapierModal(true); setShowMobileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#ccc] hover:bg-[#1f1f1f] hover:text-white rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        Zapier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
"""

start_marker = '{/* Actions - Mobile Hamburger + Desktop Buttons */}'
end_marker = '{/* Toolbar - Compact dark bar */}'
start_idx = fb.find(start_marker)
end_idx = fb.find(end_marker)
fb = fb[:start_idx] + new_actions + '\n      ' + fb[end_idx:]

# Fix toolbar overflow on mobile - wrap in overflow-hidden
fb = fb.replace(
    '<div className="flex items-center justify-between gap-2">',
    '<div className="flex items-center justify-between gap-1.5 overflow-hidden">',
    1
)

with open('src/pages/FormBuilder.tsx', 'w') as f:
    f.write(fb)
print("FormBuilder header fixed")

# ─── LandingPageBuilder: Modern nav ───────────────────────────────────────
with open('src/pages/LandingPageBuilder.tsx', 'r') as f:
    lp = f.read()

old_lp_header = '''      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <img src="/logoreal.png" alt="AdParlay logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-2xl font-bold text-gray-900">AdParlay</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View All Landing Pages
              </Link>
            </div>
          </div>
        </div>
      </div>'''

new_lp_header = '''      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/dashboard" className="flex items-center">
              <img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border transition-colors ${
                  previewMode
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${saving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                {saving ? 'Saving…' : 'Publish'}
              </button>
              <Link to="/dashboard" className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>'''

lp = lp.replace(old_lp_header, new_lp_header)
with open('src/pages/LandingPageBuilder.tsx', 'w') as f:
    f.write(lp)
print("LandingPageBuilder nav fixed")

# ─── Dashboard: Modern nav with logo ──────────────────────────────────────
with open('src/pages/Dashboard.tsx', 'r') as f:
    db = f.read()

# Fix logo in dashboard nav
db = db.replace(
    'bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0',
    'flex items-center justify-center flex-shrink-0'
)
# Replace the thunder SVG icon block with the logo image in nav
old_logo_block = '''<div className="flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>'''
new_logo_block = '<img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />'
if old_logo_block in db:
    db = db.replace(old_logo_block, new_logo_block)
    print("Dashboard logo replaced via block match")
else:
    # Try to find any nav logo pattern
    db = re.sub(
        r'<div className="w-8 h-8[^"]*rounded[^"]*">\s*<svg[^<]*<path[^/]*/>\s*</svg>\s*</div>\s*<span[^>]*>AdParlay</span>',
        '<img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />',
        db
    )
    print("Dashboard logo replaced via regex")

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(db)
print("Dashboard nav fixed")
