import React from "react";
import { useUserContext } from "./UserContext";

interface MissionProps {
    id: number;
    name: string;
    reward_coins: number;
    reward_gems: number;
}

const MissionCard: React.FC<MissionProps> = ({ id, name, reward_coins, reward_gems }) => {
    const { completeMission } = useUserContext(); // Use the completeMission function from context

    const handleComplete = () => {
        completeMission(id); // Call the API to complete the mission
    };

    return (
        <div className="mission-card">
            <h3>{name}</h3>
            <p>Coins Reward: {reward_coins}</p>
            <p>Gems Reward: {reward_gems}</p>
            <button onClick={handleComplete}>Complete Mission</button>
        </div>
    );
};

export default MissionCard;