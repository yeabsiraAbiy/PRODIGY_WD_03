const cells = document.querySelectorAll('[data-cell]');
const resetButton = document.querySelector('.reset-button');
const gameStatus = document.querySelector('.game-status');
const backButton = document.querySelector('.back-button');
const playWithAIButton = document.querySelector('.play-ai');
const playWithFriendButton = document.querySelector('.play-friend');
const landingPage = document.querySelector('.landing-page');
const gameContainer = document.querySelector('.game-container');

let currentPlayer = 'X'; // X starts first
let gameActive = true;
let board = ['', '', '', '', '', '', '', '', '']; // Representing the board state
let isAI = false; // Flag to determine if we're playing with AI
let winningCells = []; // To track the winning cells

const checkWin = () => {
    const winPatterns = [
        [0, 1, 2], // Row 1
        [3, 4, 5], // Row 2
        [6, 7, 8], // Row 3
        [0, 3, 6], // Column 1
        [1, 4, 7], // Column 2
        [2, 5, 8], // Column 3
        [0, 4, 8], // Diagonal 1
        [2, 4, 6], // Diagonal 2
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            gameStatus.textContent = `🎆${currentPlayer} Wins!🎆`;

            // Add style for larger, more interesting text
            gameStatus.classList.add('winner');

            winningCells = pattern; // Save winning cells
            highlightWinningCells(pattern);
            return true;
        }
    }

    // Check for draw
    if (!board.includes('')) {
        gameActive = false;
        gameStatus.textContent = 'It\'s a Draw!';
        gameStatus.classList.add('draw');  // Optional: Style for draw message
        return true;
    }

    return false;
};

// Helper function to highlight the winning cells
const highlightWinningCells = (pattern) => {
    pattern.forEach(index => {
        cells[index].style.backgroundColor = 'gray';
        cells[index].style.color = 'white'; // Make the text white to stand out on red
    });
};

// Helper function to clear the winning highlight
const clearWinningCells = () => {
    cells.forEach(cell => {
        cell.style.backgroundColor = ''; // Clear background color
        cell.style.color = ''; // Clear text color
    });
    winningCells = []; // Reset the winning cells array
};

// Handle cell click for both player vs player and player vs AI
const handleCellClick = (e) => {
    const cell = e.target;
    const index = Array.from(cells).indexOf(cell);

    // If the cell is already occupied or the game is over, do nothing
    if (board[index] || !gameActive) return;

    // Player makes their move
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    // Check if the current player has won
    if (checkWin()) return;

    // Switch to the next player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    // If playing with AI, make AI move after a delay
    if (isAI && currentPlayer === 'O') {
        setTimeout(aiMove, 500); // AI move after a 500ms delay
    }
};

// Minimax algorithm to get the best AI move
const minimax = (board, depth, isMaximizing) => {
    const scores = {
        'O': 1, // AI (Maximizing)
        'X': -1, // Player (Minimizing)
        'tie': 0 // Draw
    };

    // Check if the game is over (win or draw)
    if (checkWin() || board.includes('')) {
        if (checkWin()) {
            return isMaximizing ? scores['O'] : scores['X'];
        }
        return scores['tie'];
    }

    const availableMoves = board.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let move of availableMoves) {
            board[move] = 'O'; // AI makes a move
            const score = minimax(board, depth + 1, false);
            board[move] = ''; // Undo the move
            bestScore = Math.max(score, bestScore);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let move of availableMoves) {
            board[move] = 'X'; // Player makes a move
            const score = minimax(board, depth + 1, true);
            board[move] = ''; // Undo the move
            bestScore = Math.min(score, bestScore);
        }
        return bestScore;
    }
};

const aiMove = () => {
    let bestScore = -Infinity;
    let bestMove = -1;

    const availableMoves = board.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);

    // First, check if AI can win (look for a winning move)
    for (let move of availableMoves) {
        board[move] = 'O'; // AI makes a move
        if (checkWin()) {
            bestMove = move;
            board[move] = ''; // Undo the move
            break; // Break early if a winning move is found
        }
        board[move] = ''; // Undo the move
    }

    // If no winning move is found, proceed with minimax to find the best score
    if (bestMove === -1) {
        for (let move of availableMoves) {
            board[move] = 'O'; // AI makes a move
            const score = minimax(board, 0, false);
            board[move] = ''; // Undo the move
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    // Make the best move (or winning move)
    board[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
    cells[bestMove].classList.add('o');

    // Check for a win after AI makes its move
    if (checkWin()) return;

    // Switch back to player X's turn
    currentPlayer = 'X';
};

// Reset the game
const resetGame = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    gameStatus.textContent = '';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });

    // Clear the winning highlight
    clearWinningCells();

    // If playing with AI, ensure AI goes first
    if (isAI && currentPlayer === 'O') {
        aiMove();
    }
};

// Show the game screen
const startGame = (mode) => {
    landingPage.style.display = 'none';
    gameContainer.style.display = 'block';
    isAI = mode === 'ai';
    resetGame();
};

// Event listeners for the buttons
playWithAIButton.addEventListener('click', () => startGame('ai'));
playWithFriendButton.addEventListener('click', () => startGame('friend'));

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);

// Event listener for the back button
backButton.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    landingPage.style.display = 'block';
    resetGame();
});
