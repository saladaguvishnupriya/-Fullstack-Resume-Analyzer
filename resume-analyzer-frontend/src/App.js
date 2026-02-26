import React, { useState } from "react";
import axios from "axios";

const SKILLS = ["python", "react", "sql", "fastapi", "aws", "docker"];

function App() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a PDF resume.");
      return;
    }

    if (!jobDesc.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDesc);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData
      );

      setResult(response.data);
    } catch (err) {
      setError("Server error. Make sure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>💼 Resume Skill Analyzer</h1>
      <p style={{ color: "#666" }}>Check which technical skills are present in your resume</p>

      <div style={{ marginBottom: "20px" }}>
        <label><strong>Upload Resume (PDF):</strong></label><br />
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginTop: "8px" }}
        />
        {file && <p style={{ color: "green", marginTop: "5px" }}>✓ {file.name} selected</p>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label><strong>Paste Job Description:</strong></label><br />
        <textarea
          rows="8"
          style={{ width: "100%", padding: "10px", marginTop: "8px", fontFamily: "monospace" }}
          placeholder="Paste the job description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "12px 24px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold"
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && (
        <div style={{ color: "red", marginTop: "20px", padding: "12px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "30px", borderTop: "2px solid #007bff", paddingTop: "20px" }}>
          <h2>📊 Skills Analysis Results</h2>

          <div style={{ marginBottom: "20px" }}>
            <h3>Skill Match Status:</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {SKILLS.map((skill) => {
                // Check skill status from the detailed all_skills object if available
                let status = "not_found";
                if (result.all_skills && result.all_skills[skill]) {
                  status = result.all_skills[skill];
                } else if (result.matched_keywords && result.matched_keywords.includes(skill)) {
                  status = "matched";
                } else if (result.missing_keywords && result.missing_keywords.includes(skill)) {
                  status = "missing";
                }

                let bgColor = "#f8f9fa";
                let borderColor = "#f3ecec";
                let textColor = "#666";
                let icon = "☐";

                if (status === "matched") {
                  bgColor = "#d4edda";
                  borderColor = "#28a745";
                  textColor = "#155724";
                  icon = "✓";
                } else if (status === "missing") {
                  bgColor = "#f8d7da";
                  borderColor = "#f5c6cb";
                  textColor = "#721c24";
                  icon = "✗";
                } else if (status === "bonus") {
                  bgColor = "#fff3cd";
                  borderColor = "#ffc107";
                  textColor = "#856404";
                  icon = "⚡";
                }

                return (
                  <div
                    key={skill}
                    style={{
                      padding: "10px 14px",
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: "4px",
                      color: textColor,
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    title={status === "matched" ? "Found in resume" : status === "missing" ? "Required but missing" : status === "bonus" ? "Bonus skill" : "Not found"}
                  >
                    {icon} {skill}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f8ff", borderRadius: "4px" }}>
            <h3>📈 Overall Match: {result.match_percentage}%</h3>
            <p><strong>Skills Found:</strong> {result.matched_keywords ? result.matched_keywords.length : 0} / {result.total_jd_keywords}</p>
            <p><strong>Skills Missing:</strong> {result.missing_keywords ? result.missing_keywords.length : 0}</p>
            {result.matched_keywords && result.matched_keywords.length > 0 && (
              <p><strong>Matched:</strong> {result.matched_keywords.join(", ")}</p>
            )}
            {result.missing_keywords && result.missing_keywords.length > 0 && (
              <p><strong>Missing:</strong> <span style={{ color: "#721c24" }}>{result.missing_keywords.join(", ")}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;