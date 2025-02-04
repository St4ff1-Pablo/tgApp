// Arena.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUserContext } from './UserContext';
import './styles/App.css';

// Интерфейс для врагов
interface Enemy {
  id: number;
  level: number;
  hp: number;
  damage: number;
  goldReward: number;
  isBoss?: boolean;
}

// Функция расчёта характеристик персонажа по уровню
const calculatePlayerStats = (level: number) => {
  // Пример: уровень 1 – 10 HP и 3 урона, затем +3 HP и +2 урона за каждый последующий уровень
  const maxHp = 10 + (level - 1) * 3;
  const damage = 3 + (level - 1) * 2;
  return { maxHp, damage };
};

// Функция создания врагов для текущей волны
const spawnEnemies = (wave: number): Enemy[] => {
  if (wave <= 5) {
    const enemyLevel = wave; // Волна 1 — враги 1 уровня, волна 2 — враги 2 уровня и т.д.
    const count = wave;
    const enemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      enemies.push({
        id: i,
        level: enemyLevel,
        hp: enemyLevel * 6,       // Пример: враг 1 уровня – 6 HP, 2 уровня – 12 HP и т.д.
        damage: enemyLevel * 2,     // Пример: враг 1 уровня – 2 урона, 2 уровня – 4 урона и т.д.
        goldReward: enemyLevel * 10,// Золото за убийство врага
      });
    }
    return enemies;
  } else {
    // После 5-й волны появляется босс: один враг с усиленными характеристиками
    return [{
      id: 0,
      level: 1,
      hp: 60,       // Увеличенное здоровье
      damage: 15,   // Повышенный урон
      goldReward: 150, // Больше золота за убийство босса
      isBoss: true,
    }];
  }
};

const ARENA_INTERVAL = 1000; // Интервал раунда боя в мс

