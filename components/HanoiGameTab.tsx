import React, { useState, useEffect } from 'react';

interface Props {
  onBack: () => void;
}

// Neon Colors for Disks
const DISK_COLORS = [
  'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]',
  'bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.6)]',
  'bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.6)]',
  'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
  'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
];

const HanoiGameTab: React.FC<Props> = ({ onBack }) => {
  // Game State
  const [numDisks, setNumDisks] = useState(3);
  const [towers, setTowers] = useState<number[][]>([[], [], []]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [showManual, setShowManual] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  
  // Selection State (Click based)
  const [selectedTowerIdx, setSelectedTowerIdx] = useState<number | null>(null);
  
  // Feedback State
  const [shakeDiskId, setShakeDiskId] = useState<number | null>(null);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, [numDisks]);

  const startNewGame = () => {
    const initialTower = Array.from({ length: numDisks }, (_, i) => numDisks - i);
    setTowers([initialTower, [], []]);
    setMoves(0);
    setIsSolved(false);
    setStartTime(null);
    setEndTime(null);
    setSelectedTowerIdx(null);
  };

  const handleManualStart = () => {
    setShowManual(false);
    startNewGame();
    setStartTime(Date.now());
  };

  // --- Click Logic ---

  const handleTowerClick = (towerIdx: number) => {
    if (isSolved || showManual) return;

    // Case 1: No tower selected yet
    if (selectedTowerIdx === null) {
      // If the clicked tower is empty, ignore
      if (towers[towerIdx].length === 0) return;
      
      // Select this tower
      setSelectedTowerIdx(towerIdx);
      
      // Start timer on first interaction
      if (!startTime) setStartTime(Date.now());
      return;
    }

    // Case 2: A tower is already selected
    // If clicked the same tower, deselect (cancel)
    if (selectedTowerIdx === towerIdx) {
      setSelectedTowerIdx(null);
      return;
    }

    // Attempt to move from selectedTowerIdx to towerIdx
    const sourceTower = towers[selectedTowerIdx];
    const targetTower = towers[towerIdx];
    
    const diskToMove = sourceTower[sourceTower.length - 1]; // Top disk of source
    const targetTopDisk = targetTower.length > 0 ? targetTower[targetTower.length - 1] : Infinity;

    // Rule Check: Can we place diskToMove on targetTopDisk?
    if (diskToMove < targetTopDisk) {
      executeMove(selectedTowerIdx, towerIdx, diskToMove);
      setSelectedTowerIdx(null); // Move complete, deselect
    } else {
      // Invalid Move
      triggerShake(diskToMove);
      setSelectedTowerIdx(null); // Deselect on error to reset
    }
  };

  const executeMove = (fromIdx: number, toIdx: number, diskVal: number) => {
    const newTowers = towers.map(t => [...t]);
    
    // Remove from source
    newTowers[fromIdx].pop();
    // Add to target
    newTowers[toIdx].push(diskVal);

    setTowers(newTowers);
    setMoves(prev => prev + 1);

    // Check Win
    if (newTowers[2].length === numDisks) {
      setIsSolved(true);
      setEndTime(Date.now());
    }
  };

  const triggerShake = (diskVal: number) => {
    setShakeDiskId(diskVal);
    setTimeout(() => setShakeDiskId(null), 500); // Reset after animation
  };

  const formatTime = () => {
    if (!startTime || !endTime) return "0.0초";
    return ((endTime - startTime) / 1000).toFixed(1) + "초";
  };

  // --- Render Helpers ---

  const renderDisk = (val: number, isSelected: boolean = false) => {
    const widthPercent = 30 + (70 * (val / numDisks));
    const isShaking = shakeDiskId === val;

    return (
      <div
        key={val}
        className={`h-8 rounded-full flex items-center justify-center text-white font-bold text-xs select-none backdrop-blur-sm border border-white/30 transition-all duration-300 ease-out
          ${DISK_COLORS[(val - 1) % DISK_COLORS.length]}
          ${isSelected ? 'transform -translate-y-4 shadow-[0_0_20px_rgba(255,255,255,0.6)] z-20 scale-105 ring-2 ring-white' : 'opacity-90'}
          ${isShaking ? 'animate-[shake_0.4s_ease-in-out] bg-red-500' : ''}
        `}
        style={{ width: `${widthPercent}%` }}
      >
        <span className="drop-shadow-md tracking-wider">DATA {val}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-slate-900 relative text-slate-200 overflow-hidden select-none">
       
       {/* Global Style for Shake Animation */}
       <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) translateY(-16px); } /* Keep raised if selected */
          25% { transform: translateX(-5px) translateY(-16px); }
          50% { transform: translateX(5px) translateY(-16px); }
          75% { transform: translateX(-5px) translateY(-16px); }
        }
       `}</style>

       {/* Background Grid/Effect */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}>
       </div>

       {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800 px-4 py-2 rounded-full font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
        >
          🔙 나가기
        </button>
      </div>

      <div className="max-w-5xl w-full bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden relative border border-slate-700 flex flex-col" style={{ minHeight: '650px' }}>
        
        {/* Game Title Bar */}
        <div className="bg-slate-950/80 p-5 border-b border-slate-700 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <span className="text-3xl animate-pulse">🛡️</span>
             <div>
               <h2 className="text-xl font-bold text-cyan-400 tracking-wider">SERVER MIGRATION PROTOCOL</h2>
               <p className="text-xs text-slate-500 font-mono">Hanoi Algorithm v2.0</p>
             </div>
           </div>
           <div className="flex gap-4 text-sm font-mono">
             <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-slate-400">
               MOVES: <span className="text-cyan-400 font-bold text-lg">{moves}</span>
             </div>
             <div className="bg-slate-900 border border-slate-700 px-4 py-2 rounded text-slate-400">
               MINIMUM: <span className="text-pink-500 font-bold text-lg">{Math.pow(2, numDisks) - 1}</span>
             </div>
           </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-8">
           
           {/* Controls */}
           <div className="absolute top-4 right-4 flex gap-4 z-10">
              <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-xs font-bold text-slate-400">DIFFICULTY</span>
                <select 
                  value={numDisks}
                  onChange={(e) => setNumDisks(Number(e.target.value))}
                  disabled={moves > 0 && !isSolved}
                  className="bg-slate-800 border border-slate-600 rounded text-sm px-2 py-1 font-bold text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  {[3, 4, 5].map(n => <option key={n} value={n}>LEVEL {n - 2} ({n} Disks)</option>)}
                </select>
              </div>
              <button 
                onClick={startNewGame} 
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold text-white border border-slate-600 transition-colors"
              >
                RESTART
              </button>
           </div>

           {/* Towers Container */}
           <div className="flex items-end justify-center gap-4 md:gap-12 w-full max-w-4xl h-[400px] mt-10">
              {[0, 1, 2].map((towerIdx) => {
                 // Check if this tower is currently selected
                 const isSelectedTower = selectedTowerIdx === towerIdx;
                 
                 return (
                  <div 
                    key={towerIdx}
                    onClick={() => handleTowerClick(towerIdx)}
                    className={`relative flex-1 h-full flex flex-col-reverse items-center justify-start group cursor-pointer transition-all duration-200 rounded-2xl
                      ${isSelectedTower ? 'bg-white/10 ring-2 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'hover:bg-white/5'}
                    `}
                  >
                    {/* Selection Indicator (Arrow) */}
                    {isSelectedTower && (
                      <div className="absolute -top-12 text-3xl text-cyan-400 animate-bounce">
                        ▼
                      </div>
                    )}

                    {/* Base Label */}
                    <div className="absolute -bottom-12 text-center w-full">
                      <div className={`font-mono font-bold text-sm mb-1 tracking-widest transition-colors ${isSelectedTower ? 'text-cyan-300' : 'text-slate-500'}`}>
                        SERVER {['ALPHA', 'BETA', 'GAMMA'][towerIdx]}
                      </div>
                      <div className="h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden">
                        <div className={`h-full bg-cyan-500/50 w-1/2 animate-[pulse_2s_infinite] ${isSelectedTower ? 'bg-cyan-400' : ''}`}></div>
                      </div>
                    </div>

                    {/* The Server Rack (Pillar) */}
                    <div className="absolute bottom-0 w-24 h-[320px] bg-slate-800 border-x border-slate-600 z-0 flex flex-col justify-between py-2 opacity-80 pointer-events-none">
                        {/* Server Lights Detail */}
                        {Array.from({length: 8}).map((_, i) => (
                          <div key={i} className="flex justify-between px-2">
                            <div className="w-1 h-1 rounded-full bg-green-500/50"></div>
                            <div className="w-1 h-1 rounded-full bg-red-500/50"></div>
                          </div>
                        ))}
                    </div>
                    
                    {/* Base Plate */}
                    <div className="absolute bottom-0 w-full h-6 bg-slate-700 border-t border-slate-600 rounded-md z-0 shadow-lg pointer-events-none"></div>

                    {/* Disks in Tower */}
                    <div className="flex flex-col-reverse items-center w-full z-10 mb-6 gap-1.5 px-4 pointer-events-none">
                      {towers[towerIdx].map((diskVal, idx) => {
                        const isTop = idx === towers[towerIdx].length - 1;
                        // If this is the selected tower, the top disk is "selected"
                        const isSelected = isTop && isSelectedTower;
                        
                        return (
                          <div 
                            key={diskVal}
                            className="w-full flex justify-center"
                          >
                            {renderDisk(diskVal, isSelected)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                 );
              })}
           </div>
           
           {/* Instruction Hint */}
           <div className="absolute bottom-2 text-slate-500 text-xs font-mono animate-pulse">
              {selectedTowerIdx === null ? ">> 옮길 데이터(원판)가 있는 서버를 클릭하세요." : ">> 이동할 목적지 서버를 클릭하세요."}
           </div>
        </div>

        {/* Manual (Start Screen) */}
        {showManual && (
           <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-slate-700">
                🛡️
              </div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">DATA MIGRATION</h2>
              <p className="text-cyan-400 mb-10 font-mono">Secure Server Transfer Protocol</p>
              
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg text-left space-y-6 mb-10 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500"></div>
                 
                 <div className="space-y-4 text-slate-300">
                    <p className="flex gap-3">
                       <span className="text-cyan-400 font-bold">01.</span>
                       <span>원하는 기둥을 <strong>클릭</strong>하여 데이터를 선택하세요.</span>
                    </p>
                    <p className="flex gap-3">
                       <span className="text-cyan-400 font-bold">02.</span>
                       <span>이동할 기둥을 <strong>다시 클릭</strong>하여 옮기세요.</span>
                    </p>
                    <p className="flex gap-3">
                       <span className="text-cyan-400 font-bold">03.</span>
                       <span>작은 데이터 위에 큰 데이터를 올릴 수 없습니다.</span>
                    </p>
                 </div>
              </div>

              <button 
                onClick={handleManualStart}
                className="group relative px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full overflow-hidden transition-all active:scale-95"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative text-lg tracking-widest">START OPERATION</span>
              </button>
           </div>
        )}

        {/* Victory Screen */}
        {isSolved && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-500">
             <div className="bg-slate-800 p-10 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.3)] text-center border border-green-500/30 max-w-lg w-full transform scale-100">
                <div className="text-7xl mb-6 animate-bounce">✅</div>
                <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">MISSION COMPLETE</h3>
                <p className="text-green-400 font-mono mb-8">System Secured Successfully.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                      <div className="text-slate-500 text-xs font-bold mb-1">TOTAL MOVES</div>
                      <div className="text-3xl font-bold text-white">{moves}</div>
                   </div>
                   <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                      <div className="text-slate-500 text-xs font-bold mb-1">TIME ELAPSED</div>
                      <div className="text-3xl font-bold text-white">{formatTime()}</div>
                   </div>
                </div>

                <div className="flex gap-4 justify-center">
                   <button 
                     onClick={startNewGame}
                     className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-full font-bold transition-colors"
                   >
                     REPLAY
                   </button>
                   {numDisks < 5 && (
                     <button 
                       onClick={() => { setNumDisks(n => n + 1); }}
                       className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:shadow-green-500/50"
                     >
                       NEXT LEVEL ➔
                     </button>
                   )}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HanoiGameTab;