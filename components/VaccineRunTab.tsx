import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onBack: () => void;
}

const VaccineRunTab: React.FC<Props> = ({ onBack }) => {
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showManual, setShowManual] = useState(true); // Show manual initially
  const [gameOver, setGameOver] = useState(false);
  
  // Game Data
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game Physics State (Visual Sync)
  const [dinoY, setDinoY] = useState(0); // 0 is ground
  const [obstacles, setObstacles] = useState<{id: number, x: number, type: 'VIRUS' | 'SPAM'}[]>([]);
  
  // Refs for Game Logic (Source of Truth)
  const requestRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(5);
  
  // Dino Physics Refs
  const velocityY = useRef(0);
  const dinoYRef = useRef(0);
  const isJumpingRef = useRef(false);
  
  // Obstacles Ref
  const obstaclesRef = useRef<{id: number, x: number, type: 'VIRUS' | 'SPAM'}[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('vaccine_run_highscore');
    if (saved) setHighScore(parseInt(saved));
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    setIsPlaying(true);
    setIsPaused(false);
    setGameOver(false);
    setShowManual(false);
    
    // Reset Data
    setScore(0);
    setObstacles([]);
    setDinoY(0);
    
    // Reset Logic Refs
    scoreRef.current = 0;
    speedRef.current = 6;
    dinoYRef.current = 0;
    velocityY.current = 0;
    isJumpingRef.current = false;
    obstaclesRef.current = [];
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const stopGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setGameOver(false);
    setShowManual(true); // Go back to manual
  };

  const togglePause = () => {
    if (!isPlaying || gameOver) return;

    if (isPaused) {
      // Resume
      setIsPaused(false);
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      // Pause
      setIsPaused(true);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  };

  const jump = () => {
    if (!isJumpingRef.current && isPlaying && !isPaused && !gameOver) {
      isJumpingRef.current = true;
      velocityY.current = 14; // Jump force
    }
  };

  const gameLoop = () => {
    // 1. Gravity Logic
    if (isJumpingRef.current) {
      dinoYRef.current += velocityY.current;
      velocityY.current -= 0.6; // Gravity
      
      if (dinoYRef.current <= 0) {
        dinoYRef.current = 0;
        isJumpingRef.current = false;
        velocityY.current = 0;
      }
    }
    setDinoY(dinoYRef.current);

    // 2. Obstacles Logic
    obstaclesRef.current = obstaclesRef.current
      .map(obs => ({ ...obs, x: obs.x - speedRef.current }))
      .filter(obs => obs.x > -50);

    // Spawn new obstacles
    const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
    if (!lastObs || (800 - lastObs.x > Math.random() * 300 + 250)) {
       if (Math.random() < 0.05) { 
          obstaclesRef.current.push({
            id: Date.now() + Math.random(),
            x: 800 + Math.random() * 100,
            type: Math.random() > 0.5 ? 'VIRUS' : 'SPAM'
          });
       }
    }
    setObstacles([...obstaclesRef.current]);

    // 3. Collision Detection
    const dinoHitbox = { x: 50 + 10, w: 20, y: dinoYRef.current, h: 30 }; 
    
    for (const obs of obstaclesRef.current) {
      const obsHitbox = { x: obs.x + 10, w: 20, y: 0, h: 25 };
      
      if (
        dinoHitbox.x < obsHitbox.x + obsHitbox.w &&
        dinoHitbox.x + dinoHitbox.w > obsHitbox.x &&
        dinoHitbox.y < obsHitbox.y + obsHitbox.h 
      ) {
        handleGameOver();
        return; 
      }
    }

    // 4. Score & Difficulty
    scoreRef.current++;
    if (scoreRef.current % 5 === 0) {
      setScore(Math.floor(scoreRef.current / 5));
    }
    if (scoreRef.current % 500 === 0) {
      speedRef.current += 0.5;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false); // Stop input handling but keep game over screen
    const currentScore = Math.floor(scoreRef.current / 5);
    if (currentScore > highScore) {
      setHighScore(currentScore);
      localStorage.setItem('vaccine_run_highscore', currentScore.toString());
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !isPaused) {
        e.preventDefault();
        if (showManual) {
           startGame();
        } else {
           jump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, showManual]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-100">
      
      {/* Game Area */}
      <div 
        className="max-w-4xl w-full bg-white rounded-t-3xl shadow-xl overflow-hidden relative border-4 border-slate-200 border-b-0 select-none"
        style={{ height: '400px' }}
        onClick={jump}
      >
        {/* Score Header */}
        <div className="absolute top-4 right-4 z-10 text-right">
          <div className="text-gray-400 font-bold text-xs">HI {highScore.toString().padStart(5, '0')}</div>
          <div className="text-gray-800 font-black text-2xl">{Math.floor(score).toString().padStart(5, '0')}</div>
        </div>

        {/* Game Scene */}
        <div className="w-full h-full relative overflow-hidden bg-white cursor-pointer">
          <div className="absolute bottom-10 w-full h-px bg-gray-300"></div>

          {/* Dino */}
          <div 
            className="absolute bottom-10 left-[50px] w-10 h-10 flex items-center justify-center text-4xl transition-transform will-change-transform"
            style={{ transform: `translateY(-${dinoY}px)` }}
          >
            🤖
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <div 
              key={obs.id}
              className="absolute bottom-10 w-10 h-10 flex items-center justify-center text-3xl will-change-transform"
              style={{ left: `${obs.x}px` }}
            >
              {obs.type === 'VIRUS' ? '🦠' : '📧'}
            </div>
          ))}

          <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float">☁️</div>
          <div className="absolute top-20 right-20 text-4xl opacity-20 animate-float" style={{ animationDelay: '2s'}}>☁️</div>
        </div>

        {/* Overlays */}
        
        {/* 1. Manual Overlay */}
        {showManual && (
           <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-8 text-center">
              <h2 className="text-3xl font-black text-indigo-900 mb-2">🛡️ 백신RUN </h2>
              <p className="text-gray-500 mb-6 font-medium">정보 보호의 중요성을 배우며 악성 코드를 피하세요!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center">
                    <span className="text-4xl mb-2">🦠</span>
                    <span className="font-bold text-red-600">컴퓨터 바이러스</span>
                    <span className="text-xs text-gray-500 mt-1">시스템을 망가뜨려요</span>
                 </div>
                 <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center">
                    <span className="text-4xl mb-2">📧</span>
                    <span className="font-bold text-orange-600">스팸 메일</span>
                    <span className="text-xs text-gray-500 mt-1">개인정보를 훔쳐가요</span>
                 </div>
              </div>

              <div className="bg-indigo-50 px-6 py-3 rounded-xl mb-6 text-sm text-indigo-800 font-bold">
                 점프하려면 <span className="bg-white px-2 py-1 rounded border border-indigo-200 mx-1">Space</span> 키를 누르세요!
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                게임 시작하기
              </button>
           </div>
        )}

        {/* 2. Game Over Overlay */}
        {gameOver && !showManual && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-4xl mb-2">😵</div>
            <h2 className="text-white font-black text-3xl mb-6">GAME OVER</h2>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
            >
              다시 시도 🔄
            </button>
          </div>
        )}

        {/* 3. Pause Overlay */}
        {isPaused && !gameOver && (
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl font-black text-2xl text-gray-700 animate-pulse">
                 PAUSED
              </div>
           </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="max-w-4xl w-full grid grid-cols-3 gap-2 bg-white p-2 rounded-b-3xl border-4 border-t-0 border-slate-200 shadow-xl">
         <button 
            onClick={startGame}
            className="bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
         >
            <span className="font-black text-sm md:text-base">RESTART</span>
            <span className="text-xl">🔄</span>
         </button>
         
         <button 
            onClick={togglePause}
            disabled={showManual || gameOver || !isPlaying}
            className={`text-white py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed
               ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-400 hover:bg-yellow-500'}`}
         >
            <span className="font-black text-sm md:text-base">{isPaused ? 'RESUME' : 'PAUSE'}</span>
            <span className="text-xl">{isPaused ? '▶' : '⏸'}</span>
         </button>
         
         <button 
            onClick={stopGame}
            className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
         >
            <span className="font-black text-sm md:text-base">STOP</span>
            <span className="text-xl">⏹</span>
         </button>
      </div>

    </div>
  );
};

export default VaccineRunTab;