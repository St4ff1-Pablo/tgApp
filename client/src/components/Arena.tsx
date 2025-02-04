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
  // Пример: уровень 1 – 10 HP и 3 урона, далее +3 HP и +2 урона за уровень
  const maxHp = 10 + (level - 1) * 3;
  const damage = 3 + (level - 1) * 2;
  return { maxHp, damage };
};

// Функция создания врагов для текущей волны
const spawnEnemies = (wave: number): Enemy[] => {
  if (wave <= 5) {
    const enemyLevel = wave; // Волна 1 — враги 1 уровня, и т.д.
    const count = wave;
    const enemies: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      enemies.push({
        id: i,
        level: enemyLevel,
        hp: enemyLevel * 6,       // Например, 1 уровень: 6 HP, 2 уровень: 12 HP и т.д.
        damage: enemyLevel * 2,     // Например, 1 уровень: 2 урона, 2 уровень: 4 урона
        goldReward: enemyLevel * 10,// Золото за убийство врага
      });
    }
    return enemies;
  } else {
    // После 5-й волны появляется босс: один враг с усиленными характеристиками
    return [{
      id: 0,
      level: 1,
      hp: 60,   // Увеличенное здоровье
      damage: 15, // Повышенный урон
      goldReward: 150, // Больше золота за убийство босса
      isBoss: true,
    }];
  }
};

const ARENA_INTERVAL = 1000;         // Интервал раунда боя в мс
const COOLDOWN_TIME = 30 * 60 * 1000;  // 30 минут в мс
const MAX_ATTEMPTS = 5;

const Arena: React.FC = () => {
  // Расширили UserContext, добавив coins для текущего баланса
  const { userId, level, refreshUserData, coins } = useUserContext();

  // Состояния персонажа и боя
  const [playerHp, setPlayerHp] = useState<number>(0);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(0);
  const [playerDamage, setPlayerDamage] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [goldCollected, setGoldCollected] = useState<number>(0);
  const [battleRunning, setBattleRunning] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Ограничение по числу боёв
  const [attempts, setAttempts] = useState<number>(MAX_ATTEMPTS);
  // Массив cooldown’ов для сохранения времени восстановления использованных попыток
  const [cooldowns, setCooldowns] = useState<number[]>([]);
  // Обратный отсчёт до восстановления следующей попытки (в мс)
  const [regenCountdown, setRegenCountdown] = useState<number>(0);

  const intervalRef = useRef<number | null>(null);
  const cooldownIntervalRef = useRef<number | null>(null);

  // При монтировании компонента считываем попытки и cooldown'ы из localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem("attempts");
    const savedCooldowns = localStorage.getItem("cooldowns");
    if (savedAttempts) {
      setAttempts(JSON.parse(savedAttempts));
    }
    if (savedCooldowns) {
      setCooldowns(JSON.parse(savedCooldowns));
    }
  }, []);

  // Сохраняем попытки и cooldown'ы в localStorage при их изменении
  useEffect(() => {
    localStorage.setItem("attempts", JSON.stringify(attempts));
    localStorage.setItem("cooldowns", JSON.stringify(cooldowns));
  }, [attempts, cooldowns]);

  // Инициализация характеристик персонажа при загрузке и при изменении уровня
  useEffect(() => {
    const { maxHp, damage } = calculatePlayerStats(level || 1);
    setPlayerMaxHp(maxHp);
    setPlayerHp(maxHp);
    setPlayerDamage(damage);
  }, [level]);

  // Функция старта боя – проверяет, есть ли попытки
  const startBattle = () => {
    if (attempts <= 0) return; // Если попыток нет, запуск недоступен

    // Если игра завершена, сбрасываем состояние
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
      // Если враг побеждён, начисляем золото и удаляем его из списка
      setGoldCollected(prev => prev + enemy.goldReward);
      currentEnemies.shift();
    } else {
      currentEnemies[0] = enemy;
    }

    // Остальные враги наносят урон персонажу
    const totalEnemyDamage = currentEnemies.reduce((acc, en) => acc + en.damage, 0);
    const newPlayerHp = playerHp - totalEnemyDamage;
    setPlayerHp(newPlayerHp);

    setEnemies(currentEnemies);

    // Если HP персонажа упали до 0 или ниже, завершаем бой
    if (newPlayerHp <= 0) {
      setBattleRunning(false);
      setGameOver(true);
      if (attempts > 0) {
        // Расходуем попытку и добавляем время восстановления для неё
        setAttempts(prev => prev - 1);
        setCooldowns(prev => [...prev, Date.now() + COOLDOWN_TIME]);
      }
      transferGold();
    }
  };

  // Функция передачи золота на сервер: прибавляем добытое золото к текущему балансу
  const transferGold = async () => {
    if (!userId) return;
    try {
      const newCoins = coins + goldCollected;
      await axios.patch(`https://68c5-158-195-196-54.ngrok-free.app/users/${userId}`, {
        coins: newCoins,
      });
      refreshUserData();
    } catch (error) {
      console.error("Ошибка передачи золота на сервер:", error);
    }
  };

  // Интервал для раундов боя
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

  // Интервал для обработки cooldown’ов и восстановления попыток
  useEffect(() => {
    cooldownIntervalRef.current = window.setInterval(() => {
      if (cooldowns.length > 0) {
        const nextCooldown = Math.min(...cooldowns);
        const remaining = nextCooldown - Date.now();
        setRegenCountdown(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          setCooldowns(prev => prev.filter(time => time > Date.now()));
          setAttempts(prev => Math.min(prev + 1, MAX_ATTEMPTS));
        }
      } else {
        setRegenCountdown(0);
      }
    }, 1000);

    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, [cooldowns]);

  // Функция для форматирования оставшегося времени в формате mm:ss
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
        <p>HP: {playerHp} / {playerMaxHp}</p>
        <p>Урон: {playerDamage}</p>
        <p>Золото (не сохранено): {goldCollected}</p>
        <p>Попытки: {attempts} из {MAX_ATTEMPTS}</p>
        {attempts < MAX_ATTEMPTS && regenCountdown > 0 && (
          <p>Следующая попытка через: {formatTime(regenCountdown)}</p>
        )}
        {gameOver && <p style={{ color: "red" }}>Вы погибли!</p>}
      </div>

      {/* Центральная часть: Арена */}
      <div className="arena" style={{ width: "40%", border: "1px solid white", padding: "10px", textAlign: "center" }}>
        <h2>Арена</h2>
        <p>Волна: {wave <= 5 ? wave : "Босс"}</p>
        {battleRunning ? (
          <p>Бой идет...</p>
        ) : (
          <button onClick={startBattle} disabled={attempts <= 0}>
            {gameOver ? "Начать заново" : "Начать бой"}
          </button>
        )}
        {attempts <= 0 && <p style={{ color: "red" }}>Нет попыток. Ждите восстановления.</p>}
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



