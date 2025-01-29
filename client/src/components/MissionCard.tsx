import React from "react";
import { useUserContext } from "./UserContext";

interface MissionProps {
    id: number;
    name: string;
    coins_reward: number;
    gems_reward: number;
}

const MissionCard: React.FC<MissionProps> = ({ id, name, coins_reward, gems_reward }) => {
    const { completeMission } = useUserContext(); // Use the completeMission function from context

    const handleComplete = () => {
        completeMission(id); // Call the API to complete the mission
    };

    return (
        <div className="mission-card">
            <h3>{name}</h3>
            <p>Coins Reward: {coins_reward}</p>
            <p>Gems Reward: {gems_reward}</p>
            <button onClick={handleComplete}>Complete Mission</button>
        </div>
    );
};

export default MissionCard;