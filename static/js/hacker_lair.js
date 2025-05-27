// static/js/hacker_lair.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Hacker's Lair JS Loaded");

    const correctAnswers = {
        1: "THE GREAT ESCAPE",
        2: "443",
        3: "KAWWINM",
        4: "AX7-TQ9-LP4"
    };
    const totalLevels = 4;
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content'); // For shake effect

    // Attach listeners to all check buttons using data-level attribute
    document.querySelectorAll('.puzzle-area button[data-level]').forEach(button => {
        button.addEventListener('click', () => {
            const level = parseInt(button.dataset.level);
            checkAnswer(level);
        });
    });

    // Attach Enter key listener to inputs
     document.querySelectorAll('.puzzle-area input[type="text"]').forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                 event.preventDefault(); // Prevent potential form submission
                 const level = parseInt(input.id.match(/puzzle(\d+)-answer/)?.[1]); // Extract level from input ID (safe access)
                 if(level){
                     checkAnswer(level);
                 }
            }
        });
    });

    function checkAnswer(level) {
        const currentLevel = level;
        const answerInput = document.getElementById(`puzzle${currentLevel}-answer`);
        const feedbackEl = document.getElementById(`feedback${currentLevel}`);
        const puzzleArea = document.getElementById(`puzzle${currentLevel}-area`);
        const nextLevelArea = document.getElementById(`puzzle${currentLevel + 1}-area`);
        const completionSection = document.getElementById('completion-section');

        if (!answerInput || !feedbackEl || !puzzleArea) {
            console.error(`Elements not found for level ${currentLevel}`);
            return;
        }

        const userAnswer = answerInput.value.trim().toUpperCase();

        if (userAnswer === correctAnswers[currentLevel]) {
            feedbackEl.textContent = `Level ${currentLevel} Bypassed! Accessing next layer...`;
            feedbackEl.className = 'feedback feedback-correct';
            puzzleArea.classList.add('solved');
            puzzleArea.classList.remove('locked');
            answerInput.disabled = true;
            puzzleArea.querySelector('button').disabled = true;

            if (currentLevel < totalLevels && nextLevelArea) {
                nextLevelArea.classList.remove('locked');
                nextLevelArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (currentLevel === totalLevels) {
                completionSection.style.display = 'block'; // Reveal the FORM
                completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            feedbackEl.textContent = 'Incorrect Input. Access Denied.';
            feedbackEl.className = 'feedback feedback-incorrect';
            puzzleArea.classList.remove('solved'); // Remove solved state if wrong

             // Add shake feedback
             if(puzzleFrame) {
                 puzzleFrame.classList.add('shake');
                 setTimeout(() => puzzleFrame.classList.remove('shake'), 500);
             }

            if (currentLevel === totalLevels) {
                 completionSection.style.display = 'none'; // Re-hide completion form if last step fails
            }
        }
    }

    // Initialize: Lock levels > 1 and hide completion form
    function initializeLevels() {
        for (let i = 2; i <= totalLevels; i++) {
            const puzzleArea = document.getElementById(`puzzle${i}-area`);
            if (puzzleArea) {
                puzzleArea.classList.add('locked');
            } else {
                 console.warn(`Puzzle area for level ${i} not found during initialization.`);
            }
        }
        const completionSection = document.getElementById('completion-section');
        if (completionSection) {
            completionSection.style.display = 'none';
        } else {
            console.warn(`Completion section not found during initialization.`);
        }
        console.log("Hacker's Lair Levels Initialized");
    }

    initializeLevels();
});