import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class GymProHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching rules
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Fix potential Windows registry MIME type mismatches for JS/CSS files
        if path.endswith(".js"):
            return "application/javascript"
        elif path.endswith(".css"):
            return "text/css"
        elif path.endswith(".svg"):
            return "image/svg+xml"
        return super().guess_type(path)

# Prevent port collisions or bind issues
socketserver.TCPServer.allow_reuse_address = True

if __name__ == '__main__':
    print(f"Starting GymPro Server on port {PORT}...")
    try:
        with socketserver.TCPServer(("", PORT), GymProHTTPRequestHandler) as httpd:
            print(f"GymPro is ready! Access it at http://localhost:{PORT}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}", file=sys.stderr)
        sys.exit(1)
