import React from 'react'
import Menu from "./Menu"
import Sidebar from "./Sidebar"
import './App.css'

function App() {
  return (
    <div>
      <div className='char'></div>
      <div className='app'>
        <Sidebar/>
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
    
  




