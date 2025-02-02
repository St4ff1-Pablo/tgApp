import React, { useEffect, useState } from "react";
import axios from "axios";
import MissionCard from "./MissionCard";
import { useUserContext } from "./UserContext";

interface Mission {
    id: number;
    name: string;
    reward_coins: number;
    reward_gems: number;
    completed: boolean;
}

const Missions: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]);
    const { loading, refreshUserData, userId } = useUserContext();

    const fetchMissions = async () => {
        try {
            const response = await axios.get<Mission[]>(
                `https://68c5-158-195-196-54.ngrok-free.app/users/${userId}/missions`, 
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache",
                    },
                }
            );

            setMissions(response.data);
        } catch (error) {
            console.error("Error fetching missions:", error);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="missions-container">
            <h2>Available Missions</h2>
            <div className="missions-list">
                {missions.length > 0 ? (
                    missions.map((mission) => (
                        <MissionCard
                            key={mission.id}
                            id={mission.id}
                            name={mission.name}
                            reward_coins={mission.reward_coins} 
                            reward_gems={mission.reward_gems}  
                            completed={mission.completed} 
                        />
                    ))
                ) : (
                    <p>No missions available.</p>
                )}
            </div>
        </div>
    );
};

export default Missions;