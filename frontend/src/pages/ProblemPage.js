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

  let { authTokens, user } = useContext(AuthContext);
  let baseURL = import.meta.env.DJANGO_BASE_URL;

  useEffect(() => {
    fetch(`${baseURL}/api/get_problem/${code}/`, {
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

    const fetchLastSave = () => {
      if (!authTokens || !code) return;

      fetch(`${baseURL}/api/fetch_latest_code/${user.user_id}/${code}/`, {
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
        setSelectedLanguage(data.language);
      })
      .catch((error) => {
        console.error("Error fetching last submission:", error);
      });
    };

    fetchLastSave();
  }, [authTokens, code, user]);

  const handleSaveCode = () => {
    const requestData = {
      user_id: user.user_id,
      problem_code: code,
      code: codeInput,
      language: selectedLanguage
    };

    fetch(`${baseURL}/api/update_latest_code/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save code');
      }
      return response.json();
    })
    .then(data => {
      console.log("Code saved successfully:", data);
    })
    .catch((error) => {
      console.error("Error saving code:", error);
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        handleSaveCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [codeInput, selectedLanguage]);

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
    if (testCases.length === 0 || testCases.every(testCase => testCase.trim() === "")) {
      setError("You must add at least one test case.");
      return;
    }

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

  const handleSubmit = () => {
    setSubmitting(true);
    setError(null);

    const formData = new URLSearchParams();
    formData.append("lang", selectedLanguage);
    formData.append("problem_code", code);
    formData.append("code", codeInput);

    fetch(`${baseURL}/api/submit_code/`, {
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
  };

  if (!problem) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="problem-detail-container">
      <h2 className="problem-detail-title">{problem.title}</h2>
      <div className="resizable-container">
        <div className="resizable problem-detail-content">
          <div className="problem-buttons">
            <button onClick={handleForumSubmit} className="description-button">Forum</button>
            <span>|      |</span>
            <button className="description-button">Submissions</button>
            <span>|      |</span>
            <button className="description-button">Leaderboard</button>
          </div>
          <hr></hr>
          <br></br>
          <div className="problem-desc"> {problem.description}</div>
        </div>
        <div className="resizable editor-container">
          <Editor
            height="50vh"
            language={selectedLanguage}
            value={codeInput}
            onChange={(value) => setCodeInput(value)}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
          <div className="language-select">
            <label htmlFor="language">Select Language:</label>
            <select id="language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="py">Python</option>
            </select>
          </div>
          <div className="test-case-container">
            {testCases.map((testCase, index) => (
              <div key={index} className="test-case">
                <textarea
                  value={testCase}
                  onChange={(e) => handleTestCaseChange(index, e.target.value)}
                  rows="2"
                  placeholder={`Test Case ${index + 1}`}
                />
                <button onClick={() => handleRemoveTestCase(index)}>-</button>
              </div>
            ))}
            <button className="add-test" onClick={handleAddTestCase}>+</button>
          </div>
          <div className="submit-buttons-container">
            <button onClick={handleTestCode} className="submit-button" disabled={submitting}>
              {submitting ? "Testing..." : "Test"}
            </button>
            <button onClick={handleSubmit} className="submit-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
          {error && (
            <div className="output-container error">
              <h2>Error:</h2>
              <p>{error}</p>
            </div>
          )}
          {testOutput && Array.isArray(testOutput) && (
            <div className="output-container">
              <h2>Test Case Output:</h2>
              {testOutput.map((output, index) => (
                <p key={index}><strong>Test Case {index + 1}:</strong> {output}</p>
              ))}
            </div>
          )}
          {responseOutput && (
            <div className="output-container">
            <h2>Result:</h2>
            <p><strong>Verdict:</strong> {responseOutput.verdict}</p>
            <p><strong>Test Cases Passed:</strong> {responseOutput.test_cases_passed} / {responseOutput.total_test_cases}</p>
            <p><strong>Time Taken:</strong> {responseOutput.time_taken} seconds</p>
            <p><strong>Memory Taken:</strong> {responseOutput.memory_taken} B</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
