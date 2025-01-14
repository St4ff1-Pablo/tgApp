// src/pages/Upgrade.jsx
import React, { useState } from 'react';
import './Sidebar.css';

const Upgrade = () => {
    const [coins, setCoins] = useState(1500);
    const [skills, setSkills] = useState({
        DMG: 0,
        HP: 0,
        DEF: 0,
    });

    const upgradeSkill = (skill) => {
        if (coins >= 100) {
            setSkills({
                ...skills,
                [skill]: skills[skill] + 1,
            });
            setCoins(coins - 100)
        } else {
            alert('Не хватает монет!');
        }
    };

    return (
        <div>
        <ul className="skills-list">
        <div className="upgrade">
        <h1>Upgrade stats</h1>
        <p>Coins: 🪙 {coins}</p>
        </div>
        {Object.keys(skills).map((skill) => (
            <li key={skill}>
                <span>{skill.charAt(0).toUpperCase() + skill.slice(1)}: {skills[skill]}</span>
                <button onClick={() => upgradeSkill(skill)}>Upgrade (-100 🪙)</button>
            </li>
        ))}
            </ul>
            
    </div>
        
    );
    
};

export default Upgrade;
