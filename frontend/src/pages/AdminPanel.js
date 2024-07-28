import React, { useState, useEffect, useContext } from 'react';
import ReactPaginate from 'react-paginate';
import './AdminPanel.css';
import AuthContext from '../context/AuthContext';
import Config from '../Config';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);

    const baseURL = Config.baseURL;

    const usersPerPage = 3; // For testing with 3 entries per page

    let { authTokens, user } = useContext(AuthContext);
    let currentUser = user;
    
    const fetchUsers = async (currentPage = 1) => {
        try {
            const response = await fetch(`${baseURL}/api/users?page=${currentPage}&page_size=${usersPerPage}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.access}`
                }
            });
            const data = await response.json();
            setUsers(data.results);
            setPageCount(Math.ceil(data.total / usersPerPage)); // Update page count
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);
    
    const handleAdminStatusChange = async (userId, isAdmin) => {
        try {
            const url = isAdmin ? `${baseURL}/api/remove_admin/${userId}/` : `${baseURL}/api/give_admin/${userId}/`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens?.access}`
                }
            });
            if (response.ok) {
                fetchUsers(currentPage); // Refresh the users list
            } else {
                console.error('Error updating admin status:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating admin status:', error);
        }
    };
    
    const handlePageClick = (data) => {
        let selectedPage = data.selected + 1;
        fetchUsers(selectedPage);
    };
    
    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>

            <div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Admin</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.is_staff ? 'Yes' : 'No'}</td>
                                <td>
                                    {currentUser.user_id !== user.id && (
                                        <button
                                            onClick={() => handleAdminStatusChange(user.id, user.is_staff)}
                                        >
                                            {user.is_staff ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <ReactPaginate
                    previousLabel={'<'}
                    nextLabel={'>'}
                    breakLabel={'...'}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={'pagination'}
                    subContainerClassName={'pages pagination'}
                    activeClassName={'active'}
                />
            </div>
        </div>
    );
};

export default AdminPanel;