import React, { useState, useEffect } from 'react';

const TimerTab: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const addTime = (minutes: number) => {
    setTimeLeft((prev) => prev + minutes * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const toggleTimer = () => {
    if (timeLeft > 0) setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="bg-white rounded-[3rem] shadow-2xl p-16 w-full max-w-4xl flex flex-col items-center border border-gray-100">
        
        {/* Timer Display */}
        <div className={`font-mono text-[12rem] leading-none mb-12 tabular-nums tracking-tighter transition-colors duration-500 ${timeLeft < 10 && isActive && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-12">
           <button 
             onClick={() => addTime(1)}
             className="px-8 py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-2xl text-2xl font-bold transition-transform active:scale-95 shadow-sm"
           >
             + 1분
           </button>
           <button 
             onClick={() => addTime(3)}
             className="px-8 py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-2xl text-2xl font-bold transition-transform active:scale-95 shadow-sm"
           >
             + 3분
           </button>
           <button 
             onClick={() => addTime(5)}
             className="px-8 py-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-2xl text-2xl font-bold transition-transform active:scale-95 shadow-sm"
           >
             + 5분
           </button>
        </div>

        <div className="flex gap-6 w-full max-w-lg">
           <button 
             onClick={toggleTimer}
             className={`flex-1 py-6 rounded-2xl text-3xl font-black text-white shadow-lg transition-transform active:scale-95 ${isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
           >
             {isActive ? '일시정지 ⏸' : '시작 ▶'}
           </button>
           <button 
             onClick={resetTimer}
             className="flex-1 py-6 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-2xl text-3xl font-black shadow-lg transition-transform active:scale-95"
           >
             초기화 ↺
           </button>
        </div>
      </div>
    </div>
  );
};

export default TimerTab;
