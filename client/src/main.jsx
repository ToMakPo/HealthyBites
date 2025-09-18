import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminPanel from './pages/admin/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPanel />} />

          {/* If the path is not defined, then direct them to the home page. */}
          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router> 
  </StrictMode>
);
