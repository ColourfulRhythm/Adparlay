import re

def replace_in_file(filepath, patterns):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
        
    with open(filepath, 'w') as f:
        f.write(content)

# Patterns for FormPreview.tsx
fp_patterns = [
    (r'w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg',
     r'w-full px-3 py-2.5 border-[0.5px] rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all text-[13px]'),
    (r'p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50',
     r'p-3 border-[0.5px] border-gray-200 rounded-lg hover:border-[#8B5CF6] hover:bg-gray-50'),
    (r'text-lg text-gray-700',
     r'text-[13px] text-gray-700'),
    (r'mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300',
     r'mr-3 w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6] border-gray-300'),
    (r'text-lg text-gray-600',
     r'text-[13px] text-gray-600'),
    (r'mr-2 w-5 h-5',
     r'mr-2 w-4 h-4'),
]

# Patterns for FormBuilder.tsx (Preview Mode)
fb_patterns = [
    (r'w-full px-4 py-3 border-2 border-\[#333\] rounded-lg focus:ring-2 focus:ring-\[#8B5CF6\] focus:border-\[#8B5CF6\] transition-all bg-\[#222\] text-white placeholder-\[#A3A3A3\]',
     r'w-full px-3 py-2 border-[0.5px] border-[#333] rounded-md focus:ring-2 focus:ring-[#8B5CF6] focus:border-[#8B5CF6] transition-all bg-[#1A1A1A] text-white text-[13px] placeholder-[#A3A3A3]'),
    (r'p-3 border-2 border-\[#333\] rounded-lg hover:border-\[#8B5CF6\] cursor-pointer bg-\[#222\]',
     r'p-2.5 border-[0.5px] border-[#333] rounded-md hover:border-[#8B5CF6] cursor-pointer bg-[#1A1A1A]'),
    (r'mr-3 w-4 h-4 text-\[#8B5CF6\] focus:ring-\[#8B5CF6\] border-\[#333\]',
     r'mr-2.5 w-3.5 h-3.5 text-[#8B5CF6] focus:ring-[#8B5CF6] border-[#333]'),
]

try:
    replace_in_file('src/pages/FormPreview.tsx', fp_patterns)
    print("FormPreview.tsx updated successfully.")
except Exception as e:
    print(f"Error updating FormPreview.tsx: {e}")

try:
    replace_in_file('src/pages/FormBuilder.tsx', fb_patterns)
    print("FormBuilder.tsx updated successfully.")
except Exception as e:
    print(f"Error updating FormBuilder.tsx: {e}")
