// Arena.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUserContext } from './UserContext';
import './styles/App.css'; // Можно добавить или изменить стили по необходимости

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
  // Пример: уровень 1 – 10 HP и 3 урона, затем каждое повышение уровня добавляет 3 HP и 2 урона
  const maxHp = 10 + (level - 1) * 3;
  const damage = 3 + (level - 1) * 2;
  return { maxHp, damage };
};

// Функция создания врагов для волны
const spawnEnemies = (wave: number): Enemy[] => {
  if (wave <= 5) {
    const enemyLevel = wave; // Волна 1 — враги 1 уровня, волна 2 — враги 2 уровня и т.д.
    const count = wave;
    const enemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      enemies.push({
        id: i,
        level: enemyLevel,
        hp: enemyLevel * 6,      // Пример: враг 1 уровня – 6 HP, 2 уровня – 12 HP и т.д.
        damage: enemyLevel * 2,    // Пример: враг 1 уровня – 2 урона, 2 уровня – 4 урона и т.д.
        goldReward: enemyLevel * 10, // За убийство врага начисляется золото
      });
    }
    return enemies;
  } else {
    // Волна с боссом (после 5-й волны)
    return [{
      id: 0,
      level: 1, // Босс обозначен как уровень 1, но характеристики выше
      hp: 60,   // Увеличенное здоровье для босса
      damage: 15, // Повышенный урон
      goldReward: 150, // Больше золота за убийство босса
      isBoss: true,
    }];
  }
};

const Arena: React.FC = () => {
  const { userId, level, refreshUserData } = useUserContext();
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

  // Функция старта боя
  const startBattle = () => {
    if (gameOver) {
      // Если игра закончена, сбрасываем состояние
      resetBattle();
    }
    setBattleRunning(true);
    // Если врагов ещё нет, создаём первую волну
    if (enemies.length === 0) {
      setEnemies(spawnEnemies(wave));
    }
  };

  // Функция сброса игры
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

  // Функция симуляции одного раунда боя
  const battleRound = () => {
    if (!battleRunning) return;
    if (enemies.length === 0) {
      // Если все враги побеждены, переходим к следующей волне
      setWave(prev => prev + 1);
      setEnemies(spawnEnemies(wave + 1));
      return;
    }

    // Персонаж атакует первого врага
    const currentEnemies = [...enemies];
    let enemy = currentEnemies[0];
    enemy.hp -= playerDamage;
    if (enemy.hp <= 0) {
      // Враг побеждён, начисляем золото и удаляем врага из списка
      setGoldCollected(prev => prev + enemy.goldReward);
      currentEnemies.shift();
    } else {
      currentEnemies[0] = enemy;
    }

    // Оставшиеся враги атакуют персонажа
    const totalEnemyDamage = currentEnemies.reduce((acc, en) => acc + en.damage, 0);
    const newPlayerHp = playerHp - totalEnemyDamage;
    setPlayerHp(newPlayerHp);

    // Обновляем состояние врагов
    setEnemies(currentEnemies);

    // Проверяем, жив ли персонаж
    if (newPlayerHp <= 0) {
      setBattleRunning(false);
      setGameOver(true);
      // Передаём собранное золото на сервер
      transferGold();
    }
  };

  // Функция передачи золота на сервер после смерти персонажа
  const transferGold = async () => {
    if (!userId) return;
    try {
      // Используем эндпоинт PATCH /users/{user_id} для обновления золота
      await axios.patch(`https://your-backend-url.com/users/${userId}`, {
        coins: goldCollected, // В реальной логике можно прибавлять к уже имеющемуся золоту
      });
      // Обновляем данные пользователя
      refreshUserData();
    } catch (error) {
      console.error("Ошибка передачи золота на сервер:", error);
    }
  };

  // Запуск раундов боя с интервалом (например, 1 раз в секунду)
  useEffect(() => {
    if (battleRunning && !gameOver) {
      intervalRef.current = window.setInterval(() => {
        battleRound();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [battleRunning, playerHp, enemies]);

  return (
    <div
      className="arena-container"
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: "20px",
      }}
    >
      {/* Левая часть: Персонаж */}
      <div
        className="character"
        style={{ width: "30%", border: "1px solid white", padding: "10px" }}
      >
        <h2>Персонаж</h2>
        <p>Уровень: {level}</p>
        <p>
          HP: {playerHp} / {playerMaxHp}
        </p>
        <p>Урон: {playerDamage}</p>
        <p>Золото (не сохранено): {goldCollected}</p>
        {gameOver && <p style={{ color: "red" }}>Вы погибли!</p>}
      </div>

      {/* Центральная часть: Арена */}
      <div
        className="arena"
        style={{
          width: "40%",
          border: "1px solid white",
          padding: "10px",
          textAlign: "center",
        }}
      >
        <h2>Арена</h2>
        <p>Волна: {wave <= 5 ? wave : "Босс"}</p>
        {battleRunning ? (
          <p>Бой идет...</p>
        ) : (
          <button onClick={startBattle}>
            {gameOver ? "Начать заново" : "Начать бой"}
          </button>
        )}
      </div>

      {/* Правая часть: Противники */}
      <div
        className="enemies"
        style={{ width: "30%", border: "1px solid white", padding: "10px" }}
      >
        <h2>Противники</h2>
        {enemies.length > 0 ? (
          enemies.map((enemy) => (
            <div
              key={enemy.id}
              style={{
                marginBottom: "10px",
                border: "1px solid red",
                padding: "5px",
              }}
            >
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


