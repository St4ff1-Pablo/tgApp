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
            <Route path="/" element={<Menu />} />
            <Route path="/profile" element={<div></div>} />
            <Route path="/arena" element={<div></div>} />
            <Route path="/missions" element={<div></div>} />
            <Route path="/shop" element={<div></div>} />
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
    
  




