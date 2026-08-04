import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Other routes will be added here by the second and third team members */}
        <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen bg-gray-50 text-2xl font-bold">
                Home page (under development by second teammate)
            </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;