import json
import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

COMPILER_PROMPT_TEMPLATE = """
你是一位資深的 EdTech 系統工程師。請閱讀以下老師的「教學智慧筆記」，並將其精確地轉換為系統所需的 JSON 格式。

### 老師的筆記內容：
{wisdom_text}

### 轉換規則：
1. 題目轉換：將「題目」部分轉為 Question 物件。
2. 錯誤診斷轉換：將「老師的診斷智慧」轉為 ErrorType 物件，並在 Question 的 error_map 中建立對應關係。
3. 推薦路徑：將「推薦路徑」轉為 Question 的 next_rules。
4. ID 生成：如果筆記中沒給 ID，請根據內容生成簡短、唯一、語意化的英文 ID。
5. 語言：保持原本的語言（繁體中文）。

### 輸出的 JSON 格式範例：
{{
  "questions": [
    {{
      "id": "q11",
      "statement": "題目文字",
      "options": [{{ "id": "A", "text": "..." }}, ...],
      "correct_answer": "正確選項 ID",
      "concepts": ["對應的概念 ID，如 single_particle_L, com_ratio 等"],
      "difficulty": 1,
      "error_map": {{ "A": ["error_id_1"], "C": ["error_id_2"] }},
      "next_rules": {{ "error_id_1": "q4", "default": "q10" }}
    }}
  ],
  "error_types": [
    {{
      "id": "error_id_1",
      "name": "錯誤名稱",
      "description": "老師對這個錯誤的技術性描述",
      "category": "concept, modeling, vector, algebra, or reading",
      "hint_levels": ["提示 1", "提示 2", "提示 3"]
    }}
  ]
}}

請只輸出純 JSON，確保格式正確無誤。
"""

# Colors for terminal output
G = "\033[92m"  # Green
C = "\033[96m"  # Cyan
Y = "\033[93m"  # Yellow
R = "\033[91m"  # Red
B = "\033[1m"   # Bold
_ = "\033[0m"   # Reset

def log_info(msg): print(f"{C}[WISDOM]{_} {msg}")
def log_success(msg): print(f"{G}[SUCCESS]{_} {msg}")
def log_warn(msg): print(f"{Y}[WARN]{_} {msg}")
def log_error(msg): print(f"{R}[ERROR]{_} {msg}")

def compile_wisdom_file(file_path: Path):
    if not os.getenv("OPENAI_API_KEY"):
        log_error("請在 .env 中設定 OPENAI_API_KEY")
        return

    log_info(f"開始編譯智慧筆記：{B}{file_path.name}{_}")
    with open(file_path, "r", encoding="utf-8") as f:
        wisdom_text = f.read()

    log_info(f"發送至 OpenAI 進行智慧轉譯 ({B}gpt-4o{_})...")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a specialized compiler that turns educational notes into structured JSON."},
                {"role": "user", "content": COMPILER_PROMPT_TEMPLATE.format(wisdom_text=wisdom_text)}
            ],
            response_format={ "type": "json_object" }
        )
        
        llm_output = json.loads(response.choices[0].message.content)
        update_seed_data(llm_output)
        log_success(f"智慧編譯完成！已注入題目與診斷規則。")
    except Exception as e:
        log_error(f"編譯失敗: {str(e)}")

def update_seed_data(new_data):
    seed_path = Path("data/seed.json")
    try:
        with open(seed_path, "r", encoding="utf-8") as f:
            current_data = json.load(f)

        # Merge logic
        q_count = len(new_data.get("questions", []))
                e_count = len(new_data.get("error_types", []))

        new_q_ids = [q["id"] for q in new_data.get("questions", [])]
        current_data["questions"] = [q for q in current_data["questions"] if q["id"] not in new_q_ids]
        current_data["questions"].extend(new_data.get("questions", []))

        new_e_ids = [e["id"] for e in new_data.get("error_types", [])]
        current_data["error_types"] = [e for e in current_data["error_types"] if e["id"] not in new_e_ids]
        current_data["error_types"].extend(new_data.get("error_types", []))

        with open(seed_path, "w", encoding="utf-8") as f:
            json.dump(current_data, f, indent=2, ensure_ascii=False)
        
        log_info(f"已更新 {B}{q_count}{_} 個題目, {B}{e_count}{_} 個錯誤類型。")
    except Exception as e:
        log_error(f"寫入 seed.json 失敗: {str(e)}")

if __name__ == "__main__":
    wisdom_dir = Path("wisdom")
    for md_file in wisdom_dir.glob("*.md"):
        compile_wisdom_file(md_file)
