import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUserContext } from "./UserContext"; // Импортируем контекст
import './styles/Profile.css';
import './styles/Menu.css';

const ReferralsList: React.FC = () => {
    interface Referral {
        id: number;
        referral_id: number;
    }

    const { userId } = useUserContext(); // Получаем userId из контекста
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
    
        axios
            .get(`https://68c5-158-195-196-54.ngrok-free.app/users/${userId}/referrals`,{headers:{
                "ngrok-skip-browser-warning":true,
            }})
            .then((response) => {
                console.log("API Response:", response.data); // Логируем ответ от сервера
                if (Array.isArray(response.data)) {
                    setReferrals(response.data); // Устанавливаем полученные данные в состояние
                } else {
                    console.error("Unexpected API response:", response.data);
                    setError("Invalid data format from API.");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("API Error:", error);
                setError(error.response?.data?.detail || "Error fetching referrals");
                setLoading(false);
            });
    }, [userId]);

    if (!userId) return <p>Initializing...</p>;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="appi">
            <div className="rf1">
                <h2 className="content1">My Referrals</h2>
                {Array.isArray(referrals) && referrals.length === 0 ? (
                <p className="noref">No referrals found.</p>
                ) : Array.isArray(referrals) ? (
                <ul>
                    {referrals.map((ref) => (
                        <div  key={ref.id} className="ref">
                            Referral ID: <strong>{ref.referral_id}</strong>
                        </div>
                    ))}
                </ul>
                ) : (
                <p className="noref">Unexpected data format received.</p>
            )}</div>
        </div>
    );
};

export default ReferralsList;