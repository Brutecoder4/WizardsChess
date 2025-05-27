const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('reset');
const chess = new Chess();
let selectedSquare = null;
let draggedPiece = null;

// Initialize board
function initBoard() {
  boardElement.innerHTML = '';
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      square.dataset.row = row;
      square.dataset.col = col;
      const piece = board[row][col];
      if (piece) {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.dataset.piece = `${piece.color}${piece.type}`;
        // Map pieces to Harry Potter-themed images (replace with your URLs)
        const pieceImages = {
          'wp': 'pawn_statue.png', 'bp': 'dark_pawn_statue.png',
          'wn': 'knight_wizard.png', 'bn': 'dark_knight_wizard.png',
          // Add others: rook, bishop, queen, king
        };
        pieceElement.style.backgroundImage = `url(${pieceImages[`${piece.color}${piece.type}`] || ''})`;
        square.appendChild(pieceElement);
      }
      square.addEventListener('touchstart', handleTouchStart);
      square.addEventListener('touchmove', handleTouchMove);
      square.addEventListener('touchend', handleTouchEnd);
      boardElement.appendChild(square);
    }
  }
  updateStatus();
}

// Touch handlers
function handleTouchStart(e) {
  e.preventDefault();
  const square = e.target.closest('.square');
  if (!square) return;
  const row = square.dataset.row;
  const col = square.dataset.col;
  const piece = chess.board()[row][col];
  if (piece && piece.color === chess.turn()) {
    selectedSquare = square;
    square.classList.add('selected');
    draggedPiece = square.querySelector('.piece');
  }
}

function handleTouchMove(e) {
  if (!draggedPiece) return;
  e.preventDefault();
  const touch = e.touches[0];
  draggedPiece.style.position = 'absolute';
  draggedPiece.style.left = `${touch.clientX - 20}px`;
  draggedPiece.style.top = `${touch.clientY - 20}px`;
}

function handleTouchEnd(e) {
  if (!selectedSquare || !draggedPiece) return;
  const touch = e.changedTouches[0];
  const targetSquare = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.square');
  selectedSquare.classList.remove('selected');
  draggedPiece.style.position = '';
  draggedPiece.style.left = '';
  draggedPiece.style.top = '';
  if (targetSquare && targetSquare !== selectedSquare) {
    const from = `${String.fromCharCode(97 + parseInt(selectedSquare.dataset.col))}${8 - selectedSquare.dataset.row}`;
    const to = `${String.fromCharCode(97 + parseInt(targetSquare.dataset.col))}${8 - targetSquare.dataset.row}`;
    const move = chess.move({ from, to, promotion: 'q' });
    if (move) {
      if (move.captured) {
        const capturedPiece = targetSquare.querySelector('.piece');
        if (capturedPiece) {
          anime({
            targets: capturedPiece,
            scale: [1, 1.2, 0],
            opacity: [1, 0.5, 0],
            duration: 500,
            easing: 'easeOutQuad',
            complete: () => capturedPiece.remove(),
          });
        }
      }
      anime({
        targets: draggedPiece,
        translateX: [0, targetSquare.offsetLeft - selectedSquare.offsetLeft],
        translateY: [0, targetSquare.offsetTop - selectedSquare.offsetTop],
        duration: 300,
        easing: 'easeOutQuad',
        complete: () => {
          initBoard();
          if (chess.turn() === 'b') aiMove();
        },
      });
    } else {
      initBoard();
    }
  } else {
    initBoard();
  }
  selectedSquare = null;
  draggedPiece = null;
}

// Basic AI (random legal move)
function aiMove() {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return;
  const move = moves[Math.floor(Math.random() * moves.length)];
  chess.move({ from: move.from, to: move.to, promotion: 'q' });
  initBoard();
}

// Update game status
function updateStatus() {
  if (chess.in_checkmate()) {
    statusElement.textContent = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins!`;
  } else if (chess.in_draw()) {
    statusElement.textContent = 'Draw!';
  } else {
    statusElement.textContent = `${chess.turn() === 'w' ? 'White' : 'Black'} to move`;
  }
}

// Reset game
resetButton.addEventListener('click', () => {
  chess.reset();
  initBoard();
});

// PWA service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// Initialize
initBoard();
