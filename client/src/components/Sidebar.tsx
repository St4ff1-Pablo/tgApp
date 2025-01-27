
import React, { useState } from 'react';
import './styles/Sidebar.css';

const Upgrade = () => {
    const [coins, setCoins] = useState(1500);
    const [skills, setSkills] = useState({
        LEVEL: 0,
    });

    interface Skills {
        LEVEL: number;
    }

    const upgradeSkill = (skill: keyof Skills) => {
        if (coins >= 100) {
            setSkills({
                ...skills,
                [skill]: skills[skill] + 1,
            });
            setCoins(coins - 100);
        } else {
            alert('Не хватает монет!');
        }
    };

    return (
        <div className="sidebar">
            
            <ul className="skills-list">
            <div className="upgrade">
                <h1>Upgrade</h1>
                <p>Coins: 🪙 {coins}</p>
            </div>
                {Object.keys(skills).map((skill) => (
                    <li key={skill}>
                        <span>
                            {skill.charAt(0).toUpperCase() + skill.slice(1)}: {skills[skill as keyof Skills]}
                        </span>
                        <button onClick={() => upgradeSkill(skill as keyof Skills)}>Upgrade (-100 🪙)</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Upgrade;

