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

// You can replace this with an API call to get random words
const targetWord = 'HELLO';

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
    }
}

function updateBoard() {
    const row = document.getElementsByClassName('row')[currentRow];
    const tiles = row.getElementsByClassName('tile');
    
    for (let i = 0; i < WORD_LENGTH; i++) {
        tiles[i].textContent = currentWord[i] || '';
    }
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
            tile.classList.add('correct');
            correct++;
        } else if (targetWord.includes(letter)) {
            tile.classList.add('present');
        } else {
            tile.classList.add('absent');
        }
    }

    if (correct === WORD_LENGTH) {
        gameOver = true;
        alert('Congratulations! You won!');
        return;
    }

    currentRow++;
    currentWord = '';

    if (currentRow === TRIES) {
        gameOver = true;
        alert(`Game Over! The word was ${targetWord}`);
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