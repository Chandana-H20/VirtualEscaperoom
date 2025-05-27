// static/js/quantum_paradox.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Quantum Paradox JS Loaded");

    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const promptElement = document.getElementById('prompt');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content'); // For shake

    let currentLevel = 1;
    const totalLevels = 4;
    let commandHistory = []; // Optional

    const correctAnswers = {
        1: "ACTIVATE CHRONOS",
        2: "LOCK T-COORD 53",
        3: "SCAN COMPLETE 137",
        4: "AUTH RETURN JUMP 731"
    };

    const levelPrompts = {
        1: `Chronos System Boot Required. Temporal Field Unstable.
WARNING: Unauthorized access detected! System integrity failing...
Enter Power On Sequence Command:`,
        2: `Chronos Core Online. Temporal Field Stabilizing... 27%
CALIBRATION REQUIRED: Target destination coordinates fluctuating.
Temporal Coordinate (T-Coord) must be a prime number between 50 and 60.
Enter command: LOCK T-COORD [number]`,
        3: `T-Coord Locked. Field Stability: 68%
Performing Anomaly Scan...
[SCAN DATA STREAM]
... 42 ... 99 ... 101 ... [ERRATIC PULSE] ... 137 ... 89 ...
Anomaly signature detected. Report the stable numeric value following the pulse.
Enter command: SCAN COMPLETE [number]`,
        4: `Anomaly Signature Verified. Field Stability: 99%
Return jump sequence initiated. Final authorization required.
The authorization code is the reverse of the stable anomaly value.
Enter command: AUTH RETURN JUMP [code]`
    };

    const successMessages = {
        1: "Power On Sequence Accepted. Core systems initializing...",
        2: "Temporal Coordinate Locked. Preparing for anomaly scan...",
        3: "Anomaly Scan Data Processed. Initiating return jump protocols...",
        4: "Authorization Confirmed! Chronos device returning to baseline reality..."
    };

    const errorMessages = {
        1: "ERROR: Invalid Power On Sequence. System degradation increasing.",
        2: "ERROR: Invalid T-Coord or command format. Calibration failed. Try again.",
        3: "ERROR: Incorrect scan value reported. Anomaly growing. Re-analyze data.",
        4: "ERROR: Authorization code incorrect. Return jump aborted. Security alert triggered."
    };

    function appendToTerminal(text, isCommand = false) {
        if (!terminalOutput) return; // Exit if element not found
        if (isCommand) {
            terminalOutput.textContent += `\n> ${text}`;
        } else {
            terminalOutput.textContent += `\n${text}`;
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function processInput() {
        if (!terminalInput || !terminalOutput) return; // Safety check

        const command = terminalInput.value.trim().toUpperCase();
        if (!command) return;

        appendToTerminal(command, true);
        terminalInput.value = '';
        commandHistory.push(command);

        if (command === correctAnswers[currentLevel]) {
            appendToTerminal(`\n[SYSTEM] ${successMessages[currentLevel]}`);
            currentLevel++;

            if (currentLevel <= totalLevels) {
                appendToTerminal(`\n${levelPrompts[currentLevel]}`);
                terminalInput.focus(); // Keep focus on input
            } else {
                appendToTerminal("\n[SYSTEM] Temporal Stabilization Complete. Return Successful.");
                if (terminalInput) terminalInput.disabled = true;
                if (promptElement) promptElement.style.display = 'none';
                if (completionSection) {
                    completionSection.style.display = 'block'; // Reveal FORM
                    completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                     console.warn("Completion section not found.");
                }
            }
            feedbackArea.textContent = ''; // Clear any previous error messages
            feedbackArea.className = '';

        } else {
            appendToTerminal(`\n[SYSTEM] ${errorMessages[currentLevel]}`);
            appendToTerminal(`\n${levelPrompts[currentLevel]}`); // Repeat current prompt
            terminalInput.focus();

             // Use feedback area for visual error cue as well
             const feedbackArea = document.getElementById('feedback-area'); // Get feedback area
             if(feedbackArea){
                  feedbackArea.textContent = "Command Error!";
                  feedbackArea.className = 'feedback feedback-incorrect';
             }
             // Add shake feedback
             if(puzzleFrame) {
                 puzzleFrame.classList.add('shake');
                 setTimeout(() => puzzleFrame.classList.remove('shake'), 500);
             }
        }
    }

    function startGame() {
        if (!terminalOutput || !terminalInput || !completionSection) {
            console.error("Quantum Paradox: Missing essential HTML elements (terminal-output, terminal-input, or completion-section).");
            return;
        }
        terminalOutput.textContent = "[SYSTEM] Booting Chronos Interface...";
        appendToTerminal(levelPrompts[1]);
        terminalInput.disabled = false;
        terminalInput.focus();
        completionSection.style.display = 'none';
        currentLevel = 1;
        console.log("Quantum Paradox Initialized");
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                processInput();
            }
        });
    } else {
        console.error("Terminal input element not found.");
    }

    startGame(); // Initialize the game
});