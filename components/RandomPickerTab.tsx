import React, { useState, useEffect, useRef } from 'react';
import { getRandomInt } from '../utils';

const RandomPickerTab: React.FC = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  
  // Create 26 students
  const students = Array.from({ length: 26 }, (_, i) => i + 1);

  // Random positions for balls to simulate chaos
  const [ballStyles, setBallStyles] = useState<{left: string, top: string, animDelay: string, animDuration: string}[]>([]);

  useEffect(() => {
    // Generate random styles only once on mount
    const styles = students.map(() => ({
      left: `${getRandomInt(10, 90)}%`,
      top: `${getRandomInt(10, 70)}%`,
      animDelay: `${Math.random() * 2}s`,
      animDuration: `${3 + Math.random() * 4}s`
    }));
    setBallStyles(styles);
  }, []);

  const startPicker = () => {
    setIsRolling(true);
    setWinner(null);

    // Simulate "rolling" time
    setTimeout(() => {
      // Pick a winner
      const w = getRandomInt(1, 26);
      setWinner(w);
      setIsRolling(false);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <h2 className="text-3xl font-bold text-indigo-900 mb-8 absolute top-8 z-10">행운의 발표자는 누구? 🎱</h2>

      {/* Box Container */}
      <div className="relative w-full max-w-4xl h-[600px] bg-white border-4 border-gray-300 rounded-3xl shadow-inner overflow-hidden mb-8">
        
        {/* Balls */}
        {students.map((num, idx) => {
           // If there is a winner and this isn't it, fade it out slightly
           const isWinner = winner === num;
           const isLoser = winner !== null && !isWinner;
           
           // If we are rolling, balls shake violently.
           // If idle, they float.
           // If winner found, winner drops, others freeze or fade.
           
           let className = "absolute w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg text-white transition-all duration-500 ";
           
           // Colors
           const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
           className += colors[idx % colors.length];

           let style: React.CSSProperties = {};
           
           if (isRolling) {
              // Rapid random movement simulated by CSS keyframes or just jitter
              className += " animate-ping"; // Placeholder for rapid motion, actually ping is scaling
              style = {
                 left: ballStyles[idx]?.left || '50%',
                 top: ballStyles[idx]?.top || '50%',
                 transition: 'all 0.2s'
              }
           } else if (winner !== null) {
              if (isWinner) {
                 className += " animate-drop z-50 scale-125";
                 style = {
                    left: '50%', // Move to center horizontally
                    top: '20%', // Start slightly up then drop via animation
                    transform: 'translateX(-50%)'
                 }
              } else {
                 className += " opacity-20 grayscale";
                 style = {
                    left: ballStyles[idx]?.left,
                    top: ballStyles[idx]?.top,
                 }
              }
           } else {
              // Idle
              className += " animate-float";
              style = {
                 left: ballStyles[idx]?.left,
                 top: ballStyles[idx]?.top,
                 animationDelay: ballStyles[idx]?.animDelay,
                 animationDuration: ballStyles[idx]?.animDuration
              }
           }

           return (
             <div key={num} className={className} style={style}>
               {num}
             </div>
           );
        })}
        
        {/* The Hole / Drop Zone */}
        {winner !== null && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gray-800 rounded-t-full opacity-20 blur-xl"></div>
        )}

      </div>

      <button
        onClick={startPicker}
        disabled={isRolling}
        className={`px-12 py-4 rounded-full text-2xl font-black text-white shadow-xl transition-all ${isRolling ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'}`}
      >
        {isRolling ? '추첨 중...' : 'START'}
      </button>

      {winner && !isRolling && (
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-2xl border-4 border-indigo-500 text-center animate-bounce z-50">
            <h3 className="text-3xl text-gray-600 font-bold mb-4">축하합니다!</h3>
            <div className="text-9xl font-black text-indigo-600">{winner}번</div>
         </div>
      )}
    </div>
  );
};

export default RandomPickerTab;
