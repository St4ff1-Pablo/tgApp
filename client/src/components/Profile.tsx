import React from "react";
import './styles/Profile.css';
import "./styles/App.css";
import './styles/Menu.css';
import ReferralsList from "./ReferralsList";
import { UserProvider } from "./UserContext"; // Импорт провайдера контекста

const Profile: React.FC = () => {
    return (
        <UserProvider>
            <div className="boby">
                <div className="appi">
                    <div className="content">
                        <h1 className="center1">Profile</h1>
                        <p className="center2">Roma lox</p>
                         {/* Подключаем компонент ReferralsList */}
                        <ReferralsList />
                        <div className="back">privodite refov eblany</div>
                    </div>
                </div>
            </div>
        </UserProvider>
    );
};

export default Profile;
