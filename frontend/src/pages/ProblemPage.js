import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react"; // Import the Monaco Editor
import "./ProblemPage.css"; // Import the CSS file
import AuthContext from "../context/AuthContext";

function ProblemDetail() {
  const { code } = useParams();
  const [problem, setProblem] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("c"); // Default to 'c'
  const [submitting, setSubmitting] = useState(false);
  const [responseOutput, setResponseOutput] = useState(null);

  let { authTokens } = useContext(AuthContext); // Retrieve access token from local storage

  useEffect(() => {
    fetch(`http://localhost:8000/api/get_problem/${code}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`, // Include access token in Authorization header
      },
    })
    .then(response => response.json())
    .then(data => {
      setProblem(data);
    })
    .catch((error) => {
      console.error("Error fetching problem detail:", error);
    });
  }, [code, authTokens]);

  const handleSubmit = () => {
    // Handle code submission here
    setSubmitting(true);
    // Example: Send code and selected language to backend for processing
    console.log("Submitted code:", codeInput);
    console.log("Selected language:", selectedLanguage);

    const formData = new URLSearchParams();
    formData.append("lang", selectedLanguage);
    formData.append("problem_code", code); // Assuming problemCode is available
    formData.append("code", codeInput);

    fetch("http://localhost:8000/api/execute_code/", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`, // Include access token in Authorization header
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log("Response:", data);
      setResponseOutput(data); // Set response data directly
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      // Reset code input
      setCodeInput("");
      setSubmitting(false);
    });
  };

  let navigate = useNavigate();

  const handleForumSubmit = (e) => {
    navigate('/forum/' + problem.code);
  }

  if (!problem) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="problem-detail-container">
      <h2 className="problem-detail-title">{problem.title}</h2>
      <div className="problem-detail-content">
        <div className="problem-statement">{problem.description}</div>
      </div>
      <div className="editor-container">
        <Editor
          height="50vh"
          defaultLanguage={selectedLanguage}
          value={codeInput}
          onChange={(value) => setCodeInput(value || "")}
          theme="vs-dark"
        />
        <div className="language-select">
          <label htmlFor="language">Select Language:</label>
          <select
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="py">Python</option>
          </select>
        </div>
        <button
          className="submit-button"
          onClick={handleForumSubmit}
        >
          Forum
        </button>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
        {responseOutput && (
          <div className="output-container">
            <h2>Output:</h2>
            <p><strong>Verdict:</strong> {responseOutput.verdict}</p>
            <p><strong>Test Cases Passed:</strong> {responseOutput.test_cases_passed} / {responseOutput.total_test_cases}</p>
            <p><strong>Time Taken:</strong> {responseOutput.time_taken} seconds</p>
            <p><strong>Memory Taken:</strong> {responseOutput.memory_taken} MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDetail;
