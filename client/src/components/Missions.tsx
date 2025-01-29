import React, { useEffect, useState } from "react";
import axios from "axios";
import MissionCard from "./MissionCard"; // Importing the MissionCard component
import { useUserContext } from "./UserContext";

interface Mission {
    id: number;
    name: string;
    coins_reward: number;
    gems_reward: number;
}

const Missions: React.FC = () => {
    const [missions, setMissions] = useState<Mission[]>([]); // State for storing missions
    const { loading, refreshUserData } = useUserContext(); // Extracting loading and refreshUserData from context
    const { userId } = useUserContext();
    // Fetching missions list from the API
    const fetchMissions = async () => {
        try {
            const response = await axios.get<Mission[]>(
                `https://56e4-158-195-196-54.ngrok-free.app/users/${userId}/missions`, 
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
        fetchMissions(); // Fetch missions when the component is mounted
    }, []);

    // If data is still loading, show a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="missions-list">
            <h2>Available Missions</h2>
            <div className="missions-cards">
                {missions.length > 0 ? (
                    missions.map((mission) => (
                        <MissionCard
                            key={mission.id}
                            id={mission.id}
                            name={mission.name}
                            coins_reward={mission.coins_reward}
                            gems_reward={mission.gems_reward}
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