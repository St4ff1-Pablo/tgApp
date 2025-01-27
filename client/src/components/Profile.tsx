import React from "react";
import './styles/Profile.css';
import "./styles/App.css";
import ReferralsList from "./ReferralsList";
import { UserProvider } from "./UserContext"; // Импорт провайдера контекста

const Profile: React.FC = () => {
    return (
        <UserProvider>
            <div className="content">
                <h1>Профиль</h1>
                <p>Добро пожаловать в ваш профиль!</p>
                {/* Подключаем компонент ReferralsList */}
                <ReferralsList />
            </div>
        </UserProvider>
    );
};

export default Profile;
