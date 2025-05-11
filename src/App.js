import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import Room from "./pages/Room";
import React from 'react';


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/*" element={<Room />} />
          <Route path="/game/*" element={<Game />} />
        </Routes>
      </Router>
  );
}

export default App;
