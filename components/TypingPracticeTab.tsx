import React, { useState, useEffect, useRef } from 'react';
import { TypingMode, SentenceCategory, FallingItem } from '../types';
import { FINGER_PRACTICE, WORD_PRACTICE, SENTENCE_PRACTICE } from '../constants';
import { decomposeHangul, getRandomInt } from '../utils';
import VirtualKeyboard from './VirtualKeyboard';

const TypingPracticeTab: React.FC = () => {
  // Settings
  const [mode, setMode] = useState<TypingMode>(TypingMode.FINGER);
  const [category, setCategory] = useState<SentenceCategory>(SentenceCategory.SOCIAL); // For sentences
  const [fingerGroup, setFingerGroup] = useState<string>('index'); // for finger mode
  const [speedSec, setSpeedSec] = useState<number>(10); // Seconds to fall (Difficulty)

  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Refs for game loop to avoid stale closures
  const itemsRef = useRef<FallingItem[]>([]);
  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const isPlayingRef = useRef(false); // Track playing state synchronously
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number>(0);

  // Track usage to prevent repetition (primitive)
  const usageHistory = useRef<Record<string, number>>({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Reset Game
  const resetGame = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setScore(0);
    setFallingItems([]);
    itemsRef.current = [];
    setInputValue('');
    setGameOver(false);
    setMessage('');
    usageHistory.current = {};
    setTimeLeft(300); // Reset to 5 mins
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
    isPlayingRef.current = true;
    lastSpawnTime.current = 0; 
    
    // Start Game Loop
    requestRef.current = requestAnimationFrame(gameLoop);
    
    // Start Timer
    timerIntervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleWin("시간 종료! 연습이 끝났습니다.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Content Generator
  const getNextContent = (): string => {
    let pool: string[] = [];

    if (mode === TypingMode.FINGER) {
       // @ts-ignore
       pool = FINGER_PRACTICE[fingerGroup] || FINGER_PRACTICE.index;
    } else if (mode === TypingMode.WORD) {
       pool = WORD_PRACTICE;
    } else {
       pool = SENTENCE_PRACTICE[category];
    }
    
    if (!pool || pool.length === 0) return "";

    // Filter items used < 3 times
    const candidates = pool.filter(item => (usageHistory.current[item] || 0) < 3);
    
    let content = '';
    if (candidates.length > 0) {
      // Pick from candidates
      content = candidates[getRandomInt(0, candidates.length - 1)];
    } else {
      // If all items used 3+ times, pick freely from the full pool to ensure continuous play
      content = pool[getRandomInt(0, pool.length - 1)];
    }

    // Update history
    usageHistory.current[content] = (usageHistory.current[content] || 0) + 1;
    return content;
  };

  // Game Loop
  const gameLoop = (time: number) => {
    if (!isPlayingRef.current) return;

    // Spawn Logic
    // Adjust spawn interval based on speed setting. 
    // If speedSec is low (fast speed), spawn interval is short.
    // If speedSec is high (slow speed), spawn interval is long.
    const spawnInterval = Math.max(800, speedSec * 200); 
    
    if (time - lastSpawnTime.current > spawnInterval) {
      const newText = getNextContent();
      if (newText) {
        const newItem: FallingItem = {
          id: Date.now() + Math.random(), // Ensure uniqueness
          text: newText,
          x: getRandomInt(5, 80), // Keep within 5-80% width to be safe
          y: 0,
          speed: 100 / (speedSec * 60) // Percent per frame (approx 60fps)
        };
        itemsRef.current.push(newItem);
      }
      lastSpawnTime.current = time;
    }

    // Move Items
    const remainingItems: FallingItem[] = [];
    let penalty = 0;

    itemsRef.current.forEach(item => {
      item.y += item.speed;
      if (item.y < 100) {
        remainingItems.push(item);
      } else {
        // Hit floor
        penalty += 3;
      }
    });

    if (penalty > 0) {
      setScore(prev => Math.max(0, prev - penalty));
    }

    itemsRef.current = remainingItems;
    setFallingItems([...itemsRef.current]); // Trigger render

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // Handle Input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      checkInput();
    }
  };

  const checkInput = () => {
    const val = inputValue.trim();
    if (!val) return;

    const matchIndex = itemsRef.current.findIndex(item => item.text === val);

    if (matchIndex !== -1) {
      // Correct
      itemsRef.current.splice(matchIndex, 1);
      setFallingItems([...itemsRef.current]);
      setScore(prev => {
        const newScore = prev + 3;
        if (newScore >= 100) {
           handleWin("축하합니다! 100점 달성! 🎉");
        }
        return newScore;
      });
      setInputValue('');
    } else {
      // Incorrect
      setScore(prev => Math.max(0, prev - 3));
      setInputValue('');
    }
  };

  const handleWin = (msg: string) => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setGameOver(true);
    setMessage(msg);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
  };

  // Determine highlight chars for keyboard
  const getHighlightChars = (): string[] => {
    if (fallingItems.length > 0) {
      // Find item with highest Y (closest to bottom)
      const target = fallingItems.reduce((prev, current) => (prev.y > current.y) ? prev : current);
      // Decompose first char of that text
      if (target.text.length > 0) {
        return decomposeHangul(target.text[0]);
      }
    }
    return [];
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col p-4 relative overflow-hidden bg-gray-50">
      
      {/* Top Bar: Settings & Status */}
      <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow-sm z-20 gap-4">
        
        <div className="flex gap-4 items-center flex-wrap">
           <div className="flex flex-col">
             <label className="text-xs font-bold text-gray-500">모드</label>
             <select 
               className="border rounded p-1 text-sm"
               value={mode} 
               onChange={(e) => setMode(e.target.value as TypingMode)}
               disabled={isPlaying}
             >
               <option value={TypingMode.FINGER}>손가락 운지</option>
               <option value={TypingMode.WORD}>낱말 연습</option>
               <option value={TypingMode.SENTENCE}>문장 연습</option>
             </select>
           </div>

           {mode === TypingMode.FINGER && (
             <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500">손가락</label>
                <select className="border rounded p-1 text-sm" value={fingerGroup} onChange={e => setFingerGroup(e.target.value)} disabled={isPlaying}>
                  <option value="index">검지</option>
                  <option value="middle">중지</option>
                  <option value="ring">약지</option>
                  <option value="pinky">새끼</option>
                  <option value="shift">Shift 키</option>
                </select>
             </div>
           )}

           {mode === TypingMode.SENTENCE && (
             <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500">주제</label>
                <select className="border rounded p-1 text-sm" value={category} onChange={e => setCategory(e.target.value as SentenceCategory)} disabled={isPlaying}>
                  <option value={SentenceCategory.SOCIAL}>사회</option>
                  <option value={SentenceCategory.SCIENCE}>과학</option>
                  <option value={SentenceCategory.IT}>정보</option>
                  <option value={SentenceCategory.KOREAN}>국어</option>
                </select>
             </div>
           )}

           <div className="flex flex-col">
             <label className="text-xs font-bold text-gray-500">속도</label>
             <select className="border rounded p-1 text-sm" value={speedSec} onChange={e => setSpeedSec(Number(e.target.value))} disabled={isPlaying}>
               <option value={30}>느림</option>
               <option value={20}>보통</option>
               <option value={10}>빠름</option>
               <option value={5}>매우 빠름</option>
             </select>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <span className="text-xs font-bold text-gray-400">남은 시간</span>
             <span className="text-xl font-mono font-bold text-indigo-500">{formatTime(timeLeft)}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-xs font-bold text-gray-400">점수</span>
             <span className="text-2xl font-black text-indigo-600">{score}</span>
           </div>
           
           {!isPlaying ? (
             <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow transition-transform active:scale-95">시작</button>
           ) : (
             <button onClick={resetGame} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow transition-transform active:scale-95">중단</button>
           )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative bg-gradient-to-b from-blue-50 to-white my-4 border-x-4 border-indigo-100 rounded-lg overflow-hidden" ref={gameContainerRef}>
         {/* Falling Items */}
         {fallingItems.map(item => (
           <div 
             key={item.id}
             className="absolute bg-white/80 px-3 py-1 rounded shadow-md font-bold text-gray-800 whitespace-nowrap border border-gray-200 z-10"
             style={{ 
               left: `${item.x}%`, 
               top: `${item.y}%`,
               fontSize: mode === TypingMode.SENTENCE ? '1rem' : '1.5rem'
             }}
           >
             {item.text}
           </div>
         ))}

         {/* Messages */}
         {gameOver && (
           <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
             <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
               <h3 className="text-3xl font-black text-indigo-600 mb-4">{message}</h3>
               <button onClick={startGame} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition">다시 하기</button>
             </div>
           </div>
         )}
      </div>

      {/* Input & Visualizer */}
      <div className="flex flex-col items-center gap-4 z-20">
        <input 
          type="text" 
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="여기에 입력하세요 (Space/Enter로 입력)"
          className="w-full max-w-2xl px-6 py-4 text-2xl border-2 border-indigo-300 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-100 text-center shadow-lg"
          autoFocus
          disabled={!isPlaying}
        />
        
        <VirtualKeyboard highlightChars={isPlaying ? getHighlightChars() : []} />
      </div>

    </div>
  );
};

export default TypingPracticeTab;