import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './SubmissionsPage.css';
import ReactPaginate from 'react-paginate';
import Config from '../Config';

const SubmissionsPage = () => {
  let { id, code } = useParams();
  let [submissions, setSubmissions] = useState([]);
  let [pageCount, setPageCount] = useState(0);
  let { authTokens } = useContext(AuthContext);
  let { logoutUser } = useContext(AuthContext);

  let baseURL = Config.baseURL;

  let getSubmissions = async (currentPage = 1) => {
    let response = await fetch(`${baseURL}/api/get_user_submissions/${id}/${code}/?page=${currentPage}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokens?.access}`,
      },
    });
    let data = await response.json();

    if (response.status === 200) {
      setSubmissions(data.results);
      setPageCount(Math.ceil(data.count / 10));
    } else if (response.status === 401) {
      logoutUser();
    }
  };

  useEffect(() => {
    getSubmissions();
  }, []);

  const handlePageClick = (data) => {
    let selectedPage = data.selected + 1;
    getSubmissions(selectedPage);
  };

  return (
    <div className="submissions-list-container">
      <h2 className="submissions-list-title">Previous Submissions</h2>
      <div className="submissions-list">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Language</th>
              <th>Status</th>
              <th>Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="submission-link-row">
                <td>
                  <Link to={`/get_problem/${code}?submission=${submission.id}`} className="submission-link">
                    {submission.verdict}
                  </Link>
                </td>
                <td>
                  <Link to={`/get_problem/${code}?submission=${submission.id}`} className="submission-link">
                    {submission.language}
                  </Link>
                </td>
                <td>
                  <Link to={`/get_problem/${code}?submission=${submission.id}`} className="submission-link">
                    {submission.time} * 1000 ms
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
  );
};

export default SubmissionsPage;
