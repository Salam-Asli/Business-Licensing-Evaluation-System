from fastapi import FastAPI
from pydantic import BaseModel
import openai
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Allow frontend to talk with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can replace "*" with ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
openai.api_key = "YOUR_API_KEY"

class ReportRequest(BaseModel):
    formData: dict
    applicableRules: list

@app.post("/generate-report")
async def generate_report(req: ReportRequest):
    prompt = f"""
    נתוני העסק:
    גודל: {req.formData.get('size')} מ"ר
    מקומות ישיבה: {req.formData.get('seats')}
    מאפיינים: {', '.join([k for k, v in req.formData.items() if v is True])}

    דרישות רגולטוריות רלוונטיות:
    {', '.join([r['requirement'] for r in req.applicableRules])}

    צור דוח ברור, מחולק לקטגוריות, בשפה פשוטה ובעלת המלצות פעולה.
    """

    completion = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )

    return {"report": completion.choices[0].message["content"]}
