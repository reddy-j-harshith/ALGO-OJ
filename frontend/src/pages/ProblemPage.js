import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import "./ProblemPage.css";
import AuthContext from "../context/AuthContext";

function ProblemPage() {
  const { code } = useParams();
  const [problem, setProblem] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("c");
  const [submitting, setSubmitting] = useState(false);
  const [responseOutput, setResponseOutput] = useState(null);
  const [testCases, setTestCases] = useState([""]);
  const [testOutput, setTestOutput] = useState([]);
  const [error, setError] = useState(null);

  let { authTokens } = useContext(AuthContext);
  let { user } = useContext(AuthContext);

  useEffect(() => {
    fetch(`http://localhost:8000/api/get_problem/${code}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      setProblem(data);
    })
    .catch((error) => {
      console.error("Error fetching problem detail:", error);
    });

    const fetchLastSubmission = () => {
      if (!authTokens || !code) return; // Ensure auth tokens and problem code are available
  
      fetch(`http://localhost:8000/api/get_last_submission/${user.user_id}/${code}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch last submission');
        }
        return response.json();
      })
      .then(data => {
        console.log("Last submission:", data);
        setCodeInput(data.code);
        setSelectedLanguage(data.lang);
      })
      .catch((error) => {
        console.error("Error fetching last submission:", error);
      });
    };
  
    fetchLastSubmission();
  }, [authTokens, code, user]);

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

    fetch("http://localhost:8000/api/execute_code/", {
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

  const handleSubmit = () => {
    setSubmitting(true);
    setError(null); // Reset error state
    console.log("Submitted code:", codeInput);
    console.log("Selected language:", selectedLanguage);

    const formData = new URLSearchParams();
    formData.append("lang", selectedLanguage);
    formData.append("problem_code", code);
    formData.append("code", codeInput);

    fetch("http://localhost:8000/api/submit_code/", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.detail || "Unknown error");
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("Response:", data);
      setResponseOutput(data);
    })
    .catch((error) => {
      console.error("Error:", error);
      setError(error.message);
    })
    .finally(() => {
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
          onClick={handleForumSubmit}
        >
          Forum
        </button>
        <button
          className="submit-button"
          onClick={handleTestCode}
          disabled={submitting}
        >
          {submitting ? "Testing..." : "Test Code"}
        </button>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
        {error && (
          <div className="output-container error">
            <h2>Error:</h2>
            <p>{error}</p>
          </div>
        )}
        {testOutput && Array.isArray(testOutput) && (
          <div className="output-container">
            <h2>Output:</h2>
            {testOutput.map((output, index) => (
              <p key={index}><strong>Test Case {index + 1}:</strong> {output}</p>
            ))}
          </div>
        )}
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

export default ProblemPage;
