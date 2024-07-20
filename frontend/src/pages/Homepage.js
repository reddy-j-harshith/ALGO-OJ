import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext'

const Homepage = () => {

  let [ notes, setNotes ] = useState([])
  let { authTokens } = useContext(AuthContext)
  let logout = useContext(AuthContext)

  useEffect(() => {
    getNotes()
  }, [])

  let getNotes = async () => {
    let response = await fetch('http://localhost:8000/api/all_notes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokens.access}`,
      }
    })
    let data = await response.json()

    if(response.status === 200){
        setNotes(data)
    } else if (response.status === 401) {
        logout()
    }
  }

  return (
    <div>
      <p>You are logged into the homepage!</p>

      <ul>
        {notes.map(note => (
          <li key = {note.id}>{note.body}</li>
        ))}
      </ul>
    </div>
  )
}

export default Homepage
