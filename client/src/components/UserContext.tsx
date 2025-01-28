import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface UserData {
    coins: number;
    level: number; // Added level to interface
}

interface UserContextType {
    userId: number | null;
    coins: number ;
    level: number | null;
    refreshUserData: () => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [coins, setCoins] = useState<number | null>(null);
    const [level, setLevel] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (id: number) => {
        try {
            const response = await axios.get<UserData>(
                `https://56e4-158-195-196-54.ngrok-free.app/users/${id}`,
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache" // Add cache prevention
                    }
                }
            );
            // Verify response structure
            console.log("API Response:", response.data);
            setCoins(response.data.coins);
            setLevel(response.data.level);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshUserData = () => {
        if (userId) {
            setLoading(true);
            fetchUserData(userId);
        }
    };

    useEffect(() => {
        const initTelegramWebApp = () => {
            const tg = (window as any).Telegram.WebApp;
            if (tg?.initData) {
                try {
                    const initData = new URLSearchParams(tg.initData);
                    const userData = initData.get("user");
                    if (userData) {
                        const parsedUser = JSON.parse(userData);
                        console.log("Telegram User Data:", parsedUser); // Verify user parsing
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
    }, []);

    return (
        <UserContext.Provider value={{ 
            userId, 
            coins: coins ?? 0, // Fallback to 0 if null
            level: level ?? 1, // Fallback to 1 if null
            refreshUserData,
            loading 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};