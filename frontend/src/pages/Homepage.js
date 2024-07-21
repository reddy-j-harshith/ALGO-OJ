import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import './HomePage.css'

const HomePage = () => {

  let [ problems, setProblems ] = useState([])
  let { authTokens } = useContext(AuthContext)
  let { logoutUser } = useContext(AuthContext)
  
  let getProblems = async () => {
    let response = await fetch('http://localhost:8000/api/get_latest/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokens?.access}`,
      }
    })
    let data = await response.json()
    
    if(response.status === 200){
      setProblems(data)
    } else if (response.status === 401) {
      logoutUser()
    }
  }
  
    useEffect(() => {
      getProblems()
    }, [])
  
  return (
    <div className="problem-list-container">
      <h2 className="problem-list-title">Latest Problems</h2>
      <div className="problem-list">
        {problems.map((problem) => (
          <div key={problem.id} className="problem-item">
            <Link to={`/get_problem/${problem.id}`} className="problem-link">
              <div className="problem-info">
                {problem.title}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage