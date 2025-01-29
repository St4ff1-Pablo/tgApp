import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the structure of user data from the API
interface UserData {
    coins: number;
    gems: number; // Added gems
    level: number;
}

// Define the structure of the context data
interface UserContextType {
    userId: number | null;
    coins: number;
    gems: number; // Added gems to context
    level: number | null;
    refreshUserData: () => void;
    completeMission: (missionId: number) => Promise<void>;
    loading: boolean;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the context provider
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [coins, setCoins] = useState<number | null>(null);
    const [gems, setGems] = useState<number | null>(null);
    const [level, setLevel] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data from the backend
    const fetchUserData = async (id: number) => {
        try {
            const response = await axios.get<UserData>(
                `https://56e4-158-195-196-54.ngrok-free.app/users/${id}`,
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache",
                    },
                }
            );

            // Log response for debugging
            console.log("API Response:", response.data);

            // Update state with user data
            setCoins(response.data.coins);
            setGems(response.data.gems); // Update gems
            setLevel(response.data.level);
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
        if (!userId) return;

        setLoading(true);

        try {
            // Define response type for better type safety
            interface MissionCompleteResponse {
                message: string;
                coins_earned: number;
                gems_earned: number;
            }

            // Send POST request to complete the mission
            const response = await axios.post<MissionCompleteResponse>(
                `https://56e4-158-195-196-54.ngrok-free.app/users/${userId}/missions/${missionId}/complete`,
                {},
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache",
                    },
                }
            );

            console.log("Mission completed:", response.data);

            // Update user's coins and gems based on the response
            setCoins((prevCoins) => (prevCoins ?? 0) + response.data.coins_earned);
            setGems((prevGems) => (prevGems ?? 0) + response.data.gems_earned);
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
                coins: coins ?? 0, // Fallback to 0 if null
                gems: gems ?? 0, // Fallback to 0 if null
                level: level ?? 1, // Fallback to 1 if null
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