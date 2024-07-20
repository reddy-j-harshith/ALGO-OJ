import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import ProblemPage from './pages/ProblemPage'
import Header from './components/Header'

function App() {
  return (
    <div className ="App">
      <Router>
        <AuthProvider>
          <Header/>
          <Routes>
            <Route path="/" element={
              <PrivateRoute>
                <Homepage />
              </PrivateRoute>
            } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/get_problem/:id" element={<ProblemPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
