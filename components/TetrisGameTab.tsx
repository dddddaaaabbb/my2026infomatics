import React, { useState, useEffect, useRef } from 'react';

// --- Types & Constants ---
const ROWS = 20;
const COLS = 10;
const STORAGE_KEY = 'tetris_best_time';

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type CellValue = TetrominoType | null;
type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

interface Tetromino {
  shape: number[][];
  color: string;
  type: TetrominoType;
}

// NxN matrices for proper rotation (SRS-like centering)
const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: { 
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ], 
    color: 'bg-cyan-300', 
    type: 'I' 
  },
  O: { 
    shape: [
      [1, 1],
      [1, 1]
    ], 
    color: 'bg-yellow-300', 
    type: 'O' 
  },
  T: { 
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ], 
    color: 'bg-purple-300', 
    type: 'T' 
  },
  S: { 
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ], 
    color: 'bg-green-300', 
    type: 'S' 
  },
  Z: { 
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ], 
    color: 'bg-red-300', 
    type: 'Z' 
  },
  J: { 
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ], 
    color: 'bg-blue-300', 
    type: 'J' 
  },
  L: { 
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ], 
    color: 'bg-orange-300', 
    type: 'L' 
  },
};

const RANDOM_TETROMINOES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// --- Helper Functions ---
const createEmptyGrid = (): CellValue[][] => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const getRandomTetromino = (): Tetromino => {
  const rand = RANDOM_TETROMINOES[Math.floor(Math.random() * RANDOM_TETROMINOES.length)];
  return TETROMINOES[rand];
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface Props {
  onBack?: () => void;
}

// --- Component ---
const TetrisGameTab: React.FC<Props> = ({ onBack }) => {
  // Game State
  const [grid, setGrid] = useState<CellValue[][]>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<{
    pos: { x: number; y: number };
    tetromino: Tetromino;
  } | null>(null);
  
  const [nextPiece, setNextPiece] = useState<Tetromino>(getRandomTetromino());
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  
  // Refs
  const gridRef = useRef(grid);
  const activePieceRef = useRef(activePiece);
  const nextPieceRef = useRef(nextPiece);
  const gameStateRef = useRef(gameState);
  
  const gameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync Refs
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { activePieceRef.current = activePiece; }, [activePiece]);
  useEffect(() => { nextPieceRef.current = nextPiece; }, [nextPiece]); 
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Init Best Time
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBestTime(parseInt(saved, 10));
  }, []);

  // --- Game Logic ---

  const checkCollision = (piece: Tetromino, pos: { x: number; y: number }, gridToCheck: CellValue[][]) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newY = pos.y + y;
          const newX = pos.x + x;
          
          if (
            newX < 0 || 
            newX >= COLS || 
            newY >= ROWS ||
            (newY >= 0 && gridToCheck[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const spawnPiece = () => {
    const piece = nextPieceRef.current; 
    const newNext = getRandomTetromino();
    
    setNextPiece(newNext);
    nextPieceRef.current = newNext;

    const startPos = { x: Math.floor(COLS / 2) - Math.ceil(piece.shape[0].length / 2), y: 0 };

    if (checkCollision(piece, startPos, gridRef.current)) {
      handleGameOver();
    } else {
      setActivePiece({ pos: startPos, tetromino: piece });
    }
  };

  const lockPiece = () => {
    const { pos, tetromino } = activePieceRef.current!;
    const newGrid = gridRef.current.map(row => [...row]);

    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          if (pos.y + y >= 0) {
            newGrid[pos.y + y][pos.x + x] = tetromino.type;
          }
        }
      });
    });

    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newGrid[y].every(cell => cell !== null)) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(COLS).fill(null));
        linesCleared++;
        y++; 
      }
    }

    if (linesCleared > 0) {
      setScore(prev => prev + (linesCleared * 100));
    }

    setGrid(newGrid);
    setActivePiece(null);
    spawnPiece();
  };

  const move = (dirX: number, dirY: number) => {
    if (!activePieceRef.current || gameStateRef.current !== 'playing') return;

    const { pos, tetromino } = activePieceRef.current;
    const newPos = { x: pos.x + dirX, y: pos.y + dirY };

    if (!checkCollision(tetromino, newPos, gridRef.current)) {
      setActivePiece({ pos: newPos, tetromino });
    } else {
      if (dirY > 0) {
        lockPiece();
      }
    }
  };

  const rotate = () => {
    if (!activePieceRef.current || gameStateRef.current !== 'playing') return;
    const { pos, tetromino } = activePieceRef.current;

    const rotatedShape = tetromino.shape[0].map((_, index) =>
      tetromino.shape.map(row => row[index]).reverse()
    );

    const rotatedPiece = { ...tetromino, shape: rotatedShape };

    if (!checkCollision(rotatedPiece, pos, gridRef.current)) {
      setActivePiece({ pos, tetromino: rotatedPiece });
    } else if (!checkCollision(rotatedPiece, { ...pos, x: pos.x - 1 }, gridRef.current)) {
      setActivePiece({ pos: { ...pos, x: pos.x - 1 }, tetromino: rotatedPiece });
    } else if (!checkCollision(rotatedPiece, { ...pos, x: pos.x + 1 }, gridRef.current)) {
      setActivePiece({ pos: { ...pos, x: pos.x + 1 }, tetromino: rotatedPiece });
    }
  };

  const drop = () => {
    if (!activePieceRef.current || gameStateRef.current !== 'playing') return;
    const { pos, tetromino } = activePieceRef.current;
    let newY = pos.y;
    while (!checkCollision(tetromino, { x: pos.x, y: newY + 1 }, gridRef.current)) {
      newY++;
    }
    
    const finalGrid = gridRef.current.map(r => [...r]);
    tetromino.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0 && newY + y >= 0) {
          finalGrid[newY + y][pos.x + x] = tetromino.type;
        }
      });
    });
    
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (finalGrid[y].every(cell => cell !== null)) {
        finalGrid.splice(y, 1);
        finalGrid.unshift(Array(COLS).fill(null));
        linesCleared++;
        y++;
      }
    }
    if (linesCleared > 0) setScore(prev => prev + (linesCleared * 100));
    
    setGrid(finalGrid);
    setActivePiece(null);
    spawnPiece();
  };

  const handleGameOver = () => {
    setGameState('gameover');
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setBestTime(prev => {
      if (gameTime > prev) {
        localStorage.setItem(STORAGE_KEY, gameTime.toString());
        return gameTime;
      }
      return prev;
    });
  };

  const startGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setGameTime(0);
    setGameState('playing');
    
    const firstPiece = getRandomTetromino();
    const secondPiece = getRandomTetromino();
    
    setNextPiece(secondPiece);
    nextPieceRef.current = secondPiece;

    const startX = Math.floor(COLS / 2) - Math.ceil(firstPiece.shape[0].length / 2);
    setActivePiece({
      pos: { x: startX, y: 0 },
      tetromino: firstPiece
    });

    setTimeout(() => containerRef.current?.focus(), 100);
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      setTimeout(() => containerRef.current?.focus(), 100);
    }
  };

  const stopGame = () => {
    setGameState('idle');
    setGrid(createEmptyGrid());
    setActivePiece(null);
    setScore(0);
    setGameTime(0);
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      gameIntervalRef.current = window.setInterval(() => {
        move(0, 1);
      }, 800);

      timerIntervalRef.current = window.setInterval(() => {
        setGameTime(t => t + 1);
      }, 1000);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp'].includes(e.key)) {
        e.preventDefault();
      }

      switch(e.key) {
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowUp': rotate(); break;
        case 'PageUp': rotate(); break;
        case ' ': drop(); break;
        case 'p': togglePause(); break;
        case 'P': togglePause(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]); 

  const renderGrid = () => {
    const displayGrid = grid.map(row => [...row]);
    if (activePiece && gameState !== 'idle') {
      const { pos, tetromino } = activePiece;
      tetromino.shape.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val !== 0) {
            const dy = pos.y + y;
            const dx = pos.x + x;
            if (dy >= 0 && dy < ROWS && dx >= 0 && dx < COLS) {
              displayGrid[dy][dx] = tetromino.type;
            }
          }
        });
      });
    }
    return displayGrid;
  };

  const currentGrid = renderGrid();

  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-4 bg-indigo-50/50 focus:outline-none"
      ref={containerRef}
      tabIndex={0}
    >
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8 items-start justify-center">
        
        {/* Game Board */}
        <div className="relative bg-white p-2 rounded-2xl border-4 border-indigo-200 shadow-xl self-center">
          <div className="grid grid-cols-10 bg-indigo-50/50 rounded-lg overflow-hidden border border-indigo-100">
            {currentGrid.map((row, y) => (
              row.map((cell, x) => (
                <div 
                  key={`${y}-${x}`} 
                  className={`w-6 h-6 md:w-8 md:h-8 border border-white/20 
                    ${cell ? TETROMINOES[cell].color : 'bg-transparent'} 
                    ${cell ? 'rounded-sm shadow-inner' : ''}`}
                />
              ))
            ))}
          </div>

          {/* Overlays */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20 animate-in fade-in duration-300">
              <div className="text-4xl font-black text-indigo-500 mb-2">GAME OVER</div>
              <div className="text-gray-600 font-bold mb-6">
                기록: {formatTime(gameTime)}
              </div>
              <button 
                onClick={startGame}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all"
              >
                다시 하기 🔄
              </button>
            </div>
          )}

          {gameState === 'idle' && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
               <div className="text-6xl mb-4 animate-bounce">🧩</div>
               <button 
                onClick={startGame}
                className="bg-pink-400 hover:bg-pink-500 text-white px-8 py-4 text-xl rounded-full font-bold shadow-lg active:scale-95 transition-all"
              >
                게임 시작
              </button>
             </div>
          )}

          {gameState === 'paused' && (
             <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
               <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
                 <div className="text-2xl font-black text-gray-700 mb-4">일시정지</div>
                 <button 
                  onClick={togglePause}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-md active:scale-95 transition-all"
                >
                  계속 하기 ▶
                </button>
               </div>
             </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 w-full max-w-xs">
           
           {/* Control Buttons */}
           <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1"
              >
                <span className="text-xs">RESTART</span>
                <span>🔄</span>
              </button>
              <button 
                onClick={togglePause}
                disabled={gameState === 'idle' || gameState === 'gameover'}
                className={`text-white py-3 rounded-xl font-bold shadow-md active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1
                  ${gameState === 'paused' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-400 hover:bg-yellow-500'}`}
              >
                <span className="text-xs">{gameState === 'paused' ? 'RESUME' : 'PAUSE'}</span>
                <span>{gameState === 'paused' ? '▶' : '⏸'}</span>
              </button>
              <button 
                onClick={stopGame}
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-md active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1"
              >
                <span className="text-xs">STOP</span>
                <span>⏹</span>
              </button>
           </div>

           {/* Next Piece */}
           <div className="bg-white p-4 rounded-2xl border-2 border-indigo-100 shadow-md flex flex-col items-center min-h-[120px] justify-center">
             <div className="text-sm font-bold text-gray-400 mb-2">NEXT</div>
             {gameState !== 'idle' && (
                <div className="grid gap-0.5 transition-all duration-300" style={{ 
                  gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)` 
                }}>
                  {nextPiece.shape.map((row, y) => (
                    row.map((cell, x) => (
                      cell !== 0 ? (
                        <div key={`${y}-${x}`} className={`w-4 h-4 md:w-5 md:h-5 rounded-sm ${nextPiece.color}`} />
                      ) : <div key={`${y}-${x}`} className="w-4 h-4 md:w-5 md:h-5" />
                    ))
                  ))}
                </div>
             )}
           </div>

           {/* Stats */}
           <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-bold">점수</span>
                <span className="text-2xl font-black text-indigo-600">{score}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-bold">시간</span>
                <span className="text-xl font-mono font-bold text-pink-500">{formatTime(gameTime)}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TetrisGameTab;