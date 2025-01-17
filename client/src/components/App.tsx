import React from 'react'
import Menu from "./Menu"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar"
import './App.css'

function App() {
  return (
    <div>
      <Router>
      <div className="app">
        <Sidebar />
        <div className="char"></div>
        <div className="content">
          <div className="top-bar"></div>
          <Routes>
            {/* Определяем маршруты */}
            <Route path="/" element={<Menu />} />
            <Route path="/profile" element={<div>Это профиль</div>} />
            <Route path="/arena" element={<div>Это арена</div>} />
            <Route path="/missions" element={<div>Это миссии</div>} />
            <Route path="/shop" element={<div>Это магазин</div>} />
          </Routes>
        </div>
      </div>
    </Router>
      <div className='app'>
      <Sidebar/>
      <div className='char'></div>
        <div className='content'>
          <div className='top-bar'>
          </div>
          <Menu/>
        </div>
      </div>
    </div>
  )
}
  
export default App;      
    
  




