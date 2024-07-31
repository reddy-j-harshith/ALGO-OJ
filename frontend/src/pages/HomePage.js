import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import './HomePage.css'
import ReactPaginate from 'react-paginate';
import Config from '../Config';

const HomePage = () => {

  let [ problems, setProblems ] = useState([])
  let [ pageCount, setPageCount ] = useState(0)
  let { authTokens } = useContext(AuthContext)
  let { logoutUser } = useContext(AuthContext)
  
  let baseURL = Config.baseURL
  
  let getProblems = async (currentPage = 1) => {
    let response = await fetch(`${baseURL}/api/get_latest/?page=${currentPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokens?.access}`,
      }
    })
    let data = await response.json()

    if(response.status === 200){
      setProblems(data.results)
      setPageCount(Math.ceil(data.count / 10))
    } else if (response.status === 401) {
      logoutUser()
    }
  }

  useEffect(() => {
    getProblems()
  }, [])

  const handlePageClick = (data) => {
    let selectedPage = data.selected + 1
    getProblems(selectedPage)
  }

  return (
    <div className="problem-list-container">
      <h2 className="problem-list-title">Latest Problems</h2>
      <div className="problem-list">
        <table className="problem-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Solved</th>
              <th>Attempts</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.code} className="problem-link-row">
                <td>
                  <Link to={`/get_problem/${problem.code}`} className="problem-link">
                    {problem.title}
                  </Link>
                </td>
                <td>
                  <Link to={`/get_problem/${problem.code}`} className="problem-link">
                    {problem.difficulty}
                  </Link>
                </td>
                <td>
                  <Link to={`/get_problem/${problem.code}`} className="problem-link">
                    {problem.solved}
                  </Link>
                </td>
                <td>
                  <Link to={`/get_problem/${problem.code}`} className="problem-link">
                    {problem.attempts}
                  </Link>
                </td>
                <td>
                  <Link to={`/get_problem/${problem.code}`} className="problem-link">
                    {isNaN(((problem.solved / problem.attempts) * 100).toFixed(2)) ? '-' : ((problem.solved / problem.attempts) * 100).toFixed(2) + '%'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}
      />
    </div>
  )
}

export default HomePage
