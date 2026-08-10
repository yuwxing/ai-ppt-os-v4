import json, os

with open(r'D:\ai-ppt-os-v3\template-market\templates_extracted.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

templates = []
for i, d in enumerate(data):
    cs = d['color_scheme']
    primary = '#' + (cs.get('accent1') or cs.get('dk2') or '4F81BD')
    secondary = '#' + (cs.get('accent2') or cs.get('lt2') or 'C0504D')
    accent = '#' + (cs.get('accent3') or cs.get('accent6') or 'F79646')
    bg = '#' + (cs.get('lt1') or cs.get('lt2') or 'FFFFFF')
    txt = '#' + (cs.get('dk1') or cs.get('dk2') or '333333')
    templates.append({
        'id': 'ext_' + str(i),
        'name': d['name'],
        'category': d['category'],
        'file': d['file'],
        'color_scheme': {
            'primary': primary, 'secondary': secondary, 'accent': accent,
            'background': bg, 'text': txt
        },
        'fonts': {'title': '微软雅黑', 'body': '微软雅黑'},
        'price_tier': 'free',
        'features': ['teacher_guide']
    })

out = r'D:\ai-ppt-os-v3\template-market\templates_all.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(templates, f, ensure_ascii=False, indent=2)

print('Generated %d templates' % len(templates))
cats = {}
for t in templates:
    cats[t['category']] = cats.get(t['category'], 0) + 1
for k, v in sorted(cats.items()):
    print('  %s: %d个' % (k, v))
for t in templates[:3]:
    print('  [%s] %s -> %s' % (t['category'], t['name'], t['color_scheme']['primary']))
