import Menu from "./Menu"
import Sidebar from "./Sidebar"
import './App.css'
import React from "react"
import bebra from '../../public/characters/photo_2025-01-13_05-53-42.jpg'

function App() {
  const userData = {
    coins: 0,
    character: bebra
  };

  return (
    <div>
      <div className='app'>
        <Sidebar/>
        <div className='content'>
          <div className='top-bar'>
           <div className='coins'>
          🪙 {userData.coins}
            </div>
          </div>
          <Menu/>
        </div>
      </div>
    </div>
  )
}
  
export default App;      
    
  




