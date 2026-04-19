import re

with open('src/pages/adparlay-landing.html', 'r', encoding='utf-8') as f:
    html = f.read()

body_match = re.search(r'<body>(.*?)<script>', html, re.DOTALL)
if not body_match:
    print('No body found')
    exit(1)

jsx = body_match.group(1)

# 1. class to className
jsx = jsx.replace('class="', 'className="')

# 2. SVG attributes
attrs = {
    'fill-rule': 'fillRule',
    'clip-rule': 'clipRule',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'gradientUnits': 'gradientUnits', # already camelCase in HTML sometimes but just in case
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity'
}
for k, v in attrs.items():
    jsx = jsx.replace(f'{k}="', f'{v}="')

# 3. self-closing tags
tags = ['path', 'rect', 'polyline', 'stop']
for tag in tags:
    jsx = re.sub(f'<{tag}(.*?)(?<!/)>', f'<{tag}\\1 />', jsx)

# 4. Comments
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx)

# 5. Inline styles conversion
def style_repl(m):
    style_str = m.group(1)
    rules = [r.strip() for r in style_str.split(';') if r.strip()]
    obj_props = []
    for rule in rules:
        if ':' not in rule: continue
        k, v = rule.split(':', 1)
        k = k.strip()
        v = v.strip()
        # camelCase the key
        parts = k.split('-')
        k_camel = parts[0] + ''.join(p.capitalize() for p in parts[1:])
        obj_props.append(f"{k_camel}: '{v}'")
    return 'style={{ ' + ', '.join(obj_props) + ' }}'

jsx = re.sub(r'style="([^"]*)"', style_repl, jsx)

with open('scratch/landing_body.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)

print("Done")
