// userContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Определяем структуру данных пользователя, получаемых с API
interface UserData {
    coins: number;
    gems: number;
    level: number;
    completed_missions: number[]; // ID завершённых миссий
    battle_attempts: number;      // Доступное число боёв (например, от 0 до 5)
    nextBattleRegen: number;      // Время (в мс) до восстановления следующей попытки
}

// Определяем структуру контекста пользователя
interface UserContextType {
    userId: number | null;
    coins: number;
    gems: number;
    level: number | null;
    completedMissions: number[];
    battle_attempts: number;
    nextBattleRegen: number;
    refreshUserData: () => void;
    completeMission: (missionId: number) => Promise<void>;
    loading: boolean;
}

// Создаём контекст
const UserContext = createContext<UserContextType | undefined>(undefined);

// Провайдер контекста
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [coins, setCoins] = useState<number>(0);
    const [gems, setGems] = useState<number>(0);
    const [level, setLevel] = useState<number | null>(null);
    const [completedMissions, setCompletedMissions] = useState<number[]>([]);
    const [battle_attempts, setBattleAttempts] = useState<number>(5); // Значение по умолчанию
    const [nextBattleRegen, setNextBattleRegen] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // Функция для получения данных пользователя с бекенда
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

            // Обновляем состояния на основе полученных данных
            setCoins(response.data.coins);
            setGems(response.data.gems);
            setLevel(response.data.level);
            setCompletedMissions(response.data.completed_missions || []);
            setBattleAttempts(response.data.battle_attempts);
            setNextBattleRegen(response.data.nextBattleRegen);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Функция обновления данных пользователя (например, после боя)
    const refreshUserData = () => {
        if (userId) {
            setLoading(true);
            fetchUserData(userId);
        }
    };

    // Функция для выполнения миссии (пример реализации)
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
                `https://634b-185-94-55-134.ngrok-free.app/users/${userId}/missions/${missionId}/complete`,
                {},
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Cache-Control": "no-cache",
                    },
                }
            );

            console.log("Mission completed:", response.data);

            // Обновляем баланс и список завершённых миссий
            setCoins((prev) => prev + response.data.reward_coins);
            setGems((prev) => prev + response.data.reward_gems);
            setCompletedMissions((prev) => [...prev, missionId]);
        } catch (error) {
            console.error("Error completing mission:", error);
        } finally {
            setLoading(false);
        }
    };

    // Инициализация данных через Telegram WebApp
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
    }, []);

    return (
        <UserContext.Provider
            value={{
                userId,
                coins,
                gems,
                level,
                completedMissions,
                battle_attempts,
                nextBattleRegen,
                refreshUserData,
                completeMission,
                loading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Пользовательский хук для доступа к контексту
export const useUserContext = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
};

