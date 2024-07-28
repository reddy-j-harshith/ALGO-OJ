import React, { useState, useContext } from "react";
import { Editor } from "@monaco-editor/react";
import "./IDEPage.css";
import AuthContext from "../context/AuthContext";
import Config from "../Config";

function IDEPage() {
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("c");
  const [submitting, setSubmitting] = useState(false);
  const [testCases, setTestCases] = useState([""]);
  const [testOutput, setTestOutput] = useState([]);

  let { authTokens } = useContext(AuthContext);
  let baseURL = Config.baseURL;

  const handleAddTestCase = () => {
    setTestCases([...testCases, ""]);
  };

  const handleRemoveTestCase = (index) => {
    const newTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(newTestCases);
  };

  const handleTestCaseChange = (index, value) => {
    const newTestCases = [...testCases];
    newTestCases[index] = value;
    setTestCases(newTestCases);
  };

  const handleTestCode = () => {
    setSubmitting(true);
    console.log("Testing code:", codeInput);
    console.log("Selected language:", selectedLanguage);

    const requestData = {
      lang: selectedLanguage,
      code: codeInput,
      inputs: testCases
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
      console.log("Test Response:", data);
      if (data.error) {
        setTestOutput([data.output]);
      } else {
        setTestOutput(data.output);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <div className="compile-page-container">
      <h2 className="compile-page-title">Code Testing Page</h2>
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
        <div className="test-case-container">
          <h3>Test Cases</h3>
          {testCases.map((testCase, index) => (
            <div key={index} className="test-case">
              <textarea
                value={testCase}
                onChange={(e) => handleTestCaseChange(index, e.target.value)}
                placeholder={`Test Case ${index + 1}`}
              />
              <button onClick={() => handleRemoveTestCase(index)}>-</button>
            </div>
          ))}
          <button onClick={handleAddTestCase} className="add-test">+</button>
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
            <h2>Output:</h2>
            {testOutput.map((output, index) => (
              <p key={index}><strong>Test Case {index + 1}:</strong> {output}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IDEPage;
