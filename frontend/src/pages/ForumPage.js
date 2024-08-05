import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import AuthContext from '../context/AuthContext';
import Config from '../Config';
import './ForumPage.css';

const ForumPage = () => {
  const { code } = useParams();
  const { authTokens } = useContext(AuthContext);
  const [forumMessages, setForumMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const baseURL = Config.baseURL;
  
  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [authTokens, code, baseURL]);

  const fetchMessages = () => {
    fetch(`${baseURL}/api/get_forum/${code}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
      },
    })
    .then(response => response.json())
    .then(data => setForumMessages(data))
    .catch(error => console.error('Error fetching forum messages:', error));
  };

  const handlePostMessage = () => {
    const requestData = {
      content: `${textInput}\n________________________\n\n${codeInput}`,
    };

    fetch(`${baseURL}/api/post_message/${code}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens?.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
      // Update the state to include the new message
      setForumMessages(prevMessages => [...prevMessages, {
        ...data,
        date: new Date().toISOString(), // Set the current date
      }]);
      setTextInput('');
      setCodeInput('');
      setShowCodeEditor(false);
    })
    .catch(error => console.error('Error posting message:', error));
  };

  return (
    <div className="forum-container">
      <h2 className="forum-title">Forum</h2>
      <div className="messages-container">
        {forumMessages.map((message, index) => (
          <div key={index} className="message">
            <p className="message-user">By: {message.user}, @ {new Date(message.date).toLocaleString()}</p>
            <p className="message-content">{message.content}</p>
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter your message"
        />
        <button
          onClick={() => setShowCodeEditor(!showCodeEditor)}
          className="add-code-button"
        >
          {showCodeEditor ? "Remove Code Block" : "Add Code Block"}
        </button>
        {showCodeEditor && (
          <Editor
            height="20vh"
            language="javascript"
            value={codeInput}
            onChange={(value) => setCodeInput(value)}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        )}
        <button onClick={handlePostMessage} className="post-button">Post Message</button>
      </div>
    </div>
  );
};

export default ForumPage;
