import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/get_problem/${id}`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        ); //
        const data = await response.json();
        setProblem(data);
      } catch (error) {
        console.error('Error fetching problem:', error);
      }
    };

    fetchProblem();
  }, [id]);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleSubmit = () => {
    // Handle code submission here
    console.log('Submitted code:', code);
  };

  return (
    <div>
      {problem ? (
        <div>
          <h1>{problem.title}</h1>
          <p>{problem.description}</p>
        </div>
      ) : (
        <p>Loading problem...</p>
      )}

      <div>
        <textarea value={code} onChange={handleCodeChange} />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default ProblemPage;
