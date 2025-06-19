import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Home';
import StreamingPage from './pages/StreamPage';
// import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/stream" element={<StreamingPage />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;