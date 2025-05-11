import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DepotsPage from './components/Depots';
import DivisionPage from './components/Division';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/raktar" element={<DepotsPage />} />
        <Route path="/raktar/:id" element={<DepotsPage />} />
        <Route path="/reszleg" element={<DivisionPage />} />
        <Route path="/reszleg/:id" element={<DivisionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
