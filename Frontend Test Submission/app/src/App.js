import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UrlShortenerPage from './pages/UrlShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import TokenInput from './components/TokenInput';

// Main App component with routing and navigation
function App() {
  return (
    <Router>
      {/* Token input for Bearer token authentication */}
      <TokenInput />
      {/* Simple navigation bar */}
      <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Shorten URLs</Link>
        <Link to="/stats">Statistics</Link>
      </nav>
      <Routes>
        <Route path="/" element={<UrlShortenerPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
