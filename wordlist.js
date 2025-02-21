// wordlist.js
const WORD_LIST = {
    valid: new Set(),
    answers: [],

    initialize: async function() {
        try {
            console.log('Starting word list initialization');
            const response = await fetch('words.json');
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers.get('content-type'));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Parsed data received, words count:', data.valid.length);

            // Add all words to valid guesses
            data.valid.forEach(word => this.valid.add(word));
            console.log('Valid words loaded into Set, count:', this.valid.size);

            // Use all words as possible answers
            this.answers = data.valid;
            console.log('Answers array populated, length:', this.answers.length);
            console.log('Sample answer:', this.answers[0]);

            return true;
        } catch (error) {
            console.error('Error in word list initialization:', error);
            
            // Fallback to basic words if loading fails
            console.log('Using fallback word list');
            const fallbackWords = ["TAFEL", "STOEL", "WATER", "HOREN", "PRAAT", "FIETS"];
            fallbackWords.forEach(word => this.valid.add(word));
            this.answers = fallbackWords;
            
            console.log('Fallback words loaded:', this.valid.size);
            return false;
        }
    },

    isValidGuess: function(word) {
        const upperWord = word.toUpperCase();
        const isValid = this.valid.has(upperWord);
        console.log('Checking word:', upperWord, 'Valid:', isValid);
        return isValid;
    },

    getRandomAnswer: function() {
        if (this.answers.length === 0) {
            console.error('No answers available!');
            return "TAFEL"; // Fallback word
        }
        const randomIndex = Math.floor(Math.random() * this.answers.length);
        const selectedWord = this.answers[randomIndex];
        console.log('Selected random word:', selectedWord);
        return selectedWord;
    },

    // Debug methods
    getWordCount: function() {
        return {
            validWords: this.valid.size,
            possibleAnswers: this.answers.length
        };
    },

    isInitialized: function() {
        return this.valid.size > 0 && this.answers.length > 0;
    }
};

// Log when the script is loaded
console.log('Wordlist.js loaded and WORD_LIST object created');