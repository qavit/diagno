from __future__ import annotations

from app.data import CONCEPTS, ERROR_TYPES, QUESTIONS


SUPPORTED_LANGUAGES = {"en", "zh-TW"}
DEFAULT_LANGUAGE = "en"


UI_TRANSLATIONS = {
    "en": {
        "app_title": "Diagnostic Physics Tutor MVP",
        "hero_eyebrow": "Diagnostic Physics Tutor",
        "hero_title": "Angular Momentum + Center of Mass",
        "hero_description": "Rule-based diagnosis for binary-system mistakes. The engine maps answers to likely failures in reading, modeling, vectors, concepts, and algebra around $L$, $p$, and center-of-mass reasoning.",
        "hero_ribbon_rule_based": "Rule-based diagnosis",
        "hero_ribbon_bilingual": "Bilingual interface",
        "hero_ribbon_teacher": "Teacher-facing analytics",
        "student_label": "Student",
        "question_label": "Question",
        "next_question": "Next Question",
        "skip_question": "Try Another Question",
        "loading": "Loading...",
        "submit_answer": "Submit Answer",
        "next_challenge_message": "Next challenge: {statement}",
        "diagnosis_title": "Diagnosis",
        "diagnosis_idle": "Submit an answer to see diagnosis.",
        "show_next_hint": "Show Next Hint",
        "student_model_title": "Student Model",
        "teacher_view_title": "Teacher View",
        "task_panel_title": "Current Task",
        "task_panel_description": "Work the problem, then inspect the diagnostic breakdown rather than only checking correctness.",
        "concepts_label": "Concepts",
        "difficulty_label": "Difficulty",
        "choice_label": "Choice",
        "select_prompt": "Select one answer option to activate submission.",
        "diagnosis_panel_description": "The system tries to infer the failure point, reveal hints progressively, and recommend the next instructional move.",
        "detected_errors_title": "Detected Errors",
        "hint_track_title": "Hint Track",
        "hint_track_empty": "Hints unlock after the system detects at least one error type.",
        "hint_progress": "{shown} of {total} hints revealed",
        "recommended_next_title": "Recommended Next Step",
        "recommended_next_empty": "Submit an attempt to see the recommended remediation question.",
        "recommended_next_ready": "Next item: {question_id}",
        "student_model_description": "Concept mastery moves slowly; recent errors expose what the learner is repeating right now.",
        "recent_errors_title": "Recent Error Patterns",
        "recent_errors_empty": "No recurring error pattern recorded yet.",
        "teacher_view_description": "A lightweight teacher view highlights error concentration and the latest attempt stream.",
        "active_students": "Active students",
        "tracked_concepts": "Tracked concepts",
        "recent_attempts_title": "Recent Attempts",
        "recent_attempts_empty": "No attempts recorded yet.",
        "attempt_correct": "Correct",
        "attempt_incorrect": "Incorrect",
        "question_short": "Q",
        "student_short": "Student",
        "status_correct": "Correct. The concept scores increased.",
        "status_incorrect": "Incorrect. Review the detected failure points below.",
        "no_error_types": "No error types detected.",
        "category": "Category",
        "hint_label": "Hint",
        "total_attempts": "Total attempts",
        "no_error_data": "No error data yet.",
        "seen_times": "Seen {count} time(s)",
        "language_label": "Language",
        "mastery_percent": "{percent}%",
    },
    "zh-TW": {
        "app_title": "物理診斷家教 MVP",
        "hero_eyebrow": "物理診斷家教",
        "hero_title": "角動量與質心",
        "hero_description": "以規則為基礎診斷雙體系統常見錯誤，將作答映射到閱讀、建模、向量、概念與代數等失誤類型，聚焦於 $L$、$p$ 與質心推理。",
        "hero_ribbon_rule_based": "規則式診斷",
        "hero_ribbon_bilingual": "雙語介面",
        "hero_ribbon_teacher": "教師端分析",
        "student_label": "學生",
        "question_label": "題目",
        "next_question": "下一題",
        "skip_question": "換一題試試",
        "loading": "載入中...",
        "submit_answer": "提交答案",
        "next_challenge_message": "下一個挑戰：{statement}",
        "diagnosis_title": "診斷結果",
        "diagnosis_idle": "提交答案後即可看到診斷。",
        "show_next_hint": "顯示下一層提示",
        "student_model_title": "學生模型",
        "teacher_view_title": "教師檢視",
        "task_panel_title": "目前任務",
        "task_panel_description": "先完成題目，再查看診斷拆解，而不是只看對錯。",
        "concepts_label": "概念",
        "difficulty_label": "難度",
        "choice_label": "選項",
        "select_prompt": "請先選擇一個答案選項，系統才會啟用提交。",
        "diagnosis_panel_description": "系統會推定失誤點、逐層揭露提示，並給出下一步教學建議。",
        "detected_errors_title": "偵測到的錯誤",
        "hint_track_title": "提示進度",
        "hint_track_empty": "系統偵測到錯誤類型後，提示才會逐步解鎖。",
        "hint_progress": "已揭露 {shown} / {total} 個提示",
        "recommended_next_title": "建議下一步",
        "recommended_next_empty": "提交一次作答後，系統才會推薦下一題或補救項目。",
        "recommended_next_ready": "下一個建議題目：{question_id}",
        "student_model_description": "概念掌握度變化較慢，近期錯誤模式則反映學生正在重複的問題。",
        "recent_errors_title": "近期錯誤模式",
        "recent_errors_empty": "目前還沒有重複出現的錯誤模式。",
        "teacher_view_description": "教師檢視聚焦於錯誤集中點與最新作答流。",
        "active_students": "活躍學生數",
        "tracked_concepts": "追蹤概念數",
        "recent_attempts_title": "近期作答",
        "recent_attempts_empty": "目前還沒有作答紀錄。",
        "attempt_correct": "答對",
        "attempt_incorrect": "答錯",
        "question_short": "題",
        "student_short": "學生",
        "status_correct": "答對了，相關概念掌握度已提升。",
        "status_incorrect": "答案不正確，請查看下方偵測到的失誤點。",
        "no_error_types": "未偵測到錯誤類型。",
        "category": "分類",
        "hint_label": "提示",
        "total_attempts": "總作答次數",
        "no_error_data": "目前還沒有錯誤分布資料。",
        "seen_times": "出現 {count} 次",
        "language_label": "語言",
        "mastery_percent": "{percent}%",
    },
}


