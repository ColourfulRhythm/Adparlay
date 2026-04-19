import re
import os

html_path = 'src/pages/adparlay-landing.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract CSS
style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if style_match:
    css_content = style_match.group(1)
    with open('src/pages/LandingPage.css', 'w', encoding='utf-8') as f:
        f.write(css_content.strip() + '\n')
    print("Extracted CSS")
else:
    print("No style found")

