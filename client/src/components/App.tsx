import React from 'react'
import Menu from "./Menu"
import Sidebar from "./Sidebar"
import './App.css'
import bebra from '../../public/characters/image0_0__1_-removebg-preview.png'

function App() {
  return (
    <div>
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
    
  