QUESTION_TRANSLATIONS = {
    "q1": {
        "zh-TW": {
            "statement": "兩個質量分別為 $m$ 與 $5m$ 的物體相距 $d$。在質心參考系中，它們到質心的距離各是多少？",
            "options": {
                "A": "$r_m = d/6$, $r_{5m} = 5d/6$",
                "B": "$r_m = 5d/6$, $r_{5m} = d/6$",
                "C": "$r_m = d/2$, $r_{5m} = d/2$",
                "D": "$r_m = 5d/4$, $r_{5m} = d/4$",
            },
        }
    },
    "q2": {
        "zh-TW": {
            "statement": "某質點以角速度 $\\omega$ 繞質心作半徑 $r$ 的圓周運動。它的速率應為何？",
            "options": {
                "A": "$v = r/\\omega$",
                "B": "$v = \\omega/r$",
                "C": "$v = \\omega r$",
                "D": "$v = \\omega r^2$",
            },
        }
    },
    "q3": {
        "zh-TW": {
            "statement": "對任何孤立雙體系統而言，在質心參考系中整個系統的總動量是多少？",
            "options": {
                "A": "永遠為零",
                "B": "等於較輕物體的 $mv$",
                "C": "等於兩個動量大小的總和",
                "D": "若不知道半徑就無法判定",
            },
        }
    },
    "q4": {
        "zh-TW": {
            "statement": "一個質量為 $m$ 的粒子，以速度 $v$ 垂直於半徑向量運動，距原點距離為 $r$。它對原點的角動量大小為何？",
            "options": {
                "A": "$L = mvr$",
                "B": "$L = mv/r$",
                "C": "$L = mr/v$",
                "D": "$L = mv + r$",
            },
        }
    },
    "q5": {
        "zh-TW": {
            "statement": "在雙體系統中，每個物體都對質心有角動量貢獻。下列哪個式子是總角動量？",
            "options": {
                "A": "$L_{\\text{total}} = L_1$",
                "B": "$L_{\\text{total}} = L_1 + L_2$",
                "C": "$L_{\\text{total}} = L_1 - L_2$，因為兩物體在相反側",
                "D": "$L_{\\text{total}} = 0$，在質心參考系中",
            },
        }
    },
    "q6": {
        "zh-TW": {
            "statement": "若質量 $m$ 與 $5m$ 的兩物體相距 $d$，並繞共同質心作圓周運動，兩者速率各是多少？",
            "options": {
                "A": "$v_m = \\omega d/6$, $v_{5m} = 5\\omega d/6$",
                "B": "$v_m = 5\\omega d/6$, $v_{5m} = \\omega d/6$",
                "C": "$v_m = v_{5m} = \\omega d/2$",
                "D": "$v_m = 5\\omega d$, $v_{5m} = \\omega d$",
            },
        }
    },
    "q7": {
        "zh-TW": {
            "statement": "雙體系統：質量 $m$ 與 $5m$ 的兩物體相距 $d$，並以角速度 $\\omega$ 繞質心旋轉。在質心參考系中，總動量為何？",
            "options": {
                "A": "0",
                "B": "$m\\omega d$",
                "C": "$5m\\omega d$",
                "D": "$m(5\\omega d/6) + 5m(\\omega d/6)$",
            },
        }
    },
    "q8": {
        "zh-TW": {
            "statement": "兩個物體位於質心兩側並做軌道運動。它們的動量大小相等。總動量應如何相加？",
            "options": {
                "A": "直接相加，因為大小都是正值",
                "B": "互相抵消，因為向量方向相反",
                "C": "較重的物體那一項比較大，所以由它決定",
                "D": "只有半徑相等時才會抵消",
            },
        }
    },
    "q9": {
        "zh-TW": {
            "statement": "某學生只計算了雙體系統中較輕物體的角動量就停止。這最可能代表哪一種診斷問題？",
            "options": {
                "A": "漏掉另一個物體的貢獻",
                "B": "用了錯誤的參考系",
                "C": "只是算術錯誤",
                "D": "沒有問題",
            },
        }
    },
    "q10": {
        "zh-TW": {
            "statement": "完整題：質量 $m$ 與 $5m$ 的兩物體相距 $d$，並以角速度 $\\omega$ 轉動。在質心參考系中，哪一組答案正確表示 $(\\text{總動量}, \\text{總角動量})$？",
            "options": {
                "A": "$(0, \\frac{5}{6} m d^2 \\omega)$",
                "B": "$(m\\omega d, \\frac{5}{6} m d^2 \\omega)$",
                "C": "$(0, \\frac{5}{36} m d^2 \\omega)$",
                "D": "$(0, \\frac{25}{36} m d^2 \\omega)$",
            },
        }
    },
}


