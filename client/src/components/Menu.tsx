import React from 'react'
import Sidebar from "./Sidebar"
import './styles/App.css'

function Menu() {
  return (
    <div className='body' style={{overflowY: "hidden"}}>
      <div className='char'></div>
      <div className='app'>
        <Sidebar/>
        
      </div>
    </div>
  )
}
  
export default Menu;  
