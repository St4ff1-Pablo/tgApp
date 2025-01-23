import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Menu from "./Menu";
import Profile from "./Profile";
import Sidebar from "./Sidebar";
import './Menu.css';

const Chlen = () => <div><Menu/></div>;
const Pisya = () => <div><Profile/></div>;
const Arena = () => <div></div>;
const Missions = () => <div></div>;
const Shop = () => <div></div>;
const Sideb = () => <div><Sidebar/></div>

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <div className="nav-bar">
      <button onClick={() => navigate("/")} className="nav-button">Menu</button>
      <button onClick={() => navigate("/profile")} className="nav-button">Profile</button>
      <button onClick={() => navigate("/arena")} className="nav-button">Arena</button>
      <button onClick={() => navigate("/missions")} className="nav-button">Missions</button>
      <button onClick={() => navigate("/shop")} className="nav-button">Shop</button>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <div className="content">
          <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/shop" element={<Shop />} />
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;


// import React from 'react'
// import Menu
// import Sidebar from "./Sidebar"
// import './App.css'

// function App() {
//   return (
//     <div>
//       <div className='char'></div>
//       <div className='app'>
//         <Sidebar/>
//         <div className='content'>
//           <div className='top-bar'>
//           </div>
//           <Menu/>
//         </div>
//       </div>
//     </div>
//   )
// }
  
// export default App;      
    
  




