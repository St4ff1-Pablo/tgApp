
import './Menu.css';
function Menu () {
    return(
        <nav className="menu">
            <div className="menu-container">
                <ul className="menu-menu">
                    <li className="menu-item">
                        <a href="/" className="menu-link">Menu</a>
                    </li>
                    <li className="menu-item"><a href="/profile" className="menu-link">Profile</a></li>
                    <li className="menu-item"><a href="/upgrade" className="menu-link">Upgrade</a></li>
                    <li className="menu-item"><a href="/arena" className="menu-link">Arena</a></li>
                    <li className="menu-item"><a href="/shop" className="menu-link">Shop</a></li>
                </ul>
            </div>
        </nav>
    );
}; 
export default Menu;

/*function Menu() {
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