import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuickQuote from './pages/QuickQuote';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Portal from './pages/Portal';
import Solicitors from './pages/Solicitors';
import Removals from './pages/Removals';
import DocumentUpload from './pages/DocumentUpload';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quote" element={<QuickQuote />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/solicitors" element={<Solicitors />} />
        <Route path="/removals" element={<Removals />} />
        <Route path="/documents" element={<DocumentUpload />} />
      </Routes>
    </Router>
  );
}

export default App;