CONCEPT_TRANSLATIONS = {
    "com_ratio": {
        "zh-TW": {
            "name": "質心距離關係",
            "description": "對兩個共線質量而言，距質心的距離滿足 $m_1 r_1 = m_2 r_2$。",
        }
    },
    "omega_to_v": {
        "zh-TW": {
            "name": "由角速度求線速度",
            "description": "在圓周運動中，切線速率滿足 $v = \\omega r$。",
        }
    },
    "com_frame_momentum": {
        "zh-TW": {
            "name": "質心參考系中的總動量",
            "description": "在質心參考系中，系統總動量為零，因此 $p_{\\text{total}} = 0$。",
        }
    },
    "single_particle_L": {
        "zh-TW": {
            "name": "單一粒子的角動量",
            "description": "若速度與半徑垂直，角動量大小為 $L = r_\\perp p = mvr$。",
        }
    },
    "multi_body_L": {
        "zh-TW": {
            "name": "系統總角動量",
            "description": "系統總角動量等於所有物體角動量的向量和，因此 $L_{\\text{total}} = \\sum_i L_i$。",
        }
    },
    "binary_system_modeling": {
        "zh-TW": {
            "name": "雙體系統建模",
            "description": "一致地結合質心幾何、圓周運動、動量與角動量。",
        }
    },
}


