import React, { useState, useContext } from "react";
import { Editor } from "@monaco-editor/react";
import "./IDEPage.css";
import AuthContext from "../context/AuthContext";
import Config from "../Config";

function IDEPage() {
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("c");
  const [submitting, setSubmitting] = useState(false);
  const [testCase, setTestCase] = useState(""); // Single test case
  const [testOutput, setTestOutput] = useState("");

  let { authTokens } = useContext(AuthContext);
  let baseURL = Config.baseURL;

  const handleTestCode = () => {

    setSubmitting(true);

    const requestData = {
      lang: selectedLanguage,
      code: codeInput,
      input: testCase // Single input
    };

    fetch(`${baseURL}/api/execute_code/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setTestOutput(data.output);
        } else {
          setTestOutput(data.output);
        }
      })
      .catch(() => {
        alert("Error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="compile-page-container">
      <h2 className="compile-page-title">Code Testing Page</h2>
      <div className="editor-container">
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
        <Editor
          height="50vh"
          defaultLanguage={selectedLanguage}
          value={codeInput}
          onChange={(value) => setCodeInput(value || "")}
          theme="vs-dark"
        />
        <div className="test-case-container">
          <textarea
            value={testCase}
            onChange={(e) => setTestCase(e.target.value)}
            placeholder="Stdin"
          />
        </div>
        <button
          className="submit-button"
          onClick={handleTestCode}
          disabled={submitting}
        >
          {submitting ? "Testing..." : "Test Code"}
        </button>
        {testOutput && (
          <div className="output-container">
            <h2>Stdout</h2>
            <p><strong>{testOutput}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default IDEPage;
