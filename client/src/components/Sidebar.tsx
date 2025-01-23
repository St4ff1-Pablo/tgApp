
import React, { useState } from 'react';
import './Sidebar.css';
import myImage from '../../public/characters/mini_coin_1.png';

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
                <p>Coins: <img src={myImage} alt="dft" height="19vw" width="19vw"/> {coins}</p>
            </div>
                {Object.keys(skills).map((skill) => (
                    <li key={skill}>
                        <span>
                            {skill.charAt(0).toUpperCase() + skill.slice(1)}: {skills[skill as keyof Skills]}
                        </span>
                        <button onClick={() => upgradeSkill(skill as keyof Skills)}>Upgrade (-100 <img src={myImage} alt="dft" height="12vw" width="14vw"/>)</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Upgrade;

