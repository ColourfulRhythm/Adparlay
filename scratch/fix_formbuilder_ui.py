import re

with open('src/pages/FormBuilder.tsx', 'r') as f:
    content = f.read()

# 1. Fix nav: Replace thunder icon + logo text with logoreal.png
old_nav_logo = '''            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">AdParlay</span>
            </div>'''

new_nav_logo = '''            <Link to="/dashboard" className="flex items-center">
              <img src="/logoreal.png" alt="AdParlay" className="h-7 w-auto" />
            </Link>'''

content = content.replace(old_nav_logo, new_nav_logo)

# 2. Fix nav right side - name/logout layout
old_nav_right = '''            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>'''

new_nav_right = '''            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-[13px] text-[#555] hover:text-[#111] transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[13px] text-[#555] hover:text-[#111] transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>'''

content = content.replace(old_nav_right, new_nav_right)

# 3. Fix toolbar - make it dark, remove separate Preview button, consolidate Media+Settings+Preview into hamburger-style row
old_toolbar = '''      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left side buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {previewMode ? 'Exit Preview' : 'Preview'}
              </button>
            </div>
            
            {/* Right side buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowMediaModal(true)}
                className={`min-h-[44px] px-4 py-2 text-white text-sm rounded-lg font-medium transition-colors ${
                  mediaError 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {mediaError ? 'Fix Media' : 'Media'}
              </button>
              
              <button
                onClick={() => setShowSettingsModal(true)}
                className="min-h-[44px] px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Settings
              </button>
              
              {mediaError && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-50 px-2 py-1 rounded">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Issue</span>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>'''

new_toolbar = '''      {/* Toolbar - Compact dark bar */}
      <div className="bg-[#0d0d0d] border-b border-[#1f1f1f] px-3 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Add Page + Add Question - compact on mobile */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={addBlock}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333] text-[#ccc] text-[12px] font-medium rounded-md hover:border-[#8B5CF6] hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span className="hidden sm:inline">Add Page</span>
                <span className="sm:hidden">Page</span>
              </button>
              {currentBlock && (
                <button
                  onClick={() => { setSelectedBlockId(currentBlock.id); setShowQuestionTypeModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333] text-[#ccc] text-[12px] font-medium rounded-md hover:border-[#22c55e] hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  <span className="hidden sm:inline">Add Question</span>
                  <span className="sm:hidden">Question</span>
                </button>
              )}
              {currentBlock && (
                <span className="text-[11px] text-[#555] hidden sm:inline">{currentBlock.questions.length} questions</span>
              )}
            </div>
            {/* Right: Preview toggle + Media + Settings */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                  previewMode
                    ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white'
                    : 'bg-[#1a1a1a] border-[#333] text-[#ccc] hover:border-[#8B5CF6] hover:text-white'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => setShowMediaModal(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium rounded-md border transition-colors ${
                  mediaError
                    ? 'bg-red-900/30 border-red-700 text-red-400'
                    : 'bg-[#1a1a1a] border-[#333] text-[#ccc] hover:border-[#555] hover:text-white'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Media
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333] text-[#ccc] text-[12px] font-medium rounded-md hover:border-[#555] hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>'''

content = content.replace(old_toolbar, new_toolbar)

# 4. Remove the old "Action Buttons - Between Media and Form" section (now handled in toolbar)
old_action_section = '''          {/* Action Buttons - Between Media and Form */}
          <div className="w-full bg-[#1a1a1a] border-b border-[#333] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={addBlock}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Page
                </button>
                
                {currentBlock && (
                  <button
                    onClick={() => {
                      setSelectedBlockId(currentBlock.id);
                      setShowQuestionTypeModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Question
                  </button>
                )}
              </div>
              
              <div className="text-sm text-gray-400">
                {currentBlock ? `${currentBlock.questions.length} questions` : 'No questions'}
              </div>
            </div>
          </div>'''

new_action_section = ''

content = content.replace(old_action_section, new_action_section)

# 5. Fix question edit/delete buttons - always visible on mobile (not opacity-0)
old_q_buttons = '''                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">'''
new_q_buttons = '''                              <div className="flex items-center space-x-1">'''
content = content.replace(old_q_buttons, new_q_buttons)

# 6. Fix main wrapper bg color to match dark theme
content = content.replace(
    '<div className="min-h-screen bg-white text-gray-900">',
    '<div className="min-h-screen bg-[#0d0d0d] text-gray-900">'
)

# 7. Fix nav to match dark theme
content = content.replace(
    '<nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">',
    '<nav className="bg-[#0d0d0d] border-b border-[#1f1f1f] sticky top-0 z-50">'
)

# 8. Fix form header bar to dark theme
content = content.replace(
    '<div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">',
    '<div className="bg-[#111] border-b border-[#222] px-3 sm:px-6 py-2.5">'
)

# 9. Fix form title input dark
content = content.replace(
    'className="text-lg sm:text-xl font-semibold bg-transparent text-gray-900 border-none outline-none placeholder-gray-400 w-full truncate"',
    'className="text-[15px] font-semibold bg-transparent text-white border-none outline-none placeholder-[#555] w-full truncate"'
)
content = content.replace(
    'className="text-sm text-gray-600 bg-transparent border-none outline-none placeholder-gray-400 w-full truncate mt-1"',
    'className="text-[12px] text-[#777] bg-transparent border-none outline-none placeholder-[#444] w-full truncate mt-0.5"'
)

# 10. Fix last saved text
content = content.replace(
    '<div className="hidden lg:block text-xs text-gray-500 whitespace-nowrap">',
    '<div className="hidden lg:block text-[11px] text-[#555] whitespace-nowrap">'
)

# 11. Fix builder right panel to be full height properly since action bar removed
content = content.replace(
    '<div className="w-full lg:w-1/2 bg-[#111] flex flex-col">',
    '<div className="w-full lg:w-1/2 bg-[#0d0d0d] flex flex-col">',
    1  # only first occurrence (builder mode)
)

with open('src/pages/FormBuilder.tsx', 'w') as f:
    f.write(content)

print("FormBuilder.tsx patched successfully.")
