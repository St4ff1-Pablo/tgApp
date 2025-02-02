import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the structure of user data from the API
interface UserData {
    coins: number;
    gems: number;
    level: number;
    completed_missions: number[]; // Store completed mission IDs
}

// Define the structure of the context data
interface UserContextType {
    userId: number | null;
    coins: number;
    gems: number;
    level: number | null;
    completedMissions: number[]; // Store completed missions
    refreshUserData: () => void;
    completeMission: (missionId: number) => Promise<void>;
    loading: boolean;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the context provider
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [coins, setCoins] = useState<number>(0);
    const [gems, setGems] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch user data from the backend
    const fetchUserData = async (id: number) => {
        try {
            const response = await axios.get<UserData>(
                `https://68c5-158-195-196-54.ngrok-free.app/users/${id}`,
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache",
                    },
                }
            );

            console.log("API Response:", response.data);

            // Update state with user data
            setCoins(response.data.coins);
            setGems(response.data.gems);
            setLevel(response.data.level);
            setCompletedMissions(response.data.completed_missions || []); // Save completed missions
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh user data (useful after completing missions)
    const refreshUserData = () => {
        if (userId) {
            setLoading(true);
            fetchUserData(userId);
        }
    };

    // Complete a mission and update user rewards
    const completeMission = async (missionId: number) => {
        if (!userId || completedMissions.includes(missionId)) return;

        setLoading(true);

        try {
            interface MissionCompleteResponse {
                message: string;
                reward_coins: number;
                reward_gems: number;
            }

            const response = await axios.post<MissionCompleteResponse>(
                `https://68c5-158-195-196-54.ngrok-free.app/users/${userId}/missions/${missionId}/complete`,
                {},
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache",
                    },
                }
            );

            console.log("Mission completed:", response.data);

            // Update user's coins and gems
            setCoins((prevCoins) => prevCoins + response.data.reward_coins);
            setGems((prevGems) => prevGems + response.data.reward_gems);

            // Mark the mission as completed
            setCompletedMissions((prev) => [...prev, missionId]);
        } catch (error) {
            console.error("Error completing mission:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize Telegram WebApp and fetch user data on first load
    useEffect(() => {
        const initTelegramWebApp = () => {
            const tg = (window as any).Telegram.WebApp;
            if (tg?.initData) {
                try {
                    const initData = new URLSearchParams(tg.initData);
                    const userData = initData.get("user");
                    if (userData) {
                        const parsedUser = JSON.parse(userData);
                        console.log("Telegram User Data:", parsedUser);
                        if (parsedUser?.id) {
                            setUserId(parsedUser.id);
                            fetchUserData(parsedUser.id);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing Telegram data:", e);
                }
            }
        };

        initTelegramWebApp();
    }, [userId]);

    // Provide the context values to child components
    return (
        <UserContext.Provider
            value={{
                userId,
                coins,
                gems,
                level,
                completedMissions,
                refreshUserData,
                completeMission,
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to access the UserContext
export const useUserContext = (): UserContextType => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }

    return context;
};
