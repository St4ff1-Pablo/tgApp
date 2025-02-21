import React from 'react';
import { useUserContext } from './UserContext';
import './styles/Sidebar.css';
import axios from 'axios';

const Upgrade = () => {
    const { userId, coins, level, refreshUserData } = useUserContext();

    const upgradeSkill = async () => {
        if (!userId || !coins || coins < 100) {
            alert('Not enough coins!');
            return;
        }

        try {
            await axios.patch(
                `https://634b-185-94-55-134.ngrok-free.app/users/${userId}`,
                {
                    coins: coins - 100,
                    level: (level || 0) + 1
                },
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true"
                    }
                }
            );
            
            // Refresh data after successful update
            refreshUserData?.();
        } catch (error) {
            console.error('Upgrade error:', error);
            alert('Upgrade failed!');
        }
    };

    return (
        <div className="sidebar">
            <ul className="skills-list">
                <div className="upgrade">
                    <h1>Upgrade</h1>
                    <p>Coins: 🪙 {coins || 0}</p>
                    <p>Level: {level || 0}</p>
                </div>
                <li>
                    <span>Level: {level || 0}</span>
                    <button 
                        onClick={upgradeSkill}
                        disabled={!coins || coins < 100}
                    >
                        Upgrade (-100 🪙)
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Upgrade;
// import React, { useState } from 'react';
// import './styles/Sidebar.css';

// const Upgrade = () => {
//     const [coins, setCoins] = useState(1500);
//     const [skills, setSkills] = useState({
//         LEVEL: 0,
//     });

//     interface Skills {
//         LEVEL: number;
//     }

//     const upgradeSkill = (skill: keyof Skills) => {
//         if (coins >= 100) {
//             setSkills({
//                 ...skills,
//                 [skill]: skills[skill] + 1,
//             });
//             setCoins(coins - 100);
//         } else {
//             alert('Не хватает монет!');
//         }
//     };

//     return (
//         <div className="sidebar">
            
//             <ul className="skills-list">
//             <div className="upgrade">
//                 <h1>Upgrade</h1>
//                 <p>Coins: 🪙 {coins}</p>
//             </div>
//                 {Object.keys(skills).map((skill) => (
//                     <li key={skill}>
//                         <span>
//                             {skill.charAt(0).toUpperCase() + skill.slice(1)}: {skills[skill as keyof Skills]}
//                         </span>
//                         <button onClick={() => upgradeSkill(skill as keyof Skills)}>Upgrade (-100 🪙)</button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// };

// export default Upgrade;

