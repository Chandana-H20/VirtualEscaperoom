// static/js/derelict_station.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Derelict Station JS Loaded");

    // Get DOM elements
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const terminalInputLine = document.getElementById('terminal-input-line');
    const terminalInput = document.getElementById('terminal-input');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content'); // For shake

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {}; // For storing sequence clicks etc.

    // --- Level Data ---
    const levelsData = [
        null, // Index 0 unused
        { // Level 1: Power Rerouting
            instructions: "Emergency power is offline. Activate the backup conduits in the correct sequence: Aux -> Main -> Core.",
            setupFunction: setupLevel1,
            correctAnswer: ['aux-power', 'main-power', 'core-power'], // Button data-ids in order
            checkType: 'sequence'
        },
        { // Level 2: Decrypt Log
            instructions: "A corrupted crew log entry was recovered. Decrypt the passcode using a ROT13 cipher: 'FNVYHERZFGHCF'",
            setupFunction: setupLevel2,
            correctAnswer: 'FAILUREMUSTSTOP', // Decrypted text
            checkType: 'textInput'
        },
        { // Level 3: Align Beacons
            instructions: "The navigation beacons are misaligned. Set target coordinates based on the star chart: Sector 7G, Point 42 Alpha.",
            setupFunction: setupLevel3,
            correctAnswer: '7G-42A', // Combined coordinate
            checkType: 'textInput'
        },
        { // Level 4: Override Lockdown
            instructions: "Docking bay lockdown protocol active. Issue the Master Override Command: 'UNLOCK BAY:' followed by the decrypted passcode from the log.",
            setupFunction: setupLevel4,
            correctAnswer: 'UNLOCK BAY:FAILUREMUSTSTOP', // Command using Level 2 answer
            checkType: 'terminalInput'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        levelState = { clickSequence: [] };
        puzzleDisplay.innerHTML = `
            <img src="/static/images/station_panel_placeholder.jpg" alt="Power Control Panel" style="width:100%; height:auto;">
            <div class="control-button" data-id="main-power" style="top: 45%; left: 48%; width: 30px; height: 30px;" title="Main Power Conduit"></div>
            <div class="control-button" data-id="aux-power" style="top: 70%; left: 25%; width: 30px; height: 30px;" title="Auxiliary Power Conduit"></div>
            <div class="control-button" data-id="core-power" style="top: 20%; left: 70%; width: 30px; height: 30px;" title="Core Power Conduit"></div>
        `;
        inputArea.style.display = 'none';
        terminalInputLine.style.display = 'none';
        attachInteractionListeners('.control-button');
    }

    function setupLevel2() {
        puzzleDisplay.innerHTML = `
            <div style="padding: 20px; background: #111; border: 1px solid #446688; border-radius: 4px;">
                <h4 style="color: #ffcc66; margin-top: 0;">Recovered Log Fragment</h4>
                <p style="color: #ccc;">Log Date: Stardate 5842.7</p>
                <p style="color: #ff6666;">Entry: ...critical system cascade... containment failed... override code encrypted...</p>
                <p style="color: #fff;">Encrypted Passcode: <code style="background: #333; padding: 3px 5px; border-radius: 3px; color: #ff8888;">FNVYHERZFGHCF</code> (ROT13)</p>
            </div>
        `;
        inputArea.innerHTML = `
            <label for="text-input">Decrypted Passcode:</label>
            <input type="text" id="text-input" placeholder="Enter passcode...">
            <button id="submit-button">Submit</button>
        `;
        inputArea.style.display = 'block';
        terminalInputLine.style.display = 'none';
        attachSubmitListener(levelsData[currentLevel].checkType);
    }

    function setupLevel3() {
         puzzleDisplay.innerHTML = `
            <img src="/static/images/station_map_placeholder.jpg" alt="Navigation Star Chart" style="width:100%; height:auto;">
             <p style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.7); color:#fff; padding:5px; border-radius:3px;">TARGET: Sector 7G, Point 42 Alpha</p>
        `;
        inputArea.innerHTML = `
            <label for="text-input">Coordinates (e.g., XX-YYZ):</label>
            <input type="text" id="text-input" placeholder="Enter coordinates...">
            <button id="submit-button">Lock Coordinates</button>
        `;
        inputArea.style.display = 'block';
        terminalInputLine.style.display = 'none';
        attachSubmitListener(levelsData[currentLevel].checkType);
    }

     function setupLevel4() {
         puzzleDisplay.innerHTML = `
             <div style="padding: 20px; background: #111; border: 1px solid #ff6666; border-radius: 4px;">
                 <h4 style="color: #ff6666; margin-top: 0;"><i class="fas fa-exclamation-triangle"></i> LOCKDOWN ACTIVE</h4>
                 <p style="color: #ccc;">Docking Bay doors sealed. Emergency Override Required.</p>
                 <p style="color: #fff;">Enter Master Override Command via terminal.</p>
                 <p style="color: #aaa;">(Hint: Use the decrypted passcode from the log.)</p>
             </div>
         `;
         inputArea.style.display = 'none';
         terminalInputLine.style.display = 'flex'; // Show terminal input
         attachSubmitListener(levelsData[currentLevel].checkType);
         if(terminalInput) terminalInput.focus();
    }

    // --- Check Logic / Interaction Handling ---
     function handleInteraction(event) {
         const targetElement = event.target;
         const clickedId = targetElement.dataset.id;
         const levelData = levelsData[currentLevel];

         if (!clickedId || levelData.checkType !== 'sequence') return;

         levelState.clickSequence.push(clickedId);
         targetElement.classList.add('active'); // Visual feedback

         const sequence = levelState.clickSequence;
         const correct = levelData.correctAnswer;

        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i] !== correct[i]) {
                handleIncorrectAnswer("Incorrect sequence. Power surge detected! Resetting...");
                document.querySelectorAll('.control-button.active').forEach(el => el.classList.remove('active'));
                levelState.clickSequence = [];
                return;
            }
        }

        if (sequence.length === correct.length) {
            handleCorrectAnswer();
        } else {
            if(feedbackArea){
                 feedbackArea.textContent = `Conduit ${sequence.length} of ${correct.length} online...`;
                 feedbackArea.className = 'feedback-hint'; // Use a hint color if defined in CSS
            }
        }
     }

    function checkTextInput() {
        const inputElement = document.getElementById('text-input');
        const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
        const levelData = levelsData[currentLevel];

        if (userAnswer === levelData.correctAnswer) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer(currentLevel === 2 ? "Decryption failed. Check cipher." : "Invalid coordinates.");
        }
    }

    function checkTerminalInput() {
         const userAnswer = terminalInput ? terminalInput.value.trim().toUpperCase() : '';
         const levelData = levelsData[currentLevel];

         if (userAnswer === levelData.correctAnswer) {
             handleCorrectAnswer();
         } else {
             handleIncorrectAnswer("COMMAND REJECTED. Invalid override code.");
         }
         if(terminalInput) terminalInput.value = ''; // Clear terminal input after attempt
    }

    // --- Event Listener Helpers ---
    function attachInteractionListeners(selector) {
        const elements = puzzleDisplay.querySelectorAll(selector);
        elements.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            newEl.addEventListener('click', handleInteraction);
        });
    }

     function attachSubmitListener(checkType) {
         if (checkType === 'textInput') {
             const button = document.getElementById('submit-button');
             const input = document.getElementById('text-input');
             if(button) button.onclick = checkTextInput; // Use onclick to easily replace listener
             if(input) input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); checkTextInput(); } };
         } else if (checkType === 'terminalInput') {
            if (terminalInput) {
                 terminalInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); checkTerminalInput(); } };
            }
         }
     }

    // --- Game Flow Logic ---
    function loadLevel(levelNumber) {
        if (levelNumber > totalLevels) {
            showCompletion(); return;
        }
         if (!levelsData[levelNumber] || !levelsData[levelNumber].setupFunction) {
             console.error("Invalid level data or setup function for level:", levelNumber);
             if(feedbackArea){
                 feedbackArea.textContent = "Error loading systems.";
                 feedbackArea.className = 'feedback-incorrect';
             }
             return;
         }
        currentLevel = levelNumber;
        levelState = {}; // Reset state
        const level = levelsData[levelNumber];
        if(puzzleInstructions) puzzleInstructions.textContent = level.instructions;
        if(feedbackArea) {
            feedbackArea.textContent = '';
            feedbackArea.className = '';
        }
        level.setupFunction();
    }

    function handleCorrectAnswer() {
        if(feedbackArea) {
            feedbackArea.textContent = "Operation successful. Proceeding...";
            feedbackArea.className = 'feedback-correct';
        }
        setTimeout(() => { loadLevel(currentLevel + 1); }, 1500);
    }

    function handleIncorrectAnswer(message) {
        if(feedbackArea){
             feedbackArea.textContent = message || "Action failed. Recalibrating...";
             feedbackArea.className = 'feedback-incorrect';
        }
         if(puzzleFrame) {
             puzzleFrame.classList.add('shake');
             setTimeout(() => puzzleFrame.classList.remove('shake'), 500);
         }
    }

    function showCompletion() {
        const puzzleFrameElement = document.getElementById('puzzle-frame');
        if(puzzleFrameElement) puzzleFrameElement.style.display = 'none';
        if(terminalInputLine) terminalInputLine.style.display = 'none'; // Hide terminal input line
        if(inputArea) inputArea.style.display = 'none'; // Hide text input area
        if(completionSection) {
            completionSection.style.display = 'block'; // Show FORM
            completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             console.warn("Completion section not found.");
        }
    }

    // --- Initialization ---
    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !terminalInputLine || !terminalInput || !feedbackArea || !completionSection) {
         console.error("Derelict Station: Missing one or more essential HTML elements.");
    } else {
        loadLevel(1);
        console.log("Derelict Station Initialized");
    }
});