import time
import sys
import subprocess
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Colors for terminal output
M = "\033[95m"  # Magenta
C = "\033[96m"  # Cyan
Y = "\033[93m"  # Yellow
B = "\033[1m"   # Bold
_ = "\033[0m"   # Reset

class WisdomHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_run = 0
        self.debounce_seconds = 1 

    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".md"):
            now = time.time()
            if now - self.last_run > self.debounce_seconds:
                print(f"\n{M}{B}󱐋 [EVENT]{_} 偵測到筆記變更: {B}{Path(event.src_path).name}{_}")
                self.run_compiler()
                self.last_run = now

    def run_compiler(self):
        print(f"{C}󱓞 [WATCHER]{_} 正在啟動智慧轉譯...")
        try:
            result = subprocess.run(
                [sys.executable, "tools/wisdom_compiler.py"],
                capture_output=True,
                text=True
            )
            print(result.stdout)
            if result.stderr:
                print(f"\033[91m[ERROR]\033[0m {result.stderr}")
        except Exception as e:
            print(f"\033[91m[ERROR]\033[0m 無法執行編譯器: {e}")

if __name__ == "__main__":
    path = "wisdom"
    event_handler = WisdomHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=False)
    
    print(f"\n{Y}{B}--- 智慧監控器已啟動 ---{_}")
    print(f"{C}目標資料夾:{_} {B}{path}/{_}")
    print(f"{C}功能說明:{_} 在此資料夾中修改 Markdown 筆記，系統將自動提取老師的智慧。")
    print("-" * 40)
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
