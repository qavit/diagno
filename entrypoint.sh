#!/bin/bash

# 啟動智慧監控器 (Watcher) 並放到背景執行
echo "正在啟動智慧監控器..."
python3 tools/watch_wisdom.py &

# 啟動 FastAPI 伺服器，並監控程式碼與資料變更
echo "正在啟動 FastAPI 伺服器..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-include "data/*.json"
