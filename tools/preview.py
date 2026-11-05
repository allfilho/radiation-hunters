#!/usr/bin/env python3
"""Prévia local de current/, sem cache de módulos durante a autoria. Apenas localhost."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import argparse

class SemCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def do_GET(self):
        # O módulo pode ter mudado no mesmo segundo de uma edição anterior.
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        super().do_GET()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8770)
    args = parser.parse_args()
    raiz = Path(__file__).resolve().parents[1] / 'current'
    servidor = ThreadingHTTPServer(('127.0.0.1', args.port), partial(SemCache, directory=str(raiz)))
    print(f'Radiation Hunters: http://127.0.0.1:{args.port}/', flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()
