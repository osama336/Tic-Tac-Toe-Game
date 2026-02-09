import React, { useState, useEffect } from 'react';
import './App.css';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerChar, setPlayerChar] = useState(null);
  const [computerChar, setComputerChar] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState('setup');

  // ─── Score State ────────────────────────────────────────────
  const [scores, setScores] = useState({
    player: 0,
    computer: 0,
    ties: 0,
  });

  // ─── Helpers ────────────────────────────────────────────────
  const checkWinner = (currentBoard, char) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    return winPatterns.some(pattern =>
      pattern.every(index => currentBoard[index] === char)
    );
  };

  const isBoardFull = currentBoard => !currentBoard.includes(null);

  const updateGameState = (newBoard, lastChar) => {
    if (checkWinner(newBoard, lastChar)) {
      if (lastChar === playerChar) {
        setScores(prev => ({ ...prev, player: prev.player + 1 }));
        setGameStatus('won');
      } else {
        setScores(prev => ({ ...prev, computer: prev.computer + 1 }));
        setGameStatus('lost');
      }
      return true;
    }
    if (isBoardFull(newBoard)) {
      setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      setGameStatus('tie');
      return true;
    }
    return false;
  };

  // ─── Minimax ────────────────────────────────────────────────
  const minimax = (tempBoard, depth, isMaximizing) => {
    if (checkWinner(tempBoard, computerChar)) return 10 - depth;
    if (checkWinner(tempBoard, playerChar)) return depth - 10;
    if (isBoardFull(tempBoard)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      tempBoard.forEach((val, idx) => {
        if (val === null) {
          tempBoard[idx] = computerChar;
          best = Math.max(best, minimax(tempBoard, depth + 1, false));
          tempBoard[idx] = null;
        }
      });
      return best;
    } else {
      let best = Infinity;
      tempBoard.forEach((val, idx) => {
        if (val === null) {
          tempBoard[idx] = playerChar;
          best = Math.min(best, minimax(tempBoard, depth + 1, true));
          tempBoard[idx] = null;
        }
      });
      return best;
    }
  };

  const findBestMove = () => {
    let bestScore = -Infinity;
    let bestMove = null;
    const tempBoard = [...board];

    board.forEach((val, idx) => {
      if (val === null) {
        tempBoard[idx] = computerChar;
        const score = minimax(tempBoard, 0, false);
        tempBoard[idx] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = idx;
        }
      }
    });
    return bestMove;
  };

  const makeComputerMove = () => {
    const move = findBestMove();
    if (move === null) return;

    const newBoard = [...board];
    newBoard[move] = computerChar;
    setBoard(newBoard);

    const gameEnded = updateGameState(newBoard, computerChar);
    if (!gameEnded) {
      setIsPlayerTurn(true);
    }
  };

  // ─── Player Move ────────────────────────────────────────────
  const handlePlayerClick = (index) => {
    if (!isPlayerTurn || board[index] !== null || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = playerChar;
    setBoard(newBoard);

    const gameEnded = updateGameState(newBoard, playerChar);
    if (!gameEnded) {
      setIsPlayerTurn(false);
    }
  };

  // ─── Game Start / Reset ─────────────────────────────────────
  const startGame = (playerSymbol, playerStarts) => {
    setPlayerChar(playerSymbol);
    setComputerChar(playerSymbol === 'X' ? 'O' : 'X');
    setIsPlayerTurn(playerStarts);
    setGameStatus('playing');
    setBoard(Array(9).fill(null));
  };

  const resetGame = () => {
    setGameStatus('setup');
    // Scores persist across games in the same session
    // If you want to reset scores too, uncomment:
    // setScores({ player: 0, computer: 0, ties: 0 });
  };

  useEffect(() => {
    if (gameStatus === 'playing' && !isPlayerTurn) {
      const timer = setTimeout(makeComputerMove, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board]);

  // ─── UI ─────────────────────────────────────────────────────
  const statusMessage = {
    setup: 'Tic Tac Toe',
    playing: isPlayerTurn ? 'Your turn' : 'Computer thinking...',
    won: 'You Won! 🎉',
    lost: 'Computer Won 😔',
    tie: "It's a Tie 🤝",
  }[gameStatus];

  if (gameStatus === 'setup') {
    return (
      <div className="setup-screen">
        <h1>Tic Tac Toe</h1>
        <p>Choose your side:</p>
        <div className="button-group">
          <button onClick={() => startGame('X', true)}>X (Go First)</button>
          <button onClick={() => startGame('O', false)}>O (Computer First)</button>
        </div>
      </div>
    );
  }

  return (
  <div className="game-container">
    <div className="main-layout">
      <div className="game-content">
        <h1>Tic Tac Toe</h1>
        <h2>{statusMessage}</h2>

        <div className="board">
          {board.map((cell, index) => (
            <div
              key={index}
              className={`cell ${cell ? 'filled' : ''} ${cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''}`}
              onClick={() => handlePlayerClick(index)}
            >
              {cell}
            </div>
          ))}
        </div>

        {gameStatus !== 'playing' && (
          <div className="game-over">
            <button className="play-again" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Score board on the right side */}
      <div className="score-sidebar">
        <h3>Score</h3>
        <div className="score-item player">
          <span>You ({playerChar})</span>
          <strong>{scores.player}</strong>
        </div>
        <div className="score-item tie">
          <span>Ties</span>
          <strong>{scores.ties}</strong>
        </div>
        <div className="score-item computer">
          <span>Computer ({computerChar})</span>
          <strong>{scores.computer}</strong>
        </div>
      </div>
    </div>
  </div>
);
};

export default TicTacToe;