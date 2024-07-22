import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');

  let {authTokens} = useContext(AuthContext);

  useEffect(() => {
    const fetchProblem = async () => {

      const response = await fetch(`/api/get_problem/${id}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokens?.access}`,
            'Content-Type': 'application/json',
          }
        }
      ); //
      console.log('Problem:', response.status);
      const data = await response.json();
      setProblem(data);


      if (response.status === 401) {
        // Handle unauthorized
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
