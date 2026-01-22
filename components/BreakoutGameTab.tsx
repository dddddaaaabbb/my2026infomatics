import React, { useRef, useEffect, useState } from 'react';

interface Props {
  onBack: () => void;
}

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH_DEFAULT = 120;
const PADDLE_WIDTH_SHRUNK = 60;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 6;
const BRICK_COLUMN_COUNT = 8;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;
const BRICK_HEIGHT = 25;
const BRICK_WIDTH = (CANVAS_WIDTH - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;

// Physics
const BASE_SPEED = 5;
const SPEED_MULTIPLIER = 1.4;
const PADDLE_SPEED = 8; // Keyboard movement speed

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Brick {
  x: number;
  y: number;
  status: number; // 1 = active, 0 = destroyed
  color: string;
  type: 'VIRUS' | 'RANSOMWARE' | 'SPYWARE';
  hasItem: boolean;
}

interface Item {
  id: number;
  x: number;
  y: number;
  dy: number;
  type: 'FAKE_VACCINE';
  active: boolean;
}

const BreakoutGameTab: React.FC<Props> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs (for Loop)
  const paddleRef = useRef({ x: (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2, width: PADDLE_WIDTH_DEFAULT });
  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: BASE_SPEED, dy: -BASE_SPEED });
  const bricksRef = useRef<Brick[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const isSpeedUpRef = useRef(false);
  const totalBricksRef = useRef(0);
  const destroyedCountRef = useRef(0);
  const paddleTimerRef = useRef<number | null>(null);

  // Keyboard State Refs
  const rightPressedRef = useRef(false);
  const leftPressedRef = useRef(false);

  // UI State
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('MENU');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Keyboard Event Listeners
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressedRef.current = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressedRef.current = true;
      }
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressedRef.current = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressedRef.current = false;
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      cancelAnimationFrame(requestRef.current);
      if (paddleTimerRef.current) clearTimeout(paddleTimerRef.current);
    };
  }, []);

  const initBricks = () => {
    const newBricks: Brick[] = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];
    
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
        const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
        
        // Randomly assign item drop (20% chance)
        const hasItem = Math.random() < 0.2;

        newBricks.push({
          x: brickX,
          y: brickY,
          status: 1,
          color: colors[r % colors.length],
          type: 'VIRUS', // Placeholder for now
          hasItem
        });
      }
    }
    bricksRef.current = newBricks;
    totalBricksRef.current = newBricks.length;
    destroyedCountRef.current = 0;
  };

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setLives(3);
    scoreRef.current = 0;
    livesRef.current = 3;
    isSpeedUpRef.current = false;
    
    paddleRef.current = { x: (CANVAS_WIDTH - PADDLE_WIDTH_DEFAULT) / 2, width: PADDLE_WIDTH_DEFAULT };
    resetBall();
    initBricks();
    itemsRef.current = [];
    
    // Reset keys
    rightPressedRef.current = false;
    leftPressedRef.current = false;

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const resetBall = () => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      dx: (Math.random() > 0.5 ? 1 : -1) * BASE_SPEED,
      dy: -BASE_SPEED
    };
    paddleRef.current.x = (CANVAS_WIDTH - paddleRef.current.width) / 2;
  };

  const shrinkPaddle = () => {
    // If already shrunk, reset timer
    if (paddleTimerRef.current) clearTimeout(paddleTimerRef.current);
    
    paddleRef.current.width = PADDLE_WIDTH_SHRUNK;
    
    // Restore after 5 seconds
    paddleTimerRef.current = window.setTimeout(() => {
      paddleRef.current.width = PADDLE_WIDTH_DEFAULT;
      paddleTimerRef.current = null;
    }, 5000);
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Logic ---
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // 0. Paddle Movement (Keyboard)
    if (rightPressedRef.current) {
      paddle.x += PADDLE_SPEED;
      if (paddle.x + paddle.width > CANVAS_WIDTH) {
        paddle.x = CANVAS_WIDTH - paddle.width;
      }
    } else if (leftPressedRef.current) {
      paddle.x -= PADDLE_SPEED;
      if (paddle.x < 0) {
        paddle.x = 0;
      }
    }

    // 1. Ball Movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 2. Wall Collision
    if (ball.x + ball.dx > CANVAS_WIDTH - BALL_RADIUS || ball.x + ball.dx < BALL_RADIUS) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < BALL_RADIUS) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > CANVAS_HEIGHT - BALL_RADIUS) {
      // Paddle Collision?
      if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        // Calculate angle based on hit position
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);
        
        let angle = collidePoint * (Math.PI / 3); // Max 60 degrees
        
        const speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -speed * Math.cos(angle);
      } else {
        // Game Over / Life Lost
        livesRef.current--;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          setGameState('GAMEOVER');
          setMessage('보안 실패! 시스템이 감염되었습니다.');
          return; // Stop loop
        } else {
          resetBall();
        }
      }
    }

    // 3. Brick Collision
    let activeBricksCount = 0;
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
        activeBricksCount++;
        if (
          ball.x > brick.x && 
          ball.x < brick.x + BRICK_WIDTH && 
          ball.y > brick.y && 
          ball.y < brick.y + BRICK_HEIGHT
        ) {
          ball.dy = -ball.dy;
          brick.status = 0;
          scoreRef.current += 10;
          setScore(scoreRef.current);
          destroyedCountRef.current++;

          // Item Drop
          if (brick.hasItem) {
            itemsRef.current.push({
              id: Date.now() + Math.random(),
              x: brick.x + BRICK_WIDTH / 2,
              y: brick.y + BRICK_HEIGHT,
              dy: 3,
              type: 'FAKE_VACCINE',
              active: true
            });
          }

          // Difficulty Check
          if (!isSpeedUpRef.current && destroyedCountRef.current > totalBricksRef.current / 2) {
             isSpeedUpRef.current = true;
             // Increase speed magnitude
             const currentSpeed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
             const newSpeed = currentSpeed * SPEED_MULTIPLIER;
             // Preserve direction
             const angle = Math.atan2(ball.dy, ball.dx);
             ball.dx = newSpeed * Math.cos(angle);
             ball.dy = newSpeed * Math.sin(angle);
          }
        }
      }
    });

    if (activeBricksCount === 0) {
      setGameState('VICTORY');
      setMessage('시스템 보안 완료! 당신은 훌륭한 가디언입니다.');
      return;
    }

    // 4. Item Logic
    itemsRef.current.forEach(item => {
      if (item.active) {
        item.y += item.dy;
        // Check collision with paddle
        if (
          item.y + 10 >= CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
          item.y - 10 <= CANVAS_HEIGHT &&
          item.x >= paddle.x &&
          item.x <= paddle.x + paddle.width
        ) {
          item.active = false;
          // Trigger Effect
          if (item.type === 'FAKE_VACCINE') {
            shrinkPaddle();
          }
        }
        // Remove if off screen
        if (item.y > CANVAS_HEIGHT) item.active = false;
      }
    });

    // --- Render ---

    // Draw Paddle (Firewall)
    ctx.beginPath();
    ctx.rect(paddle.x, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, paddle.width, PADDLE_HEIGHT);
    ctx.fillStyle = '#06b6d4'; // Cyan
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
    // Paddle Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    
    // Draw Ball (Vaccine)
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e'; // Neon Green
    ctx.fill();
    ctx.closePath();
    
    ctx.shadowBlur = 0; // Reset shadow for bricks

    // Draw Bricks (Malware)
    bricksRef.current.forEach(brick => {
      if (brick.status === 1) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
        ctx.fillStyle = brick.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        // Add "virus" look details
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.font = '10px Arial';
        ctx.fillText('🦠', brick.x + BRICK_WIDTH/2 - 6, brick.y + BRICK_HEIGHT/2 + 4);
      }
    });

    // Draw Items
    itemsRef.current.forEach(item => {
      if (item.active) {
         ctx.beginPath();
         // Draw Capsule Shape
         ctx.rect(item.x - 6, item.y - 10, 12, 20);
         ctx.fillStyle = '#ef4444'; // Red (Fake)
         ctx.fill();
         ctx.strokeStyle = '#ffffff';
         ctx.stroke();
         ctx.closePath();
         // Text
         ctx.fillStyle = 'white';
         ctx.font = 'bold 10px Arial';
         ctx.fillText('!', item.x - 2, item.y + 4);
      }
    });

    // Paddle Effect Text
    if (paddle.width < PADDLE_WIDTH_DEFAULT) {
       ctx.fillStyle = '#ef4444';
       ctx.font = 'bold 20px Noto Sans KR';
       ctx.fillText('⚠️ 방화벽 손상!', paddle.x, CANVAS_HEIGHT - 40);
    }
    
    // Speed Up Text
    if (isSpeedUpRef.current) {
       ctx.fillStyle = '#eab308';
       ctx.font = 'bold 14px Noto Sans KR';
       ctx.fillText('⚡ 위협 레벨 증가!', 20, 30);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    
    // Scale for responsive canvas if needed (assuming fixed for now or logic handles it)
    // Actually we are using fixed 800x600 coordinate system, so we need scale factor
    const scaleX = CANVAS_WIDTH / rect.width;
    
    let paddleX = (relativeX * scaleX) - paddleRef.current.width / 2;

    // Boundary
    if (paddleX < 0) paddleX = 0;
    if (paddleX + paddleRef.current.width > CANVAS_WIDTH) paddleX = CANVAS_WIDTH - paddleRef.current.width;

    paddleRef.current.x = paddleX;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-80"></div>
        <div className="absolute top-10 left-10 text-cyan-900 text-9xl opacity-10 font-black animate-pulse">0101</div>
        <div className="absolute bottom-10 right-10 text-green-900 text-9xl opacity-10 font-black animate-pulse" style={{animationDelay: '1s'}}>SECURE</div>
      </div>

      {/* Header UI */}
      <div className="absolute top-4 left-4 z-10 flex gap-4 items-center">
         <button 
            onClick={onBack}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full font-bold shadow-lg transition-all border border-slate-500"
          >
            🔙 나가기
          </button>
          <div className="flex gap-6 bg-slate-800/80 px-6 py-2 rounded-full border border-slate-600 backdrop-blur text-white font-mono">
             <div>SCORE: <span className="text-cyan-400 font-bold">{score.toString().padStart(5, '0')}</span></div>
             <div>LIFE: <span className="text-red-400 font-bold">{'♥'.repeat(lives)}</span></div>
          </div>
      </div>

      {/* Game Canvas */}
      <div className="relative z-0 shadow-2xl rounded-lg overflow-hidden border-4 border-slate-700 bg-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          className="cursor-none w-full max-w-[800px] h-auto aspect-[4/3] block"
          style={{ touchAction: 'none' }}
        />
        
        {/* Overlays */}
        {gameState === 'MENU' && (
           <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-5xl font-black text-cyan-400 mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                SECURITY GUARDIANS
              </h1>
              <h2 className="text-2xl font-bold text-white mb-8">바이러스 격퇴 작전</h2>
              
              <div className="grid grid-cols-3 gap-6 mb-10 text-slate-300 text-sm">
                 <div className="flex flex-col items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-3xl mb-2">🧱</div>
                    <div className="font-bold text-white">악성코드 파괴</div>
                    <div>모든 블록을 제거하세요</div>
                 </div>
                 <div className="flex flex-col items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-3xl mb-2">💊</div>
                    <div className="font-bold text-red-400">가짜 백신 주의</div>
                    <div>빨간 아이템은 피하세요!</div>
                 </div>
                 <div className="flex flex-col items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="font-bold text-yellow-400">위협 레벨</div>
                    <div>50% 파괴 시 속도 증가</div>
                 </div>
              </div>

              <button 
                onClick={startGame}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xl px-12 py-4 rounded-full font-black shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] transition-all active:scale-95"
              >
                SYSTEM BOOT_START
              </button>
           </div>
        )}

        {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
           <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300">
              <div className="text-6xl mb-4">
                 {gameState === 'VICTORY' ? '🛡️' : '☠️'}
              </div>
              <h2 className={`text-4xl font-black mb-2 ${gameState === 'VICTORY' ? 'text-green-400' : 'text-red-500'}`}>
                 {gameState === 'VICTORY' ? 'MISSION ACCOMPLISHED' : 'SYSTEM COMPROMISED'}
              </h2>
              <p className="text-xl text-slate-300 mb-8 font-medium">
                {message}
              </p>
              <div className="bg-slate-800 px-8 py-4 rounded-2xl mb-8 border border-slate-700">
                 <span className="text-slate-400 mr-4">FINAL SCORE</span>
                 <span className="text-4xl font-mono font-bold text-white">{score}</span>
              </div>
              <button 
                onClick={startGame}
                className="bg-slate-700 hover:bg-slate-600 text-white text-lg px-10 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95"
              >
                REBOOT SYSTEM ↺
              </button>
           </div>
        )}

      </div>
      
      <div className="mt-4 text-slate-500 text-xs font-mono">
        * 키보드(←, →) 또는 마우스를 사용하여 방화벽을 제어하세요.
      </div>
    </div>
  );
};

export default BreakoutGameTab;