// App.jsx
import React, { useState, useMemo } from "react";
import "./App.css"
function InputField({ label, name, type = "text", placeholder, value, onChange, onBlur, error, touched }) {
  return (
    <div>
      <label className="block text-sm font-semibold">{label}</label>
      <div className={`mt-2 flex items-center rounded-xl border px-3 py-2 bg-white
        ${touched && error ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-300 focus-within:ring-2 focus-within:ring-sky-500"}`}>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent placeholder-slate-400"
          min={0}
          inputMode={type === "number" ? "numeric" : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      {touched && error && <p id={`${name}-error`} className="text-rose-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function App() {
  const [formData, setFormData] = useState({ size: "", seats: "", gas: "" });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [aiReport, setAiReport] = useState("");

  const regulations = [
    { id: 1, requirement: "רישיון עסק חובה לעסקים מעל 40 מ״ר", minSize: 40, appliesTo: [] },
    { id: 2, requirement: "מספר מקומות ישיבה", appliesTo: ["seats"] },
    { id: 3, requirement: "חובה לדווח על שימוש בגז", appliesTo: ["gas"] },
  ];

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const errors = useMemo(() => {
    const errs = {};
    if (!formData.size) errs.size = "אנא הזן גודל";
    else if (Number(formData.size) <= 0) errs.size = "חייב להיות גדול מ-0";
    if (!formData.seats) errs.seats = "אנא הזן מקומות ישיבה";
    else if (Number(formData.seats) < 0) errs.seats = "לא ניתן מספר שלילי";
    if (formData.gas && Number(formData.gas) < 0) errs.gas = "לא ניתן מספר שלילי";
    return errs;
  }, [formData]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const getApplicableRegulations = (formData, regulations) =>
    regulations.filter(rule => {
      const sizeOk = !rule.minSize || Number(formData.size) >= rule.minSize;
      const featuresOk = !rule.appliesTo || rule.appliesTo.length === 0 || rule.appliesTo.some(f => formData[f]);
      return sizeOk && featuresOk;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const applicableRules = getApplicableRegulations(formData, regulations);

      const response = await fetch("http://127.0.0.1:8000/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, applicableRules }),
      });

      const data = await response.json();
      if (data.report) setAiReport(data.report);
      else setMsg("שגיאה ביצירת הדוח: " + (data.error || "לא ידועה"));
    } catch (err) {
      setMsg("שגיאת תקשורת עם השרת: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setFormData({ size: "", seats: "", gas: "" });
    setTouched({});
    setMsg("");
    setAiReport("");
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-50 via-white to-sky-100">
      <div className="w-full max-w-xl">
        <form onSubmit={handleSubmit} className="bg-white/90 border border-slate-200 rounded-2xl shadow-xl p-6 space-y-5">
          <h2 className="text-2xl font-extrabold text-center">שאלון רישוי עסק</h2>

          <InputField label="גודל העסק (מ״ר)" name="size" type="number" placeholder="לדוגמה: 50" value={formData.size} onChange={handleChange} onBlur={handleBlur} error={errors.size} touched={touched.size} />
          <InputField label="מספר מקומות ישיבה" name="seats" type="number" placeholder="לדוגמה: 30" value={formData.seats} onChange={handleChange} onBlur={handleBlur} error={errors.seats} touched={touched.seats} />
          <InputField label="שימוש בגז" name="gas" type="number" placeholder="לדוגמה: 2" value={formData.gas} onChange={handleChange} onBlur={handleBlur} error={errors.gas} touched={touched.gas} />

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onReset} className="h-11 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">נקה</button>
            <button type="submit" disabled={loading || !isValid} className={`h-11 rounded-xl text-white font-semibold ${loading || !isValid ? "bg-slate-400" : "bg-sky-600 hover:bg-sky-700"}`}>{loading ? "שולח..." : "שלח"}</button>
          </div>

          {msg && <p className="text-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2">{msg}</p>}
        </form>

            {aiReport && (
  <div className="mt-10 flex justify-center" aria-live="polite">
    <div className="w-full max-w-3xl report-wrapper">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 report-header">
        <div className="text-right">
          <h3 className="text-2xl font-extrabold report-title">דוח רישוי מותאם אישית</h3>
          <p className="text-xs report-sub">נוצר אוטומטית על בסיס הנתונים שהוזנו</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{borderColor:"#e2e8f0", background:"#fff", color:"#334155"}}
            onClick={async function () {
              try { await navigator.clipboard.writeText(aiReport); alert("הדוח הועתק"); }
              catch(e){ alert("שגיאה בהעתקה"); }
            }}
          >העתק</button>

          {/* Download */}
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{borderColor:"#e2e8f0", background:"#fff", color:"#334155"}}
            onClick={function () {
              var blob = new Blob([aiReport], { type:"text/plain;charset=utf-8" });
              var url = URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url; a.download = "report.txt"; a.click();
              URL.revokeObjectURL(url);
            }}
          >הורד</button>

          {/* Print */}
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm font-semibold"
            style={{borderColor:"#e2e8f0", background:"#fff", color:"#334155"}}
            onClick={function () {
              var w = window.open("", "_blank", "noopener,noreferrer");
              if (!w) return;
              w.document.write(
                "<!doctype html><html dir='rtl'><head><meta charset='utf-8'><title>דוח</title>" +
                "<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.8;color:#0f172a;padding:24px}h1{font-size:20px;margin:0 0 12px}ul{padding-right:1.2rem}li{margin:6px 0}</style>"+
                "</head><body><h1>דוח רישוי מותאם אישית</h1><pre style='white-space:pre-wrap'>" +
                (aiReport||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") +
                "</pre></body></html>"
              );
              w.document.close(); w.focus(); w.print();
            }}
          >הדפס</button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 text-right" style={{background:"transparent"}}>
        {/* TOC */}
        <ol className="mb-5 list-decimal" style={{paddingRight:"1.25rem", color:"#64748b", fontSize:"13px", lineHeight:"1.9"}}>
          {aiReport.split(/\n+/).map(function (line, i) {
            if (/^#{1,6}\s+/.test((line||"").trim())) {
              return (
                <li key={"toc-"+i}>
                  <a
                    href={"#sec-"+i}
                    onClick={function (e){ e.preventDefault(); var el=document.getElementById("sec-"+i); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }}
                    style={{color:"inherit", textDecoration:"none"}}
                    onMouseEnter={function(e){ e.currentTarget.style.textDecoration="underline"; }}
                    onMouseLeave={function(e){ e.currentTarget.style.textDecoration="none"; }}
                  >
                    {line.replace(/^#{1,6}\s+/, "")}
                  </a>
                </li>
              );
            }
            return null;
          })}
        </ol>

        {/* Content surface */}
        <div className="report-surface" style={{padding:"20px"}}>
          {aiReport.split(/\n+/).map(function (line, idx) {
            var t = (line||"").trim();
            if (!t) return null;

            // Headings
            if (/^#{1,6}\s+/.test(t)) {
              return (
                <h4 key={"h-"+idx} id={"sec-"+idx} className="report-h">
                  {t.replace(/^#{1,6}\s+/, "")}
                </h4>
              );
            }

            // Bullets
            if (/^[-•]\s+/.test(t)) {
              return (
                <ul key={"ul-"+idx} className="report-ul">
                  <li className="report-li">{t.replace(/^[-•]\s+/, "")}</li>
                </ul>
              );
            }

            // Paragraphs
            return (
              <p key={"p-"+idx} className="report-p">
                {line}
              </p>
            );
          })}
          <hr className="report-hr" />
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
