import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Home';
import StreamingPage from './pages/StreamPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/stream" element={<StreamingPage />} />
        <Route path="/stream/:playbackId" element={<StreamingPage />} />
      </Routes>
    </Router>
  );
}

export default App;