import re

def replace_in_file(filepath, patterns):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
        
    with open(filepath, 'w') as f:
        f.write(content)

fp_patterns = [
    (r'border-2 border-gray-300',
     r'border-gray-300 border-[0.5px]'),
]

fb_patterns = [
    (r'w-full px-4 py-3 border-2 border-\[#333\] rounded-lg focus:ring-2 focus:ring-\[#8B5CF6\] focus:border-\[#8B5CF6\] transition-all resize-none bg-\[#222\] text-white placeholder-\[#A3A3A3\]',
     r'w-full px-3 py-2 border-[0.5px] border-[#333] rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all resize-none bg-[#1A1A1A] text-white text-[13px] placeholder-[#A3A3A3]'),
    (r'w-full px-4 py-3 border-2 border-\[#333\] rounded-lg focus:ring-2 focus:ring-\[#8B5CF6\] focus:border-\[#8B5CF6\] transition-all bg-\[#222\] text-white',
     r'w-full px-3 py-2 border-[0.5px] border-[#333] rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all bg-[#1A1A1A] text-white text-[13px]'),
]

replace_in_file('src/pages/FormPreview.tsx', fp_patterns)
replace_in_file('src/pages/FormBuilder.tsx', fb_patterns)
print("Second pass replacement done.")
