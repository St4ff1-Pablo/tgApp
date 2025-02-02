import React from "react";
import { useUserContext } from "./UserContext";
import "./styles/Mission.css"

interface MissionProps {
    id: number;
    name: string;
    reward_coins: number;
    reward_gems: number;
    completed: boolean;
}

const MissionCard: React.FC<MissionProps> = ({ id, name, reward_coins, reward_gems, completed }) => {
    const { completeMission } = useUserContext();

    const handleComplete = () => {
        if (!completed) {
            completeMission(id);
        }
    };

    return (
        <div className={`mission-card ${completed ? "completed" : ""}`}>
            <h3>{name}</h3>
            <p>Coins Reward: {reward_coins}</p>
            <p>Gems Reward: {reward_gems}</p>
            <button onClick={handleComplete} disabled={completed}>
                {completed ? "Completed" : "Complete Mission"}
            </button>
        </div>
    );
};

export default MissionCard;