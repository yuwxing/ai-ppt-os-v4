import sys
sys.path.insert(0, "C:/Users/user/.openclaw/workspace/ai-ppt-os-v3/ppt-engine")
from engine import build_ppt

ppt_data = {
    "style": {
        "color_scheme": {"primary": "#2B5C8F", "secondary": "#5B9BD5", "accent": "#E8751A", "background": "#FFFFFF", "text": "#333333"},
        "fonts": {"title": "\u5fae\u8f6f\u96c5\u9ed1", "body": "\u5fae\u8f6f\u96c5\u9ed1"},
    },
    "slides": [
        {"layout": "cover", "title": "Unit 8 Once upon a time", "narrative": "\u65b0\u4eba\u6559\u4e03\u5e74\u7ea7\u82f1\u8bed\u4e0b\u518c \u00b7 \u9605\u8bfb\u8bfe"},
        {"layout": "section", "title": "Learning Objectives"},
        {"layout": "content_text", "title": "\u672c\u8282\u8bfe\u76ee\u6807", "content": ["\u7406\u89e3\u7ae5\u8bdd\u6545\u4e8b\u7684\u57fa\u672c\u7ed3\u6784", "\u638c\u63e1\u4e00\u822c\u8fc7\u53bb\u65f6\u7684\u7528\u6cd5", "\u80fd\u591f\u590d\u8ff0\u7b80\u5355\u6545\u4e8b", "\u57f9\u517b\u9605\u8bfb\u7406\u89e3\u548c\u63a8\u7406\u80fd\u529b"]},
        {"layout": "content_split", "title": "Key Vocabulary", "content": ["prince", "princess", "castle", "forest", "magic", "queen", "king", "mirror", "apple", "sleep"]},
        {"layout": "content_text", "title": "Reading: The Little Prince", "content": ["Long ago, there was a little prince who lived on a small planet.", "He met a pilot in the desert and told him many stories.", "The prince loved a rose and learned about friendship.", "It is only with the heart that one can see rightly."]},
        {"layout": "content_split", "title": "Grammar Focus", "content": ["\u89c4\u5219\u53d8\u5316\uff1awalk walked", "\u89c4\u5219\u53d8\u5316\uff1alive lived", "\u4e0d\u89c4\u5219\u53d8\u5316\uff1ago went", "\u4e0d\u89c4\u5219\u53d8\u5316\uff1asee saw", "\u5426\u5b9a\u5f62\u5f0f\uff1adid not + \u52a8\u8bcd\u539f\u5f62", "\u7591\u95ee\u5f62\u5f0f\uff1aDid + \u4e3b\u8bed + \u52a8\u8bcd\u539f\u5f62\uff1f"]},
        {"layout": "content_text", "title": "Group Discussion", "content": ["What is your favorite fairy tale?", "Who is the main character?", "What lesson does the story teach?", "Share your story with the class!"]},
        {"layout": "summary", "title": "Summary", "content": ["\u7ae5\u8bdd\u6545\u4e8b\u7684\u7ed3\u6784\uff1aBeginning Problem Solution Ending", "\u4e00\u822c\u8fc7\u53bb\u65f6\u7684\u57fa\u672c\u7528\u6cd5\u548c\u53d8\u5316\u89c4\u5219", "\u5b66\u4f1a\u7528\u82f1\u8bed\u8bb2\u8ff0\u548c\u8ba8\u8bba\u6545\u4e8b", "Homework: Write a short fairy tale (80-100 words)"]},
    ]
}

output = build_ppt(ppt_data, "C:/Users/user/.openclaw/workspace/ai-ppt-os-v3/output/demo_unit8.pptx")
print(f"PPT saved: {output}")
