import http.server
import urllib.request
import os
import sys
import socket

BACKEND = 'http://127.0.0.1:8000'
TIMEOUT = 120

class ProxySPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_ALL(self):
        if self.path.startswith('/api/'):
            url = BACKEND + self.path
            data = None
            headers = dict(self.headers)
            length = int(self.headers.get('Content-Length', 0))
            if length > 0:
                data = self.rfile.read(length)
            req = urllib.request.Request(url, data=data, headers=headers,
                                         method=self.command)
            try:
                resp = urllib.request.urlopen(req, timeout=TIMEOUT)
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    if k.lower() not in ('transfer-encoding', 'content-encoding', 'content-length'):
                        self.send_header(k, v)
                body = resp.read()
                self.send_header('Content-Length', len(body))
                self.send_header('Connection', 'close')
                self.end_headers()
                self.wfile.write(body)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                body = e.read()
                self.send_header('Content-Length', len(body))
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f'Proxy error: {e}'.encode())
            return
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            self.path = '/index.html'
        return super().do_GET()

    def do_GET(self): self.do_ALL()
    def do_POST(self): self.do_ALL()
    def do_PUT(self): self.do_ALL()
    def do_DELETE(self): self.do_ALL()
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    os.chdir(os.path.join(os.path.dirname(__file__), 'dist'))
    srv = http.server.HTTPServer(('127.0.0.1', port), ProxySPAHandler)
    srv.timeout = 0.5
    print(f'SPA server on http://127.0.0.1:{port}')
    srv.serve_forever()
