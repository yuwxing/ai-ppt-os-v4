import json, uuid, os, sys, re, time, threading, http.server, socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3001
DIR = os.path.join(os.path.dirname(__file__), 'dist')

TASKS = {}
TASKS_LOCK = threading.Lock()

TEMPLATES = [
  {"id":"classic-education","name":"经典教学","description":"适合中小学课堂教学的经典模板","category":"education"},
  {"id":"story-magic","name":"故事魔法","description":"适合语文、英语等故事性课程","category":"education"},
  {"id":"science-lab","name":"科学实验室","description":"理科课程专用，科技感配色","category":"education"},
  {"id":"premium-business","name":"商务精英","description":"高端商务汇报模板","category":"business"},
]

MOCK_RESULT = {
  "topic": "Unit 7 A day to remember",
  "meta": {"subject": "英语", "grade": "七年级", "book": "人教版", "lesson_type": "新授课", "lesson_period": "第1课时"},
  "pages": 13, "file_name": "demo_sample.pptx",
  "teacher_guide": [{"page_number": 1, "teacher_script": "同学们好，今天我们来学习Unit 7。", "questions": [{"question": "What can you see?", "expected_answer": "A special day", "type": "开放式"}], "student_activity": "小组讨论", "time_allocation": "5分钟"}],
  "scripts": [{"page_number": 1, "speech": "Today we are going to learn...", "timing_seconds": 120}],
  "games": [
    {"type": "小组竞赛", "name": "动词变身接力赛", "phase": "练习", "duration": "8分钟", "description": "将全班分成4-5组，每组站成一列。"},
    {"type": "选择", "name": "难忘时刻猜猜猜", "phase": "导入", "duration": "5分钟", "description": "教师展示4张图片。"}
  ],
  "homework": [
    {"tier": "基础", "title": "动词变身小练习", "estimated_time": "5分钟", "difficulty": "容易"},
    {"tier": "基础", "title": "Tom的早晨填空", "estimated_time": "5分钟", "difficulty": "容易"},
    {"tier": "拓展", "title": "我的难忘一天", "estimated_time": "10分钟", "difficulty": "中等"},
    {"tier": "拓展", "title": "动词变身规则归纳", "estimated_time": "8分钟", "difficulty": "中等"},
    {"tier": "实践", "title": "家庭采访：昨天的事", "estimated_time": "15分钟", "difficulty": "中等"},
    {"tier": "实践", "title": "我的昨天时间线", "estimated_time": "15分钟", "difficulty": "困难"}
  ],
  "theme_elevation": {"core_value": "珍视生活中的美好瞬间", "format": "故事与音乐", "duration": "3分钟", "content": "播放轻柔钢琴曲，展示温馨图片组。"}
}

AGENT_NAMES = [
  "\U0001f4da 教材分析Agent - 分析教材知识结构、重难点",
  "\U0001f3af 学习目标Agent - 生成知识目标、能力目标、素养目标",
  "\U0001f9e0 学情诊断Agent - 预测学生困难和错误概念",
  "\U0001f3ac 情境创设Agent - 生成视频、图片、游戏导入",
  "\U0001f9e9 任务链Agent - 设计由易到难的学习任务链",
  "\U0001f308 主题升华Agent - 设计价值引领与情感升华",
  "\U0001f468\u200d\U0001f3eb 教学流程Agent - 生成40分钟课堂流程安排",
  "\U0001f3ae 游戏活动Agent - 设计课堂互动游戏与活动",
  "\U0001f4dd 评价设计Agent - 设计形成性评价与课堂反馈",
  "\U0001f3a8 课件视觉Agent - 设计PPT版式、配色、动画",
  "\U0001f399\ufe0f 多媒体资源Agent - 生成配图、动画、音频素材",
  "\U0001f4cb 作业设计Agent - 生成基础/拓展/实践分层作业",
  "\U0001f50d 质量审核Agent - 检查教学合理性与课标匹配"
]

def json_resp(data, status=200):
  body = json.dumps(data, ensure_ascii=False).encode('utf-8')
  return (status, {'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*'}, body)

