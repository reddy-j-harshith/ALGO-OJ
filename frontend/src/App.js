import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProblemPage from './pages/ProblemPage';
import RegistrationPage from './pages/RegistrationPage';
import Navbar from './components/Navbar';
import LoginRoute from './utils/LoginRoute';
import NotFound from './pages/NotFound';
import SetProblem from './pages/SetProblem';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/problem" element={
              <PrivateRoute>
                <SetProblem />
            </PrivateRoute>} />
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            <Route path="/get_problem/:code" element={
              <PrivateRoute>
                <ProblemPage />
              </PrivateRoute>
            } />

            <Route path="/login" element={
              <LoginRoute>
                <LoginPage />
              </LoginRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;