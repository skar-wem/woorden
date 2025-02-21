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
let targetWord = DUTCH_WORDS[Math.floor(Math.random() * DUTCH_WORDS.length)];

// Theme toggling
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
});

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
            key.addEventListener('click', () => handleKeyClick(letter));
            keyboardRow.appendChild(key);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

function handleKeyClick(letter) {
    if (gameOver) return;
    
    if (letter === '⌫') {
        if (currentWord.length > 0) {
            currentWord = currentWord.slice(0, -1);
            updateBoard();
        }
    } else if (letter === 'Enter') {
        if (currentWord.length === WORD_LENGTH) {
            checkWord();
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

function checkWord() {
    const row = document.getElementsByClassName('row')[currentRow];
    const tiles = row.getElementsByClassName('tile');
    
    let correct = 0;
    const letterState = {};

    // Check for correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
        const letter = currentWord[i];
        const tile = tiles[i];
        
        if (letter === targetWord[i]) {
            animateTileFlip(tile, i * 100, 'correct');
            correct++;
        } else if (targetWord.includes(letter)) {
            animateTileFlip(tile, i * 100, 'present');
        } else {
            animateTileFlip(tile, i * 100, 'absent');
        }
    }

    if (correct === WORD_LENGTH) {
        setTimeout(() => {
            gameOver = true;
            alert('Gefeliciteerd! Je hebt gewonnen!');
        }, WORD_LENGTH * 100 + 500);
        return;
    }

    currentRow++;
    currentWord = '';

    if (currentRow === TRIES) {
        setTimeout(() => {
            gameOver = true;
            alert(`Game Over! Het woord was ${targetWord}`);
        }, WORD_LENGTH * 100 + 500);
    }
}

// Initialize the game
initBoard();
initKeyboard();

// Add keyboard support
document.addEventListener('keydown', (e) => {
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