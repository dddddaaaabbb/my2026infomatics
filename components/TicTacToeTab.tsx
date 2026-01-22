import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Props {
  onBack: () => void;
}

type Player = 'O' | 'X' | null;

const TicTacToeTab: React.FC<Props> = ({ onBack }) => {
  // Settings State
  const [gridSize, setGridSize] = useState<3 | 4 | 5>(3);
  const [starter, setStarter] = useState<'USER' | 'AI'>('USER');

  // Game State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WIN' | 'LOSE' | 'DRAW'>('PLAYING');
  const [showManual, setShowManual] = useState(true);
  const [winLine, setWinLine] = useState<number[]>([]);

  // Calculate Win Lines dynamically based on grid size
  const winLines = useMemo(() => {
    const lines: number[][] = [];
    const n = gridSize;

    // Rows
    for (let r = 0; r < n; r++) {
      const row = [];
      for (let c = 0; c < n; c++) row.push(r * n + c);
      lines.push(row);
    }
    // Cols
    for (let c = 0; c < n; c++) {
      const col = [];
      for (let r = 0; r < n; r++) col.push(r * n + c);
      lines.push(col);
    }
    // Diagonals
    const d1 = [], d2 = [];
    for (let i = 0; i < n; i++) {
      d1.push(i * n + i);
      d2.push(i * n + (n - 1 - i));
    }
    lines.push(d1, d2);

    return lines;
  }, [gridSize]);

  // Computer AI Turn
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'PLAYING') {
      const timer = setTimeout(() => {
        makeComputerMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board]);

  const makeComputerMove = () => {
    let move = -1;
    const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];

    if (available.length === 0) return;

    // AI Logic generalized for N x N
    // 1. Try to Win (Find a line with N-1 of my marks and 1 empty)
    move = findBestMove('X');
    
    // 2. Block Player (Find a line with N-1 of player marks and 1 empty)
    if (move === -1) {
      move = findBestMove('O');
    }

    // 3. Take Center (if available and size is odd)
    const center = Math.floor((gridSize * gridSize) / 2);
    if (move === -1 && gridSize % 2 !== 0 && board[center] === null) {
      move = center;
    }

    // 4. Random
    if (move === -1) {
      move = available[Math.floor(Math.random() * available.length)];
    }

    handleMove(move, 'X');
  };

  const findBestMove = (player: 'O' | 'X') => {
    for (const line of winLines) {
      const values = line.map(idx => board[idx]);
      const count = values.filter(v => v === player).length;
      const empty = values.filter(v => v === null).length;
      
      // If we have N-1 marks and 1 empty slot, take it!
      if (count === gridSize - 1 && empty === 1) {
        const emptyIndex = line.find(idx => board[idx] === null);
        if (emptyIndex !== undefined) return emptyIndex;
      }
    }
    return -1;
  };

  const handleMove = (index: number, player: 'O' | 'X') => {
    if (board[index] !== null || gameStatus !== 'PLAYING') return;

    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    // Check Win
    if (checkWin(newBoard, player)) {
      setGameStatus(player === 'O' ? 'WIN' : 'LOSE');
      return;
    }

    // Check Draw
    if (!newBoard.includes(null)) {
      setGameStatus('DRAW');
      return;
    }

    setIsPlayerTurn(player === 'X');
  };

  const checkWin = (currentBoard: Player[], player: 'O' | 'X') => {
    for (const line of winLines) {
      if (line.every(idx => currentBoard[idx] === player)) {
        setWinLine(line);
        return true;
      }
    }
    return false;
  };

  const resetGame = () => {
    // Reset to setup screen
    setShowManual(true);
    setGameStatus('PLAYING');
    setWinLine([]);
  };

  const startGame = () => {
    setBoard(Array(gridSize * gridSize).fill(null));
    setIsPlayerTurn(starter === 'USER');
    setGameStatus('PLAYING');
    setWinLine([]);
    setShowManual(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-orange-50 relative">
      
      {/* Header */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={onBack}
          className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full font-bold shadow-md backdrop-blur-sm transition-all"
        >
          🔙 나가기
        </button>
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden relative border-4 border-orange-200" style={{ minHeight: '600px' }}>
        
        {/* Game Title */}
        <div className="bg-orange-400 p-4 text-center">
          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            ⭕ 틱택토 대결 ❌
          </h2>
        </div>

        {/* Game Board Area */}
        <div className="p-6 flex flex-col items-center justify-center h-full gap-6">
           
           <div className="flex justify-between w-full px-8 mb-2">
             <div className={`flex flex-col items-center ${isPlayerTurn && gameStatus === 'PLAYING' ? 'scale-110 opacity-100' : 'opacity-50'} transition-all`}>
               <span className="text-4xl">🧑‍🎓</span>
               <span className="font-bold text-orange-600">나 (O)</span>
             </div>
             <div className="font-black text-3xl text-gray-300 self-center">VS</div>
             <div className={`flex flex-col items-center ${!isPlayerTurn && gameStatus === 'PLAYING' ? 'scale-110 opacity-100' : 'opacity-50'} transition-all`}>
               <span className="text-4xl">🤖</span>
               <span className="font-bold text-gray-600">AI (X)</span>
             </div>
           </div>

           <div 
             className="grid gap-2 bg-gray-200 p-3 rounded-xl shadow-inner transition-all"
             style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: gridSize === 5 ? '340px' : '300px' 
             }}
           >
              {board.map((cell, idx) => (
                <button
                  key={idx}
                  onClick={() => isPlayerTurn && handleMove(idx, 'O')}
                  disabled={cell !== null || !isPlayerTurn || gameStatus !== 'PLAYING'}
                  className={`aspect-square bg-white rounded-lg flex items-center justify-center shadow-sm transition-all
                    ${gridSize === 5 ? 'text-2xl' : gridSize === 4 ? 'text-3xl' : 'text-4xl'} font-black
                    ${winLine.includes(idx) ? 'bg-yellow-100 animate-pulse ring-4 ring-yellow-400 z-10' : 'hover:bg-gray-50'}
                    ${cell === 'O' ? 'text-orange-500' : 'text-indigo-500'}
                  `}
                >
                  {cell}
                </button>
              ))}
           </div>

           {/* Status Message */}
           <div className="text-center h-8">
              {gameStatus === 'PLAYING' ? (
                <div className="text-gray-500 font-bold animate-pulse">
                  {isPlayerTurn ? "당신의 차례입니다!" : "AI가 생각 중..."}
                </div>
              ) : (
                <div className="font-black text-xl animate-bounce">
                   {gameStatus === 'WIN' && <span className="text-orange-500">🎉 승리했습니다!</span>}
                   {gameStatus === 'LOSE' && <span className="text-indigo-500">😭 패배했습니다...</span>}
                   {gameStatus === 'DRAW' && <span className="text-gray-500">🤝 무승부입니다!</span>}
                </div>
              )}
           </div>

           {gameStatus !== 'PLAYING' && (
             <button 
               onClick={resetGame}
               className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all"
             >
               새로운 설정하기
             </button>
           )}
        </div>

        {/* Setup Overlay */}
        {showManual && (
           <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-orange-100 p-4 rounded-full mb-4 text-5xl">⚙️</div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">게임 설정</h2>
              <p className="text-gray-500 mb-8 font-medium">원하는 난이도와 순서를 선택하세요</p>
              
              <div className="w-full max-w-sm space-y-6 mb-8">
                 {/* 1. Grid Size */}
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 text-left">격자 크기 (승리 조건)</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[3, 4, 5].map(size => (
                          <button
                             key={size}
                             onClick={() => setGridSize(size as 3|4|5)}
                             className={`py-3 rounded-xl font-bold border-2 transition-all ${
                                gridSize === size 
                                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                                : 'border-gray-200 text-gray-400 hover:border-orange-300'
                             }`}
                          >
                             {size}x{size}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* 2. Starter */}
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 text-left">시작 순서</label>
                    <div className="grid grid-cols-2 gap-2">
                          <button
                             onClick={() => setStarter('USER')}
                             className={`py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                starter === 'USER' 
                                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                                : 'border-gray-200 text-gray-400 hover:border-orange-300'
                             }`}
                          >
                             <span>🧑‍🎓</span> 나 먼저
                          </button>
                          <button
                             onClick={() => setStarter('AI')}
                             className={`py-3 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                starter === 'AI' 
                                ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' 
                                : 'border-gray-200 text-gray-400 hover:border-orange-300'
                             }`}
                          >
                             <span>🤖</span> AI 먼저
                          </button>
                    </div>
                 </div>
              </div>

              <button 
                onClick={startGame}
                className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                게임 시작
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToeTab;