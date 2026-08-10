"""Extract theme colors and metadata from PPTX templates"""
import json, os, zipfile, xml.etree.ElementTree as ET

PPTX_DIR = r"D:\BaiduNetdiskDownload"
OUTPUT = r"D:\ai-ppt-os-v3\template-market\templates_extracted.json"

ns = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
}

def extract_theme_colors(pptx_path):
    try:
        with zipfile.ZipFile(pptx_path) as z:
            theme_files = [f for f in z.namelist() if f.startswith('ppt/theme/') and f.endswith('.xml')]
            if not theme_files:
                return None
            theme_xml = z.read(theme_files[0])
            root = ET.fromstring(theme_xml)
            # Find color scheme
            clrScheme = root.find('.//a:clrScheme', ns)
            if clrScheme is None:
                return None
            name = clrScheme.get('name', '')
            colors = {}
            for child in clrScheme:
                tag = child.tag.split('}')[-1]  # local name
                for c in child:
                    ctag = c.tag.split('}')[-1]
                    val = c.get('val') or c.get('lastClr') or ''
                    if val:
                        colors[tag] = val
            return {'name': name, 'colors': colors}
    except:
        return None

def get_category(path):
    path_lower = path.lower()
    if '语文' in path_lower: return '语文'
    if '数学' in path_lower: return '数学'
    if '英语' in path_lower: return '英语'
    if '历史' in path_lower: return '历史'
    if '地理' in path_lower: return '地理'
    if '政治' in path_lower or '思品' in path_lower: return '政治'
    if '化学' in path_lower: return '化学'
    if '物理' in path_lower: return '物理'
    if '生物' in path_lower: return '生物'
    if '信息' in path_lower: return '信息技术'
    if '通用' in path_lower: return '通用'
    if '精品' in path_lower: return '通用'
    if '素材' in path_lower: return '素材'
    return '通用'

results = []
count = 0
for root, dirs, files in os.walk(PPTX_DIR):
    for f in files:
        if not f.lower().endswith('.pptx'):
            continue
        full = os.path.join(root, f)
        rel = os.path.relpath(full, PPTX_DIR)
        size = os.path.getsize(full)
        theme = extract_theme_colors(full)
        cat = get_category(rel)
        entry = {
            'id': 'local_' + str(count),
            'name': os.path.splitext(f)[0],
            'file': rel,
            'size': size,
            'category': cat,
            'color_scheme': theme['colors'] if theme else {},
            'theme_name': theme['name'] if theme else '',
        }
        results.append(entry)
        count += 1

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Extracted {count} templates")
if results:
    print(f"Sample: {json.dumps(results[0], ensure_ascii=False, indent=2)}")
