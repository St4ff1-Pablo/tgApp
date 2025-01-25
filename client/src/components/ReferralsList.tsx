import React, { useEffect, useState } from "react";
import axios from "axios";

interface ReferralsListProps {
    userId: number;
}

const ReferralsList: React.FC<ReferralsListProps> = ({ userId }) => {
    interface Referral {
        id: number;
        referral_id: string;
    }
    
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://158.195.196.54:8000/users/${userId}/referrals`)
            .then(response => {
                setReferrals(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.response?.data?.detail || "Error fetching referrals");
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>My Referrals</h2>
            {referrals.length === 0 ? (
                <p>No referrals found.</p>
            ) : (
                <ul>
                    {referrals.map((ref) => (
                        <li key={ref.id}>
                            Referral ID: <strong>{ref.referral_id}</strong>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ReferralsList;