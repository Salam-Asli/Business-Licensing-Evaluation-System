# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env that sits next to this server.py file (works regardless of CWD / reloader)
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")
print("key loaded??? ",os.getenv("OPENAI_API_KEY")is not None)
# === FastAPI setup ===
app = FastAPI()

# Allow frontend (React) to talk with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# === Request model ===
class ReportRequest(BaseModel):
    formData: dict
    applicableRules: list

# === Generate report endpoint ===
@app.post("/generate-report")
async def generate_report(req: ReportRequest):
    try:
        features = [k for k, v in req.formData.items() if v not in ("", None, "0", 0, False)]
        prompt = f"""
אתה יועץ רישוי עסקים בישראל.

נתוני העסק:
- גודל: {req.formData.get('size')} מ"ר
- מקומות ישיבה: {req.formData.get('seats')}
- מאפיינים מיוחדים: {', '.join(features) if features else 'ללא'}

דרישות רגולטוריות רלוונטיות:
{', '.join([r['requirement'] for r in req.applicableRules])}

צור דוח מותאם אישית:
- חלוקה לקטגוריות (רגולציה, בטיחות, בריאות)
- הסבר כל דרישה בשפה פשוטה וברורה
- ציין אם העסק חייב לעמוד בדרישה
- ספק המלצות פעולה מעשיות
"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        report_text = response.choices[0].message.content
        return {"report": report_text}

    except Exception as e:
        return {"error": str(e)}
# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

# === FastAPI setup ===
app = FastAPI()

# Allow frontend (React) to talk with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === OpenAI client (using environment variable) ===
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# OR for local testing: client = OpenAI(api_key="sk-xxxxxxxxxxxxxxxxxxxx")

# === Request model ===
class ReportRequest(BaseModel):
    formData: dict
    applicableRules: list

# === Generate report endpoint ===
@app.post("/generate-report")
async def generate_report(req: ReportRequest):
    try:
        features = [k for k, v in req.formData.items() if v not in ("", None, "0", 0, False)]
        prompt = f"""
אתה יועץ רישוי עסקים בישראל.

נתוני העסק:
- גודל: {req.formData.get('size')} מ"ר
- מקומות ישיבה: {req.formData.get('seats')}
- מאפיינים מיוחדים: {', '.join(features) if features else 'ללא'}

דרישות רגולטוריות רלוונטיות:
{', '.join([r['requirement'] for r in req.applicableRules])}

צור דוח מותאם אישית:
- חלוקה לקטגוריות (רגולציה, בטיחות, בריאות)
- הסבר כל דרישה בשפה פשוטה וברורה
- ציין אם העסק חייב לעמוד בדרישה
- ספק המלצות פעולה מעשיות
"""
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        report_text = response.choices[0].message.content
        return {"report": report_text}

    except Exception as e:
        return {"error": str(e)}
