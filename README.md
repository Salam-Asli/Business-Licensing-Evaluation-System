# Business-Licensing-Evaluation-System
This repository contains the relevant files for Business Licensing Evaluation System based on python and react

1. Technologies :  
Frontend: React + TailwindCSS
Backend: FastAPI (Python)
AI: OpenAI GPT 
Tools: Axios, Uvicorn

3. Backend setup:
uvicorn server:app --reload --host 0.0.0.0 --port 8000
The API server will run at: http://127.0.0.1:8000
Swagger UI available at: http://127.0.0.1:8000/docs

3. frontend setup :
cd frontend
npm install
npm run dev
The app will run at: http://localhost:5173

📑 AI Usage

Model: GPT-4 (via OpenAI API)
Purpose: Generate a customized report based on user input
Process:
Frontend sends formData + applicableRules to backend
Backend passes the data to the LLM
The model returns a clear, readable report
The report is displayed in the frontend


Innovation & Creativity
Using an LLM to transform regulatory/legal text into simple business language.
Full personalization according to business data.
Future extension: PDF export, risk scoring, or recommendation system.


API Documentation: 
POST /generate_report
Input: JSON object with user answers + applicable regulations
Output: JSON with generated report text
Example: 
   {
  "formData": {
    "size": "small",
    "seats": 25
  },
  "regulations": [
    {"id": 2, "requirement": "מספר מקומות ישיבה"},
    {"id": 3, "requirement": "חובה לדווח על שימוש בגז"}
  ]
}
Response: 
{
  "id": Number,
  "requirement": String,
  "appliesTo": [ { "size": String, "seats": Number } ]
}


Matching Algorithm
Filter regulations based on:
Business size
Number of seats
Special attributes ( gas usage)
Return only relevant rules to the user.


AI Usage Documentation
AI Tools
OpenAI GPT-4: For natural language report generation.
Prompt Engineering: To translate regulations into clear, simple business language.
Main Language Model
Chosen GPT because:
Strong language abilities.
Can summarize complex regulations into clear text.
Easy integration with Python backend.



Learning and Improvements
Development Log
Challenges:
Connecting React with FastAPI (CORS, fetch errors).
Designing data structure for regulations.
Getting AI output to be consistent.

Solutions:
Fixed CORS by configuring FastAPI.
Created simple regulations.js file to hold rules.
Added retries and better prompts for AI.
Future Improvements
Export report as PDF/Word.
Add a dashboard to track compliance status.
Allow multi-language support.
Connect to real regulatory database.

Lessons Learned:
Importance of clear data structure before using AI.
Need for error handling in async frontend–backend communication.
Prompt design has huge impact on report quality.

