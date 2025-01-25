import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import './Profile.css'
import './Menu'
import "./App.css"
import ReferralsList from "./ReferralsList";





const Profile: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        // Извлекаем user_id из параметров URL
        const id = searchParams.get("user_id");
        if (id) {
            setUserId(parseInt(id, 10));
        }
    }, [searchParams]);

   

    return (
        <div className="content">
            <h1>Профиль</h1>
            <p>Добро пожаловать в ваш профиль!</p>
            <ReferralsList userId={710934564} />
        </div>
    );
};

export default Profile;
