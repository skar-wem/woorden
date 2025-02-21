// script.js
const WORD_LENGTH = 5;
const TRIES = 6;
const KEYBOARD_LETTERS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

let currentWord = '';
let currentRow = 0;
let gameOver = false;
let targetWord = '';
let isLoading = true;

// Game state
const gameState = {
    guesses: [],
    keyStates: {},
    gameOver: false,
    won: false,
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0
};

// Initialize loading screen
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
    isLoading = false;
}

// Theme handling
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

async function initGame() {
    showLoading();
    
    // Initialize word list
    await WORD_LIST.initialize();
    targetWord = WORD_LIST.getRandomAnswer();
    
    // Initialize board and keyboard
    initBoard();
    initKeyboard();
    
    // Load saved game state
    loadGameState();
    
    hideLoading();
}

function initBoard() {
    const board = document.getElementById('board');
    
    for (let i = 0; i < TRIES; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            row.appendChild(tile);
        }
        
        board.appendChild(row);
    }
}

function initKeyboard() {
    const keyboard = document.getElementById('keyboard');
    
    KEYBOARD_LETTERS.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(letter => {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.setAttribute('data-key', letter);
            key.addEventListener('click', () => handleKeyClick(letter));
            keyboardRow.appendChild(key);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

function handleKeyClick(letter) {
    if (gameOver || isLoading) return;
    
    // Add visual feedback
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key) {
        key.classList.add('pressed', 'active');
        setTimeout(() => {
            key.classList.remove('pressed', 'active');
        }, 100);
    }

    if (letter === '⌫') {
        if (currentWord.length > 0) {
            currentWord = currentWord.slice(0, -1);
            updateBoard();
        }
    } else if (letter === 'Enter') {
        if (currentWord.length === WORD_LENGTH) {
            checkWord();
        } else {
            showMessage('Te weinig letters');
        }
    } else if (currentWord.length < WORD_LENGTH) {
        currentWord += letter;
        updateBoard();
        animateTilePop(currentRow, currentWord.length - 1);
    }
}

function updateBoard() {
    const row = document.getElementsByClassName('row')[currentRow];
    const tiles = row.getElementsByClassName('tile');
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        tiles[i].textContent = currentWord[i] || '';
    }
}

function animateTilePop(row, col) {
    const tile = document.getElementsByClassName('row')[row]
        .getElementsByClassName('tile')[col];
    tile.classList.add('pop');
    setTimeout(() => tile.classList.remove('pop'), 150);
}

function animateTileFlip(tile, delay, className) {
    setTimeout(() => {
        tile.classList.add('flip');
        setTimeout(() => {
            tile.classList.add(className);
        }, 250);
    }, delay);
}

function shakeRow(row) {
    const tiles = row.getElementsByClassName('tile');
    Array.from(tiles).forEach(tile => {
        tile.classList.add('shake');
        setTimeout(() => tile.classList.remove('shake'), 500);
    });
}

function updateKeyboard(letter, className) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key) {
        key.classList.add(className);
    }
}

function showEndGameModal(won) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const title = document.createElement('h2');
    const message = document.createElement('p');
    const button = document.createElement('button');
    button.textContent = 'Nieuw spel';
    button.onclick = () => {
        // Reset game state
        currentWord = '';
        currentRow = 0;
        gameOver = false;
        
        // Clear the board
        const board = document.getElementById('board');
        board.innerHTML = '';
        initBoard();

        // Reset keyboard
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = '';
        initKeyboard();

        // Get new target word
        targetWord = WORD_LIST.getRandomAnswer();

        // Remove modal
        overlay.remove();
    };

    if (won) {
        title.textContent = 'Gefeliciteerd!';
        message.textContent = `Je hebt het woord ${targetWord} geraden in ${currentRow + 1} ${currentRow === 0 ? 'beurt' : 'beurten'}!`;
    } else {
        title.textContent = 'Helaas!';
        message.textContent = `Het woord was ${targetWord}`;
    }

    modal.appendChild(title);
    modal.appendChild(message);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function checkWord() {
    if (!WORD_LIST.isValidGuess(currentWord)) {
        const row = document.getElementsByClassName('row')[currentRow];
        shakeRow(row);
        showMessage('Niet in woordenlijst');
        return;
    }

    const row = document.getElementsByClassName('row')[currentRow];
    const tiles = row.getElementsByClassName('tile');
    
    let correct = 0;
    const letterCounts = {};
    
    // Count letters in target word
    for (const letter of targetWord) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    // First pass: Check for correct positions
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = currentWord[i];
        if (letter === targetWord[i]) {
            correct++;
            letterCounts[letter]--;
            animateTileFlip(tiles[i], i * 100, 'correct');
            updateKeyboard(letter, 'correct');
        }
    }

    // Second pass: Check for present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = currentWord[i];
        if (letter !== targetWord[i]) {
            if (letterCounts[letter] > 0) {
                letterCounts[letter]--;
                animateTileFlip(tiles[i], i * 100, 'present');
                updateKeyboard(letter, 'present');
            } else {
                animateTileFlip(tiles[i], i * 100, 'absent');
                updateKeyboard(letter, 'absent');
            }
        }
    }

    // Update game state
    gameState.guesses.push(currentWord);
    saveGameState();

    if (correct === WORD_LENGTH) {
        setTimeout(() => {
            gameOver = true;
            gameState.won = true;
            gameState.currentStreak++;
            gameState.maxStreak = Math.max(gameState.maxStreak, gameState.currentStreak);
            gameState.gamesWon++;
            saveGameState();
            showEndGameModal(true);
        }, WORD_LENGTH * 100 + 500);
        return;
    }

    currentRow++;
    currentWord = '';

    if (currentRow === TRIES) {
        setTimeout(() => {
            gameOver = true;
            gameState.currentStreak = 0;
            saveGameState();
            showEndGameModal(false);
        }, WORD_LENGTH * 100 + 500);
    }
}

function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('fade-out');
        setTimeout(() => message.remove(), 300);
    }, 1000);
}

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        Object.assign(gameState, JSON.parse(savedState));
    }
}

// Keyboard input handling
document.addEventListener('keydown', (e) => {
    if (isLoading) return;
    
    if (e.key === 'Backspace') {
        handleKeyClick('⌫');
    } else if (e.key === 'Enter') {
        handleKeyClick('Enter');
    } else {
        const letter = e.key.toUpperCase();
        if (letter.length === 1 && letter.match(/[A-Z]/)) {
            handleKeyClick(letter);
        }
    }
});

console.log('Number of valid words:', WORD_LIST.valid.size);
console.log('Number of possible answers:', WORD_LIST.answers.length);
console.log('Target word:', targetWord);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);