const Arena: React.FC = () => {
  // Предполагается, что UserContext теперь возвращает следующие поля:
  // - coins – текущий баланс монет
  // - battle_attempts – доступное число боёв (например, от 0 до 5)
  // - nextBattleRegen – время (в мс), оставшееся до восстановления следующей попытки
  // refreshUserData – функция для обновления данных пользователя (например, делается GET-запрос к /users/{user_id})
  const { userId, level, refreshUserData, coins, battle_attempts, nextBattleRegen } = useUserContext();

  // Состояния персонажа и боя
  const [playerHp, setPlayerHp] = useState<number>(0);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(0);
  const [playerDamage, setPlayerDamage] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [goldCollected, setGoldCollected] = useState<number>(0);
  const [battleRunning, setBattleRunning] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const intervalRef = useRef<number | null>(null);

  // Инициализация характеристик персонажа при загрузке и при изменении уровня
  useEffect(() => {
    const { maxHp, damage } = calculatePlayerStats(level || 1);
    setPlayerMaxHp(maxHp);
    setPlayerHp(maxHp);
    setPlayerDamage(damage);
  }, [level]);

  // Запуск боя (если у пользователя есть попытки)
  const startBattle = () => {
    if (battle_attempts <= 0) return; // Если попыток нет, запуск невозможен

    if (gameOver) {
      resetBattle();
    }
    setBattleRunning(true);
    if (enemies.length === 0) {
      setEnemies(spawnEnemies(wave));
    }
  };

  // Сброс состояния боя (после смерти персонажа)
  const resetBattle = () => {
    const { maxHp, damage } = calculatePlayerStats(level || 1);
    setPlayerHp(maxHp);
    setPlayerMaxHp(maxHp);
    setPlayerDamage(damage);
    setWave(1);
    setEnemies([]);
    setGoldCollected(0);
    setGameOver(false);
  };

  // Симуляция одного раунда боя
  const battleRound = () => {
    if (!battleRunning) return;
    if (enemies.length === 0) {
      setWave(prev => prev + 1);
      setEnemies(spawnEnemies(wave + 1));
      return;
    }

    // Персонаж атакует первого врага
    const currentEnemies = [...enemies];
    let enemy = currentEnemies[0];
    enemy.hp -= playerDamage;
    if (enemy.hp <= 0) {
      // Враг побеждён — начисляем золото и удаляем его
      setGoldCollected(prev => prev + enemy.goldReward);
      currentEnemies.shift();
    } else {
      currentEnemies[0] = enemy;
    }

    // Оставшиеся враги атакуют персонажа
    const totalEnemyDamage = currentEnemies.reduce((acc, en) => acc + en.damage, 0);
    const newPlayerHp = playerHp - totalEnemyDamage;
    setPlayerHp(newPlayerHp);
    setEnemies(currentEnemies);

    // Если HP персонажа опускается до 0 или ниже, бой завершается
    if (newPlayerHp <= 0) {
      setBattleRunning(false);
      setGameOver(true);
      updateBattleStats();
    }
  };

  // Обновление данных боя на сервере:
  // При смерти персонажа добытое золото прибавляется к балансу, а число попыток уменьшается на 1.
  const updateBattleStats = async () => {
    if (!userId) return;
    try {
      const newCoins = coins + goldCollected;
      // Предполагается, что battle_attempts хранится в базе данных, и мы списываем одну попытку
      const newBattleAttempts = battle_attempts - 1;
      await axios.patch(` https://68c5-158-195-196-54.ngrok-free.app/users/${userId}`, {
        coins: newCoins,
        battle_attempts: newBattleAttempts,
      });
      refreshUserData(); // Обновляем данные пользователя после PATCH-запроса
    } catch (error) {
      console.error("Ошибка обновления данных боя на сервере:", error);
    }
  };

  // Интервал для симуляции раундов боя
  useEffect(() => {
    if (battleRunning && !gameOver) {
      intervalRef.current = window.setInterval(() => {
        battleRound();
      }, ARENA_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [battleRunning, playerHp, enemies]);

  // Периодическое обновление данных пользователя (например, каждую минуту)
  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      refreshUserData();
    }, 60000); // Обновление каждые 60 секунд
    return () => clearInterval(refreshInterval);
  }, [refreshUserData]);

  // Функция для форматирования оставшегося времени (mm:ss)
  const formatTime = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="arena-container"
      style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "20px" }}
    >
      {/* Левая часть: Персонаж */}
      <div className="character" style={{ width: "30%", border: "1px solid white", padding: "10px" }}>
        <h2>Персонаж</h2>
        <p>Уровень: {level}</p>
        <p>
          HP: {playerHp} / {playerMaxHp}
        </p>
        <p>Урон: {playerDamage}</p>
        <p>Золото (не сохранено): {goldCollected}</p>
        <p>Попытки: {battle_attempts} из 5</p>
        {battle_attempts < 5 && nextBattleRegen > 0 && (
          <p>Следующая попытка через: {formatTime(nextBattleRegen)}</p>
        )}
        {gameOver && <p style={{ color: "red" }}>Вы погибли!</p>}
      </div>

      {/* Центральная часть: Арена */}
      <div
        className="arena"
        style={{ width: "40%", border: "1px solid white", padding: "10px", textAlign: "center" }}
      >
        <h2>Арена</h2>
        <p>Волна: {wave <= 5 ? wave : "Босс"}</p>
        {battleRunning ? (
          <p>Бой идет...</p>
        ) : (
          <button onClick={startBattle} disabled={battle_attempts <= 0}>
            {gameOver ? "Начать заново" : "Начать бой"}
          </button>
        )}
        {battle_attempts <= 0 && (
          <p style={{ color: "red" }}>Нет попыток. Ждите восстановления.</p>
        )}
      </div>

      {/* Правая часть: Противники */}
      <div className="enemies" style={{ width: "30%", border: "1px solid white", padding: "10px" }}>
        <h2>Противники</h2>
        {enemies.length > 0 ? (
          enemies.map((enemy) => (
            <div key={enemy.id} style={{ marginBottom: "10px", border: "1px solid red", padding: "5px" }}>
              <p>{enemy.isBoss ? "Босс" : `Враг ${enemy.level} уровня`}</p>
              <p>HP: {enemy.hp}</p>
              <p>Урон: {enemy.damage}</p>
            </div>
          ))
        ) : (
          <p>Нет противников</p>
        )}
      </div>
    </div>
  );
};

export default Arena;