ERROR_TRANSLATIONS = {
    "ignore_reference_frame": {
        "zh-TW": {
            "name": "忽略參考系條件",
            "description": "學生在判斷總動量時沒有套用質心參考系條件，因此忽略了 $p_{\\text{total}} = 0$。",
            "hint_levels": [
                "題目指定的是哪一個參考系？",
                "在質心參考系中，整個系統的總動量是多少？",
                "因此，所有物體的動量向量和必須為零，也就是 $p_{\\text{total}} = 0$。",
            ],
        }
    },
    "incorrect_center_of_mass_relation": {
        "zh-TW": {
            "name": "質心距離關係顛倒",
            "description": "學生把哪個質量離質心較遠的關係判斷反了。",
            "hint_levels": [
                "較重的物體應該離質心比較近，還是較輕的物體？",
                "先寫出 $m_1 r_1 = m_2 r_2$，再代入數值。",
                "對 $m$ 與 $5m$ 而言，較輕的 $m$ 必須離質心更遠，距離是重物體的五倍。",
            ],
        }
    },
    "wrong_omega_radius_link": {
        "zh-TW": {
            "name": "錯用 $v = \\omega r$",
            "description": "學生沒有正確連結角速度、半徑與線速度，也就是沒有正確使用 $v = \\omega r$。",
            "hint_levels": [
                "等速圓周運動中，切線速率和角速度的關係是什麼？",
                "每個物體到質心的半徑不同，所以兩者速率都應該是各自的 $\\omega r$。",
                "先算 $v_1 = \\omega r_1$ 與 $v_2 = \\omega r_2$，再去求動量或角動量。",
            ],
        }
    },
    "missing_component": {
        "zh-TW": {
            "name": "漏掉其中一個物體的貢獻",
            "description": "學生在加總總角動量時只算了一個物體，因此沒有完成 $L_{\\text{total}} = L_1 + L_2$。",
            "hint_levels": [
                "這個系統中有幾個質量在繞行？",
                "請對同一個原點各寫出一個角動量項。",
                "總角動量應是 $L_1 + L_2$，不是只取其中一項。",
            ],
        }
    },
    "vector_direction_error": {
        "zh-TW": {
            "name": "向量方向判斷錯誤",
            "description": "學生把方向相反的動量當成同方向處理。",
            "hint_levels": [
                "在質心參考系中，兩個線動量的方向相同還是相反？",
                "總動量是向量和，所以在比較大小前要先處理方向或正負號。",
                "兩個物體在質心參考系中帶有大小相等、方向相反的動量。",
            ],
        }
    },
    "algebra_error": {
        "zh-TW": {
            "name": "代數或算術錯誤",
            "description": "學生的物理結構可能正確，但在代入或化簡時出錯。",
            "hint_levels": [
                "你的架構可能是對的，請重新檢查代入與化簡。",
                "先保留 $m$、$d$、$\\omega$ 這些公因子，最後再一起整理。",
                "合併後的係數應該能乾淨化簡，物理結構不應被改變。",
            ],
        }
    },
    "partial_system_model": {
        "zh-TW": {
            "name": "系統建模不完整",
            "description": "學生只回答了部分要求，或沒有把總動量與總角動量兩部分整合起來。",
            "hint_levels": [
                "題目要你求一個量，還是多個量？",
                "先把任務拆成質心幾何、動量、角動量三部分再整合。",
                "先寫總動量，再用兩個物體共同求出總角動量。",
            ],
        }
    },
}


def normalize_lang(lang: str | None) -> str:
    if lang in SUPPORTED_LANGUAGES:
        return lang
    return DEFAULT_LANGUAGE


def localized_question(question, lang: str) -> dict:
    if lang == DEFAULT_LANGUAGE:
        return question.model_dump()

    translation = QUESTION_TRANSLATIONS.get(question.id, {}).get(lang, {})
    payload = question.model_dump()
    payload["statement"] = translation.get("statement", question.statement)
    option_texts = translation.get("options", {})
    payload["options"] = [
        {**option.model_dump(), "text": option_texts.get(option.id, option.text)}
        for option in (question.options or [])
    ]
    return payload


def localized_error(error, lang: str) -> dict:
    if lang == DEFAULT_LANGUAGE:
        return error.model_dump()

    translation = ERROR_TRANSLATIONS.get(error.id, {}).get(lang, {})
    payload = error.model_dump()
    payload["name"] = translation.get("name", error.name)
    payload["description"] = translation.get("description", error.description)
    payload["hint_levels"] = translation.get("hint_levels", error.hint_levels)
    return payload


def localized_concept(concept, lang: str) -> dict:
    if lang == DEFAULT_LANGUAGE:
        return concept.model_dump()

    translation = CONCEPT_TRANSLATIONS.get(concept.id, {}).get(lang, {})
    payload = concept.model_dump()
    payload["name"] = translation.get("name", concept.name)
    payload["description"] = translation.get("description", concept.description)
    return payload


def localized_ui(lang: str) -> dict:
    return UI_TRANSLATIONS[normalize_lang(lang)]


def build_localized_metadata() -> dict[str, dict]:
    metadata: dict[str, dict] = {}
    for lang in SUPPORTED_LANGUAGES:
        metadata[lang] = {
            "concepts": [localized_concept(concept, lang) for concept in CONCEPTS],
            "errors": [localized_error(error, lang) for error in ERROR_TYPES],
            "ui": localized_ui(lang),
            "question_ids": [question.id for question in QUESTIONS],
        }
    return metadata
