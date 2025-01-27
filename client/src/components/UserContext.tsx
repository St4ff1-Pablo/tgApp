import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
    userId: number | null;
    setUserId: React.Dispatch<React.SetStateAction<number | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        const initTelegramWebApp = () => {
            const tg = (window as any).Telegram.WebApp;

            if (tg && tg.initData) {
                const initData = new URLSearchParams(tg.initData);
                const id = initData.get("user") ? JSON.parse(initData.get("user")!).id : null;
                setUserId(id);
                tg.ready();
            }
        };

        initTelegramWebApp();
    }, []);

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
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
