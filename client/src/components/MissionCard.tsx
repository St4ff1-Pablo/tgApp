// MissionCard.tsx
import React from "react";
import { useUserContext } from "./UserContext";
import "./styles/Mission.css";

interface MissionProps {
    id: number;
    name: string;
    reward_coins: number;
    reward_gems: number;
    completed: boolean;
    type: string;          // новый параметр: тип миссии ("subscribe", "level", "boss", "referral" и т.д.)
    target_value: string;  // новый параметр: для подписки – URL канала, для остальных миссий – целевое значение
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

    const handleClick = () => {
        if (type === "subscribe") {
            // Если миссия подписки – перенаправляем пользователя на канал
            window.open(target_value, "_blank");
        } else {
            // Для остальных типов миссий запускаем завершение миссии
            if (!completed) {
                completeMission(id);
            }
        }
    };

    return (
        <div className={`mission-card ${completed ? "completed" : ""}`}>
            <h3>{name}</h3>
            {description && <p>{description}</p>}
            <p>Coins Reward: {reward_coins}</p>
            <p>Gems Reward: {reward_gems}</p>
            <button onClick={handleClick} disabled={completed}>
                {completed 
                    ? "Completed" 
                    : type === "subscribe" 
                        ? "Go to Channel" 
                        : "Complete Mission"}
            </button>
        </div>
    );
};

export default MissionCard;