def deepseek_call(api_key, payload_dict):
  import urllib.request, urllib.error
  req = urllib.request.Request('https://api.deepseek.com/v1/chat/completions',
    data=json.dumps(payload_dict).encode(),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'})
  resp = urllib.request.urlopen(req, timeout=60)
  data = json.loads(resp.read())
  return data['choices'][0]['message']['content']

def run_pipeline(topic, subject, grade, book, lesson_type, lesson_period, textbook_content, images, api_key, task_id):
  for i in range(len(AGENT_NAMES)):
    time.sleep(0.8)
    with TASKS_LOCK:
      TASKS[task_id] = {'status': 'running', 'step': i + 1, 'step_name': AGENT_NAMES[i], 'topic': topic}

  result = {'topic': topic, 'meta': {'subject': subject, 'grade': grade, 'book': book, 'lesson_type': lesson_type, 'lesson_period': lesson_period}, 'pages': 24, 'file_name': 'lesson.pptx'}

  if api_key:
    try:
      text_prompt = f'你是一位资深教师，正在备课。请直接阅读下面提供的【教材图片】（最重要，以此为准），然后设计完整的备课方案。\n\n注意：\n1. 课题名称仅供参考，所有内容必须严格基于图片中的教材内容（词汇、语法、主题、文化）来设计\n2. 如果同时有教材原文文字，以教材图片为准\n3. 不要擅自更改教材中的知识点\n\n【教材原文参考】\n{textbook_content or "无"}\n\n【基础信息】\n学科：{subject}\n年级：{grade}\n教材：{book}\n课型：{lesson_type}\n课时：{lesson_period or "整单元"}\n课题（仅供参考）：{topic}\n\n请输出JSON格式：pages(至少20页，基于教材内容量精确估算), teacher_guide(数组，每项含page_number/teacher_script/questions/student_activity/time_allocation), theme_elevation(含core_value/format/duration/content), games(数组，每项含name/type/phase/duration/description), homework(数组，每项含tier(基础/拓展/实践)/title/estimated_time/difficulty)`;
      if images:
        payload = {"model":"deepseek-chat","messages":[{"role":"user","content":[{"type":"text","text":text_prompt}]+[{"type":"image_url","image_url":{"url":img}} for img in images[:5]]}],"temperature":0.7,"max_tokens":4096}
      else:
        payload = {"model":"deepseek-chat","messages":[{"role":"user","content":text_prompt}],"temperature":0.7,"max_tokens":2048}
      text = deepseek_call(api_key, payload)
      m = re.search(r'\{[\s\S]*\}', text)
      if m:
        parsed = json.loads(m.group(0))
        result.update(parsed)
    except:
      pass

  result['_taskId'] = task_id
  with TASKS_LOCK:
    TASKS[task_id] = {'status': 'done', 'step': len(AGENT_NAMES), 'step_name': '\u2705 备课完成', 'result': result, 'topic': topic}

class Handler(http.server.SimpleHTTPRequestHandler):
  def do_GET(self):
    self._handle()
  def do_POST(self):
    self._handle()
  def do_OPTIONS(self):
    self.send_response(200)
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', '*')
    self.send_header('Access-Control-Allow-Headers', '*')
    self.end_headers()

  def _handle(self):
    path = self.path.rstrip('/') or '/'
    method = self.command
    try:
      if path == '/api/health':
        s, h, b = json_resp({'status': 'ok'})

      elif path == '/api/templates':
        s, h, b = json_resp(TEMPLATES)

      elif path == '/api/generate' and method == 'POST':
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length) if length else b'{}'
        body = json.loads(raw)
        task_id = 'task_' + uuid.uuid4().hex[:12]

        with TASKS_LOCK:
          TASKS[task_id] = {'status': 'running', 'step': 1,
            'step_name': '\U0001f4da 教材分析Agent - 分析教材知识结构、重难点', 'topic': body.get('topic', '')}

        t = threading.Thread(target=run_pipeline, args=(
          body.get('topic', ''), body.get('subject', ''), body.get('grade', ''),
          body.get('book', ''), body.get('lesson_type', '新授课'),
          body.get('lesson_period', ''), body.get('textbook_content', ''),
          body.get('images', []), body.get('api_key'), task_id), daemon=True)
        t.start()

        s, h, b = json_resp({'task_id': task_id, 'status': 'pending'})

      elif (m := re.match(r'^/api/generate/status/(.+)', path)):
        tid = m.group(1)
        with TASKS_LOCK:
          task = TASKS.get(tid)
        if task:
          s, h, b = json_resp(task)
        else:
          s, h, b = json_resp({'status': 'not_found'}, 404)

      elif (m := re.match(r'^/api/download/(.+)', path)):
        tid = m.group(1).replace('.pptx', '').replace('.ppt', '')
        task = TASKS.get(tid)
        if task and task.get('result'):
          r = task['result']
          html = f'''<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>备课方案 - {task["topic"]}</title><style>body{{font-family:system-ui;max-width:800px;margin:0 auto;padding:20px;line-height:1.6}}table{{width:100%;border-collapse:collapse;margin:16px 0}}td,th{{border:1px solid #ddd;padding:8px}}th{{background:#f5f5f5}}.section{{background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0}}h2{{color:#2B5C8F;border-bottom:2px solid #2B5C8F;padding-bottom:4px}}</style></head><body><h1>备课方案</h1><h2>{task["topic"]}</h2><p>{r.get("meta",{}).get("subject","")} | {r.get("meta",{}).get("grade","")} | {r.get("meta",{}).get("book","")}</p>{"".join(f'<div class="section"><h2>🌈 主题升华</h2><p>{r["theme_elevation"].get("core_value","")}</p></div>' for _ in [1] if r.get("theme_elevation"))}{"".join(f'<div class="section"><h2>🎮 游戏活动</h2>{"".join(f"<div><h3>{g["name"]}</h3><p>{g.get("type","")} · {g.get("phase","")} · {g.get("duration","")}</p><p>{g.get("description","")}</p></div>" for g in r["games"])}</div>' for _ in [1] if r.get("games"))}{"".join(f'<div class="section"><h2>📋 作业设计</h2>{"".join(f"<p><strong>{t}</strong></p><ul>{"".join(f"<li>{h["title"]}（{h.get("estimated_time","")} · {h.get("difficulty","")}）</li>" for h in r["homework"] if h["tier"]==t)}</ul>" for t in ["基础","拓展","实践"])}</div>' for _ in [1] if r.get("homework"))}<p style="text-align:center;color:#999;margin-top:40px">由 AI PPT OS V3 生成</p></body></html>'''
          s, h, b = (200, {'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': f'attachment; filename="{task["topic"]}_备课方案.html"'}, html.encode('utf-8'))
        else:
          s, h, b = json_resp({'error': '任务不存在', 'message': '演示模式：完整PPT导出需本地运行'}, 404)

      elif path == '/api/generate/ocr' and method == 'POST':
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length) if length else b'{}'
        body = json.loads(raw)
        s, h, b = json_resp({'text': '', 'id': uuid.uuid4().hex})

      else:
        fpath = self.translate_path(self.path)
        if not os.path.isfile(fpath):
          self.path = '/index.html'
        super().do_GET()
        return

      self.send_response(s)
      for k, v in h.items():
        self.send_header(k, v)
      self.send_header('Content-Length', len(b))
      self.send_header('Connection', 'close')
      self.end_headers()
      self.wfile.write(b)
    except Exception as e:
      import traceback; traceback.print_exc()
      self.send_response(500)
      self.send_header('Content-Type', 'text/plain')
      self.send_header('Connection', 'close')
      self.end_headers()
      self.wfile.write(str(e).encode())

  def log_message(self, format, *args):
    pass

if __name__ == '__main__':
  os.chdir(DIR)
  srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), Handler)
  print(f'Dev server on http://127.0.0.1:{PORT}')
  srv.serve_forever()
