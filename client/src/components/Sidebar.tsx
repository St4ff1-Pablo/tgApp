
import React, { useState } from 'react';
import './Sidebar.css';

const Upgrade = () => {
    const [coins, setCoins] = useState(1500);
    const [skills, setSkills] = useState({
        DMG: 0,
        HP: 0,
        DEF: 0,
    });

    interface Skills {
        DMG: number;
        HP: number;
        DEF: number;
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
            <div className="upgrade">
                <h1>Upgrade Stats</h1>
                <p>Coins: 🪙 {coins}</p>
            </div>
            <ul className="skills-list">
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

