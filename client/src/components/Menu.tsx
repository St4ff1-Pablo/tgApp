import React from 'react'
import Sidebar from "./Sidebar"
import './styles/App.css'

function Menu() {
  return (
    <div>
      <div className='char'></div>
      <div className='app'>
        <Sidebar/>
        
      </div>
    </div>
  )
}
  
export default Menu;  
// import React, { useState } from "react";
// import "./Menu.css";
// import Profile from "./Profile";
// import Mission from "./Mission";
// import Shop from "./Shop";
// import Arena from "./Arena"


// const Menu = () => {
//   const [currentPage, setCurrentPage] = useState("menu");

//   const renderPage = () => {
//     switch (currentPage) {
//       case "menu":
//         return <Menu />;
//       case "Profile":
//         return <Profile />;
//       case "arena":
//         return <Arena />;
//       case "missions":
//         return <Mission />;
//       case "shop":
//         return <Shop />;
//       default:
//         return <Menu />;
//     }
//   };

//   return (
//     <div className="app">
//       <div className="content">{renderPage()}
//       <div className="bottom-navigation">
//         <button onClick={() => setCurrentPage("menu")} className="nav-button">
//           Menu
//         </button>
//         <button onClick={() => setCurrentPage("Profile")} className="nav-button">
//           Profile
//         </button>
//         <button onClick={() => setCurrentPage("arena")} className="nav-button">
//           Arena
//         </button>
//         <button onClick={() => setCurrentPage("missions")} className="nav-button">
//           Mission
//         </button>
//         <button onClick={() => setCurrentPage("shop")} className="nav-button">
//           Shop
//         </button>
//       </div>
//       </div>
      
//     </div>
//   );
// };

// export default Menu;

// import React, { useState } from "react";
// import "./Menu.css";
// import App from './App'

// const Menu = () => {
//   // Управление текущей страницей
//   const [currentPage, setCurrentPage] = useState("menu");

//   // Рендер контента текущей страницы
//   const renderPage = () => {
//     switch (currentPage) {
//       case "menu":
//         return <div className="page"></div>;
//       case "Profile":
//         return <div className="page"></div>;
//       case "arena":
//         return <div className="page"></div>;
//       case "missions":
//         return <div className="page"></div>;
//       case "shop":
//         return <div className="page"></div>;
//       default:
//         return <div className="page"></div>;
//     }
//   };

//   return (
//     <div className="app">
//       <div className="content">{renderPage()}</div>
//       <div className="bottom-navigation">
//         <button onClick={() => setCurrentPage("menu")} className="nav-button">
//           Меню
//         </button>
//         <button onClick={() => setCurrentPage("Profile")} className="nav-button">
//           Профиль
//         </button>
//         <button onClick={() => setCurrentPage("arena")} className="nav-button">
//           Арена
//         </button>
//         <button onClick={() => setCurrentPage("missions")} className="nav-button">
//           Миссии
//         </button>
//         <button onClick={() => setCurrentPage("shop")} className="nav-button">
//           Магазин
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Menu;

/*import React from "react";
import "./Menu.css";

const Menu = () => {
  const buttons = [
    { id: 1, label: "Menu", design: "design1" },
    { id: 2, label: "Profile", design: "design2" },
    { id: 3, label: "Arena", design: "design3" },
    { id: 4, label: "Mission", design: "design4" },
    { id: 5, label: "Shop", design: "design5" },
  ];

  return (
    <div className="button-container">
      {buttons.map((button) => (
        <button key={button.id} className={`button ${button.design}`}>
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default Menu;

/*import './Menu.css';
function Menu () {
    return(
        <nav className="menu">
            <div className="menu-container">
                <ul className="menu-menu">
                    <li className="menu-item">
                        <a href="/" className="menu-link">Menu</a>
                    </li>
                    <li className="menu-item"><a href="/profile" className="menu-link">Profile</a></li>
                    <li className="menu-item"><a href="/upgrade" className="menu-link">Mission</a></li>
                    <li className="menu-item"><a href="/arena" className="menu-link">Arena</a></li>
                    <li className="menu-item"><a href="/shop" className="menu-link">Shop</a></li>
                </ul>
            </div>
        </nav>
    );
}; 
export default Menu;

function Menu() {
  return (
    <div>
        <h1>Menu</h1>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
        </ul>
    </div>
  )
}

export default Menu*/