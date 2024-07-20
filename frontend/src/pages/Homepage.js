import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'

const Homepage = () => {

  let [ problems, setProblems ] = useState([])
  let { authTokens } = useContext(AuthContext)
  let logout = useContext(AuthContext)

  useEffect(() => {
    getProblems()
  })

  let getProblems = async () => {
    let response = await fetch('http://localhost:8000/api/get_latest/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokens.access}`,
      }
    })
    let data = await response.json()

    if(response.status === 200){
        setProblems(data)
    } else if (response.status === 401) {
        logout()
    }
  }

  return (
    <div>
      <p>You are logged into the homepage!</p>

      <ul>
        {problems.map(note => (
          <Link to={`/get_problem/${note.id}`} key={note.id}>
            <li>{note.title}</li>
          </Link>
        ))}
      </ul>
    </div>
  )
}

export default Homepage
