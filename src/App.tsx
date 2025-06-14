import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import ProfilePage from './pages/ProfilePage';
// import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;