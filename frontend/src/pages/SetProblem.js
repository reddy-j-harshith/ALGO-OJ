import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import './SetProblem.css';
import Config from '../Config';

const ProblemPage = () => {
    let { authTokens } = useContext(AuthContext);
    let baseURL = Config.baseURL;

    const [problem, setProblem] = useState({
        code: '',
        title: '',
        description: '',
        difficulty: '',
        time_limit: '',
        memory_limit: '',
    });
    const [testCases, setTestCases] = useState([{ input: '', output: '' }]);
    const [deleteCode, setDeleteCode] = useState('');

    const handleChange = (e) => {
        setProblem({ ...problem, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, e) => {
        const newTestCases = [...testCases];
        newTestCases[index][e.target.name] = e.target.value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        for (const key in problem) {
            formData.append(key, problem[key]);
        }

        testCases.forEach((testCase, index) => {
            const inputFile = new File([testCase.input], `input${index}.txt`, {
                type: 'text/plain',
            });
            const outputFile = new File([testCase.output], `output${index}.txt`, {
                type: 'text/plain',
            });

            formData.append('input_files', inputFile);
            formData.append('output_files', outputFile);
        });

        const response = await fetch(`${baseURL}/api/create_problem/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authTokens.access}`,
            },
            body: formData,
        });

        if (response.status === 201) {
            alert('Problem created successfully');
            setProblem({
                code: '',
                title: '',
                description: '',
                difficulty: '',
                time_limit: '',
                memory_limit: '',
            });
            setTestCases([{ input: '', output: '' }]);
        } else {
            alert('Error creating problem');
        }
    };

    const handleDeleteChange = (e) => {
        setDeleteCode(e.target.value);
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        const response = await fetch(`${baseURL}/api/delete_problem/${deleteCode}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authTokens.access}`,
            },
        });

        if (response.status === 204) {
            alert('Problem deleted successfully');
            setDeleteCode('');
        } else {
            alert('Error deleting problem');
        }
    };

    return (
        <div>
            <div className="problem-form-container">
                <h2>Create / Update Problem</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="code" placeholder="Problem Code" value={problem.code} onChange={handleChange} required />
                    <input type="text" name="title" placeholder="Title" value={problem.title} onChange={handleChange} required />
                    <textarea name="description" placeholder="Description" value={problem.description} onChange={handleChange} required></textarea>
                    <input type="text" name="difficulty" placeholder="Difficulty" value={problem.difficulty} onChange={handleChange} required />
                    <input type="number" name="time_limit" placeholder="Time Limit (s)" value={problem.time_limit} onChange={handleChange} required />
                    <input type="number" name="memory_limit" placeholder="Memory Limit (MB)" value={problem.memory_limit} onChange={handleChange} required />

                    <h3>Test Cases</h3>
                    {testCases.map((testCase, index) => (
                        <div className="test-case-container" key={index}>
                            <textarea
                                name="input"
                                placeholder="Input"
                                value={testCase.input}
                                onChange={(e) => handleTestCaseChange(index, e)}
                                required
                            />
                            <textarea
                                name="output"
                                placeholder="Output"
                                value={testCase.output}
                                onChange={(e) => handleTestCaseChange(index, e)}
                                required
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addTestCase} className="button">
                        Add Test Case
                    </button>

                    <input type="submit" value="Submit" className="button" />
                </form>
            </div>

            <div className="delete-problem-container">
                <h2>Delete Problem</h2>
                <form onSubmit={handleDelete}>
                    <input type="text" placeholder="Problem Code" value={deleteCode} onChange={handleDeleteChange} required />
                    <input type="submit" value="Delete" className="button" />
                </form>
            </div>
        </div>
    );
};

export default ProblemPage;
