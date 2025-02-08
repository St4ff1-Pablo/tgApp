// MissionCard.tsx
import React, { useState } from "react";
import { useUserContext } from "./UserContext";
import "./styles/Mission.css";

interface MissionProps {
    id: number;
    name: string;
    reward_coins: number;
    reward_gems: number;
    completed: boolean;
    type: string;
    target_value: string;
    description?: string;
}

const MissionCard: React.FC<MissionProps> = ({
    id,
    name,
    reward_coins,
    reward_gems,
    completed,
    type,
    target_value,
    description,
}) => {
    const { completeMission } = useUserContext();
    // Флаг, чтобы отследить, что пользователь уже нажал "Go to Channel"
    const [visited, setVisited] = useState(false);

    const handleClick = () => {
        if (type === "subscribe") {
            // Если пользователь еще не перешел на канал, открываем канал и помечаем, что он посетил
            if (!visited) {
                window.open(target_value, "_blank");
                setVisited(true);
            } else {
                // Если уже посетил, то проверяем выполнение миссии на сервере
                completeMission(id);
            }
        } else {
            if (!completed) {
                completeMission(id);
            }
        }
    };

    // Определяем надпись на кнопке в зависимости от типа миссии и флага visited
    const getButtonLabel = () => {
        if (completed) return "Completed";
        if (type === "subscribe") {
            return visited ? "Check" : "Go to Channel";
        }
        return "Complete Mission";
    };

    return (
        <div className={`mission-card ${completed ? "completed" : ""}`}>
            <h3>{name}</h3>
            {description && <p>{description}</p>}
            <p>Coins Reward: {reward_coins}</p>
            <p>Gems Reward: {reward_gems}</p>
            <button onClick={handleClick} disabled={completed}>
                {getButtonLabel()}
            </button>
        </div>
    );
};

export default MissionCard;

