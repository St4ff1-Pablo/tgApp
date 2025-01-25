import React from "react";
import './Profile.css';
import "./App.css";
import ReferralsList from "./ReferralsList";

const Profile: React.FC = () => {
    return (
        <div className="content">
            <h1>Профиль</h1>
            <p>Добро пожаловать в ваш профиль!</p>
            {/* Подключаем компонент ReferralsList */}
            <ReferralsList />
        </div>
    );
};

export default Profile;
