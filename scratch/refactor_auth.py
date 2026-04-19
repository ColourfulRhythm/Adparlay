import os

def refactor_file(filepath, is_register=False):
    with open(filepath, 'r') as f:
        content = f.read()

    # Left side background
    if is_register:
        content = content.replace('bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900', 'bg-gradient-to-br from-[#1a0b2e] via-[#050505] to-[#000]')
        content = content.replace('text-emerald-100', 'text-[#b8b8b8]')
        content = content.replace('from-white to-emerald-100', 'from-white to-gray-300')
    else:
        content = content.replace('bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900', 'bg-gradient-to-br from-[#1a0b2e] via-[#050505] to-[#000]')
        content = content.replace('text-blue-100', 'text-[#b8b8b8]')
        content = content.replace('from-white to-blue-100', 'from-white to-gray-300')

    # Headings Typography
    content = content.replace('text-5xl font-bold mb-6', 'text-5xl font-extrabold font-[\'Outfit\'] tracking-tight mb-6')
    content = content.replace('text-3xl font-bold text-white mb-2', 'text-3xl font-extrabold font-[\'Outfit\'] tracking-tight text-white mb-2')
    
    # Subtitles
    content = content.replace('text-gray-300', 'text-[#b8b8b8] font-[\'Epilogue\']')
    
    # Form panel background
    content = content.replace('bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800', 'bg-[#0d0d0d] rounded-2xl shadow-xl p-8 border border-white/10')

    # Logo box
    if is_register:
        content = content.replace('bg-gradient-to-r from-emerald-600 to-green-600', 'bg-[#141414] border border-white/10 text-[#bf80ff]')
    else:
        content = content.replace('bg-gradient-to-r from-blue-600 to-indigo-600', 'bg-[#141414] border border-white/10 text-[#bf80ff]')

    # Keep SVG text white if not overwritten
    content = content.replace('text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24', 'text-inherit" fill="none" stroke="currentColor" viewBox="0 0 24 24')

    # Inputs
    input_search = 'border border-gray-600 rounded-xl placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-800 focus:bg-gray-700'
    input_replace = 'border border-white/10 rounded-xl placeholder-[#666666] text-white focus:outline-none focus:ring-2 focus:ring-[#bf80ff] focus:border-[#bf80ff] transition-all duration-200 bg-[#141414] focus:bg-[#1f1f1f] font-[\'Epilogue\']'
    if is_register:
        input_search = input_search.replace('blue', 'emerald')
    content = content.replace(input_search, input_replace)

    # Links
    if is_register:
        content = content.replace('text-emerald-400 hover:text-emerald-300', 'text-[#bf80ff] hover:text-[#d4a0ff]')
    else:
        content = content.replace('text-blue-400 hover:text-blue-300', 'text-[#bf80ff] hover:text-[#d4a0ff]')

    # Submit button
    submit_search = 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
    submit_replace = 'text-black bg-white hover:bg-[#e8e8e8] font-[\'Epilogue\'] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bf80ff] focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_40px_rgba(255,255,255,0.07)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.12)] transform hover:-translate-y-0.5'
    if is_register:
        submit_search = submit_search.replace('blue-600 to-indigo-600', 'emerald-600 to-green-600').replace('from-blue-700 hover:to-indigo-700', 'from-emerald-700 hover:to-green-700').replace('ring-blue-500', 'ring-emerald-500')
    content = content.replace(submit_search, submit_replace)
    
    # Spinner color for submit button
    content = content.replace('h-5 w-5 text-white', 'h-5 w-5 text-inherit')

    # Checkbox
    if is_register:
        content = content.replace('text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded', 'text-[#bf80ff] focus:ring-[#bf80ff] border-white/10 bg-[#141414] rounded')
    else:
        content = content.replace('text-blue-600 focus:ring-blue-500 border-gray-300 rounded', 'text-[#bf80ff] focus:ring-[#bf80ff] border-white/10 bg-[#141414] rounded')

    with open(filepath, 'w') as f:
        f.write(content)

refactor_file('src/pages/Login.tsx', is_register=False)
refactor_file('src/pages/Register.tsx', is_register=True)
print("Refactored auth pages")
