import React, { useState } from 'react';
import { useUserContext } from './UserContext';
import axios from 'axios';

const Missions = () => {
  const { userId, coins, refreshUserData } = useUserContext();

  // Состояние миссий
  const [missions, setMissions] = useState([
    { id: 1, text: "Subscribe to the Telegram channel", completed: false, reward: { coins: 500 } },
    { id: 2, text: "Reach level 5", completed: false, reward: { gems: 1 } },
    { id: 3, text: "Complete Arena 1", completed: false, reward: { coins: 100 } },
    { id: 4, text: "Subscribe to Instagram", completed: false, reward: { coins: 500 } }
  ]);

  // Обработка завершения миссии
  const handleCompleteMission = async (missionId: number) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return; // Проверяем, существует ли миссия и не завершена ли она

    try {
      // Обновляем данные пользователя на сервере
      const { coins: rewardCoins, gems: rewardGems } = mission.reward;
      await axios.patch(
        `https://56e4-158-195-196-54.ngrok-free.app/users/${userId}`,
        {
          coins: coins + (rewardCoins || 0),
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        }
      );

      // Обновляем статус миссии
      setMissions(prevMissions =>
        prevMissions.map(m =>
          m.id === missionId ? { ...m, completed: true } : m
        )
      );

      // Обновляем данные пользователя в контексте
      refreshUserData?.();

      // Уведомление о награде
      if (rewardCoins) alert(`Mission completed! You received ${rewardCoins} coins.`);
      if (rewardGems) alert(`Mission completed! You received ${rewardGems} gem(s).`);
    } catch (error) {
      console.error('Mission completion error:', error);
      alert('Failed to complete mission!');
    }
  };

  // Перенаправление на задание
  const handleRedirect = (url: string | URL | undefined, missionId: number) => {
    window.open(url, '_blank');
    // После перенаправления можно считать, что миссия выполнена
    handleCompleteMission(missionId);
  };

  return (
    <div className='mission'>
      <h1>Missions</h1>
      <div>
        <h3>Your Rewards:</h3>
        <p>Coins: 🪙 {coins || 0}</p>
      </div>
      {missions.map(mission => (
        <div key={mission.id} style={{ marginBottom: '20px' }}>
          <span>{mission.text}</span>
          {!mission.completed ? (
            <button
              onClick={() => handleRedirect(getMissionUrl(mission.id), mission.id)}
              style={{ marginLeft: '10px', width: '10vw'}}
            >
              Go to Mission
            </button>
          ) : (
            <span style={{ marginLeft: '10px', color: 'green' }}>Completed</span>
          )}
        </div>
      ))}
    </div>
  );
};

// Функция для получения URL миссии
const getMissionUrl = (missionId: number) => {
  switch (missionId) {
    case 1:
      return 'https://t.me/dftproject';
    case 2:
      return 'https://www.instagram.com/skiere__/'; // Пример URL для повышения уровня
    case 3:
      return '/arena-1'; // Пример URL для арены
    case 4:
      return 'https://www.instagram.com/skiere__/';
    default:
      return '#';
  }
};

export default Missions;
