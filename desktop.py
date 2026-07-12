import http.server
import socketserver
import os
import sys
import threading
import socket
import webview
import time

# Dynamic port selection to prevent collision with other services
def get_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

PORT = get_free_port()

# Resolve correct directory path when compiled with PyInstaller
if hasattr(sys, '_MEIPASS'):
    DIRECTORY = sys._MEIPASS
else:
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class GymProHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable caching to ensure fresh assets
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Ensure correct MIME types on all Windows installations
        if path.endswith(".js"):
            return "application/javascript"
        elif path.endswith(".css"):
            return "text/css"
        elif path.endswith(".svg"):
            return "image/svg+xml"
        return super().guess_type(path)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), GymProHTTPRequestHandler) as httpd:
            print(f"GymPro backend server running on port {PORT}...")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting local server: {e}", file=sys.stderr)

if __name__ == '__main__':
    # Start the HTTP server in a daemon thread so it terminates when the main window closes
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Small delay to ensure server binding is complete
    time.sleep(0.2)

    # Launch native desktop window (uses Edge WebView2 on Windows)
    webview.create_window(
        title="GymPro — Gym Management System",
        url=f"http://localhost:{PORT}",
        width=1280,
        height=800,
        resizable=True,
        min_size=(1024, 768)
    )

    # Start pywebview loop.
    # private_mode=False ensures local storage/cookies persist.
    webview.start(private_mode=False)
