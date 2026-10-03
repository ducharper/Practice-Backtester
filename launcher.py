"""Windows desktop launcher: build once per frontend change, serve locally, stop cleanly."""
import hashlib
import json
import os
from pathlib import Path
import queue
import shutil
import subprocess
import sys
import threading
import time
import tkinter as tk
from tkinter import ttk
from urllib.request import urlopen
import webbrowser

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / 'frontend'
DATA = ROOT / 'data'
URL = 'http://127.0.0.1:8765'


def healthy():
    try:
        with urlopen(URL + '/health', timeout=1) as response:
            info = json.load(response)
        return info.get('app') == 'practice-backtester' and Path(info.get('workspace', '')).resolve() == ROOT
    except (OSError, ValueError):
        return False


def find_node():
    candidates = [shutil.which('node'), Path(os.environ.get('ProgramFiles', 'C:/Program Files')) / 'nodejs/node.exe', Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe']
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)
    raise RuntimeError('Node.js was not found. Install Node.js, then reopen the launcher.')


def source_digest():
    paths = sorted([p for p in (FRONTEND / 'src').rglob('*') if p.is_file()] + [p for p in (FRONTEND / 'public').rglob('*') if p.is_file()] + [p for p in FRONTEND.iterdir() if p.is_file() and p.suffix in {'.json', '.ts', '.html'}])
    digest = hashlib.sha256()
    for path in paths:
        digest.update(str(path.relative_to(FRONTEND)).encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()


def main():
    DATA.mkdir(exist_ok=True)
    window = tk.Tk()
    window.title('Practice Backtester')
    window.geometry('470x215')
    window.resizable(False, False)
    status = tk.StringVar(value='Starting your local workspace…')
    ttk.Label(window, text='Practice Backtester', font=('Segoe UI', 17)).pack(pady=(19, 10))
    ttk.Label(window, textvariable=status, wraplength=430, justify='center').pack(padx=20)
    ttk.Label(window, text='Keep this window open while using the website.', foreground='#666').pack(pady=10)
    events = queue.Queue()
    stopped = threading.Event()
    child_lock = threading.Lock()
    children = []
    log = (DATA / 'launcher.log').open('ab', buffering=0)

    def start(command, cwd=ROOT):
        with child_lock:
            if stopped.is_set():
                raise RuntimeError('Startup cancelled.')
            process = subprocess.Popen(command, cwd=cwd, stdout=log, stderr=log, creationflags=subprocess.CREATE_NO_WINDOW)
            children.append(process)
            return process

    def close():
        stopped.set()
        with child_lock:
            for child in children:
                if child.poll() is None:
                    child.terminate()
            for child in children:
                try:
                    child.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    child.kill()
        window.destroy()

    def worker():
        # The file lock prevents two launcher windows from starting duplicate servers.
        import msvcrt
        lock = (DATA / 'launcher.lock').open('a+b')
        lock.seek(0)
        if not lock.read(1):
            lock.write(b'0'); lock.flush()
        lock.seek(0)
        try:
            try:
                msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
            except OSError:
                for _ in range(120):
                    if stopped.is_set():
                        return
                    if healthy():
                        events.put(('existing', 'The app is already running in another launcher window.'))
                        return
                    time.sleep(.5)
                raise RuntimeError('Another launcher is starting or stopping. Check its window and try again.')
            if healthy():
                events.put(('existing', 'The app is already running. Close this extra launcher when finished.'))
                return
            node = find_node()
            if not (FRONTEND / 'node_modules/vite/bin/vite.js').exists():
                raise RuntimeError('Frontend dependencies are missing. Run npm install in frontend once, then reopen this launcher.')
            stamp = DATA / 'frontend-build.txt'
            digest = source_digest()
            if not (FRONTEND / 'dist/index.html').exists() or not stamp.exists() or stamp.read_text() != digest:
                events.put(('status', 'Building the website (only needed after frontend changes)…'))
                for script, arguments in [('typescript/bin/tsc', ['-b']), ('vite/bin/vite.js', ['build'])]:
                    if start([node, str(FRONTEND / 'node_modules' / script), *arguments], FRONTEND).wait() != 0:
                        raise RuntimeError('Website build failed. Details are in data/launcher.log.')
                stamp.write_text(digest)
            python = ROOT / '.venv/Scripts/python.exe'
            server = start([str(python), '-m', 'uvicorn', 'api.main:app', '--host', '127.0.0.1', '--port', '8765'])
            for _ in range(120):
                if stopped.is_set():
                    return
                if server.poll() is not None:
                    raise RuntimeError('The API could not start. Port 8765 may be busy. See data/launcher.log.')
                if healthy():
                    events.put(('ready', 'Running at ' + URL + '\nSuccessful backtests are saved automatically.'))
                    break
                time.sleep(.5)
            else:
                server.terminate()
                raise RuntimeError('The API did not become ready. See data/launcher.log.')
            while not stopped.wait(1):
                if server.poll() is not None:
                    raise RuntimeError('The API stopped unexpectedly. See data/launcher.log and reopen the launcher.')
        except Exception as exc:
            events.put(('error', str(exc)))
        finally:
            lock.close()

    open_button = ttk.Button(window, text='Open website', command=lambda: webbrowser.open(URL), state='disabled')
    open_button.pack(side='left', padx=(75, 10), pady=13)
    ttk.Button(window, text='Stop & close', command=close).pack(side='left', pady=13)
    window.protocol('WM_DELETE_WINDOW', close)

    def poll():
        while not events.empty():
            kind, message = events.get_nowait()
            status.set(message)
            if kind in {'ready', 'existing'}:
                open_button.configure(state='normal')
                webbrowser.open(URL)
            elif kind == 'error':
                open_button.configure(state='disabled')
        if not stopped.is_set():
            window.after(150, poll)

    threading.Thread(target=worker, daemon=True).start()
    poll()
    window.mainloop()
    log.close()


if __name__ == '__main__':
    main()
