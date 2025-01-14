
import Menu from "./Menu"
import Sidebar from "./Sidebar"
import './App.css'
import bebra from '../../public/characters/image0_0__1_-removebg-preview.png'

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
    
  




