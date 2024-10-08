import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import "./ProblemPage.css";
import AuthContext from "../context/AuthContext";
import Config from "../Config";

function ProblemPage() {
  const { code } = useParams();
  const location = useLocation();
  const [problem, setProblem] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("c");
  const [submitting, setSubmitting] = useState(false);
  const [responseOutput, setResponseOutput] = useState(null);
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  let { authTokens, user } = useContext(AuthContext);
  let baseURL = Config.baseURL;

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
    .catch(() => {
      console.log("No previous code exists!");
    });

    const queryParams = new URLSearchParams(location.search);
    const submissionId = queryParams.get('submission');

    const fetchCode = () => {
      if (!authTokens || !code) return;

      const url = submissionId 
        ? `${baseURL}/api/get_submission/${submissionId}/` 
        : `${baseURL}/api/fetch_latest_code/${user.user_id}/${code}/`;

      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch code');
        }
        return response.json();
      })
      .then(data => {
        setCodeInput(data.code);
        setSelectedLanguage(data.language);
        setMessage(submissionId ? "Previous submission code loaded." : "Previous checkpoint fetched successfully.");
      })
      .catch(() => {
        console.log("No previous code found");
      });
    };

    fetchCode();
  }, [authTokens, code, user, location.search]);

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
    .then(() => {
      setMessage("Code saved successfully.");
    })
    .catch(() => {
      setMessage("Error saving code.");
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

  const handleTestCode = () => {
    setStdout("Running...");

    setSubmitting(true);

    const requestData = {
      lang: selectedLanguage,
      code: codeInput,
      input: stdin
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
        setStdout(data.output);
      } else {
        setStdout(data.output);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

  const handleFetchPreviousSubmission = () => {
    if (!authTokens || !code) return;
  
    fetch(`${baseURL}/api/get_last_submission/${user.user_id}/${code}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch previous submission');
      }
      return response.json();
    })
    .then(data => {
      setCodeInput(data.code);
      setSelectedLanguage(data.language);
      setMessage("Previous submission fetched successfully.");
    })
    .catch((error) => {
      setMessage("No Previous Submission Found.");
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
      handleSaveCode();
      setResponseOutput(data);
      setMessage("Code submitted successfully.");
    })
    .catch((error) => {
      alert("Error submitting code");
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

  const handleSubmissionsSubmit = (e) => {
    navigate('/submissions/' + user.user_id + '/' + problem.code);
  }

  return (
    <div className="problem-detail-container">
      <h2 className="problem-detail-title">{problem.title}</h2>
      <div className="resizable-container">
        <div className="resizable problem-detail-content">
          <div className="problem-buttons">
            <button onClick={handleForumSubmit} className="description-button">Forum</button>
            <span>|      |</span>
            <button onClick={handleSubmissionsSubmit} className="description-button">Submissions</button>
            <span>|      |</span>
            <button onClick={handleFetchPreviousSubmission} className="description-button">Previous submission</button>
          </div>
          <hr></hr>
          <br></br>
          <div className="problem-desc"> {problem.description}</div>
        </div>
        <div className="resizable editor-container">
          <div className="language-select">
            <label htmlFor="language">Select Language:</label>
            <select id="language" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="py">Python</option>
            </select>
          </div>
          <Editor
            height="50vh"
            language={selectedLanguage}
            value={codeInput}
            onChange={(value) => setCodeInput(value)}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
          <h5>Press Ctrl + S to save your code</h5>
          {message && (
            <div className="message-container">
              <p>{message}</p>
            </div>
          )}
          <div className="test-case-container">
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows="4"
              placeholder="Stdin"
            />
            <textarea
              value={stdout}
              onChange={(e) => setStdout(e.target.value)}
              rows="4"
              placeholder="Stdout"
              readOnly
            />
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
          {responseOutput && (
            <div className="output-container">
              <h2>Result:</h2>
              <p><strong>Verdict:</strong> {responseOutput.verdict}</p>
              <p><strong>Test Cases Passed:</strong> {responseOutput.test_cases_passed} / {responseOutput.total_test_cases}</p>
              <p><strong>Time Taken:</strong> {responseOutput.time_taken} ms</p>
              <p><strong>Memory Used:</strong> {responseOutput.memory_taken} KB</p>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
