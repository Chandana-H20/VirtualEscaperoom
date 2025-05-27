// static/js/biolab_escape.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Biolab Escape JS Loaded");
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Biolab Escape Error: Missing essential HTML elements."); return;
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {};

    const levelsData = [ null,
        { // Level 1: Analyze DNA Sequence
            instructions: "Analyze the unstable DNA sequence. Find the repeating 3-base codon.",
            setupFunction: setupLevel1, // Displays sequence
            correctAnswer: 'CAG', // Example repeating sequence
            checkType: 'textInput'
        },
        { // Level 2: Mix Counter-Agent
            instructions: "Synthesize the counter-agent. Mix the samples with liquid levels matching the codon numbers (C=3, A=1, G=7). Click to adjust.",
            setupFunction: setupLevel2, // Shows sample tubes
            correctAnswer: { 'tube-c': 3, 'tube-a': 1, 'tube-g': 7 }, // Target levels {id: level}
            checkType: 'liquidLevels' // Custom check
        },
        { // Level 3: Access Sterilization Control
            instructions: "Enter the 4-digit access code displayed on the flickering emergency panel.",
            setupFunction: setupLevel3, // Shows panel with keypad
            correctAnswer: '9037', // Example code
            checkType: 'keypadInput' // Custom check
        },
        { // Level 4: Initiate Protocol
            instructions: "Confirm Sterilization Protocol by pressing the large red button.",
            setupFunction: setupLevel4, // Shows final button
            correctAnswer: 'sterilize-button', // data-id
            checkType: 'hotspot'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
            <p style="color:#ccc;">Microscope Feed:</p>
            <code class="dna-sequence">
            ATTCGATTGCAGCAGCAGTTACGGATCGCAGATGCGATCGCAGTTACGCAGGCAGTCAGAT
            </code>
            <p style="color:#ccc; font-size:0.9em;">Identify the repeating 3-base pattern.</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Repeating Codon:</label> <input type="text" id="text-input" placeholder="e.g., ATC" maxlength="3"> <button id="submit-button">Submit Sequence</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }
    function setupLevel2() {
        puzzleDisplay.style.flexDirection = 'initial'; // Back to default row wrap
        puzzleDisplay.innerHTML = `
            <p style="width:100%; text-align:center; color: #ccc;">Counter-Agent Synthesizer (Levels C=3, A=1, G=7)</p>
            <div class="sample-tube" data-id="tube-c" data-level="5" style="--liquid-level: 50%; --liquid-color: #ff6666;" title="Sample C"></div>
            <div class="sample-tube" data-id="tube-a" data-level="5" style="--liquid-level: 50%; --liquid-color: #66ff66;" title="Sample A"></div>
            <div class="sample-tube" data-id="tube-g" data-level="5" style="--liquid-level: 50%; --liquid-color: #6666ff;" title="Sample G"></div>
            <button id="check-mix-button" class="cta-button" style="width: 80%; margin: 20px auto; display:block;">Check Mixture</button>
        `;
        inputArea.style.display = 'none';
        attachTubeListeners();
    }
    function setupLevel3() {
        levelState = { enteredCode: "" };
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
             <img src="/static/images/biolab_panel_placeholder.jpg" alt="Control Panel" style="width:80%; height:auto; max-height: 250px; margin: 15px auto;">
             <p style="color:#ccc; text-align:center;">Emergency Access Code: <span id="code-display" style="color:yellow; font-weight:bold; letter-spacing: 5px;">----</span></p>
             <div id="keypad" style="margin-top:15px; text-align:center;">
                 <button class="keypad-button" data-key="1">1</button> <button class="keypad-button" data-key="2">2</button> <button class="keypad-button" data-key="3">3</button> <br>
                 <button class="keypad-button" data-key="4">4</button> <button class="keypad-button" data-key="5">5</button> <button class="keypad-button" data-key="6">6</button> <br>
                 <button class="keypad-button" data-key="7">7</button> <button class="keypad-button" data-key="8">8</button> <button class="keypad-button" data-key="9">9</button> <br>
                 <button class="keypad-button" data-key="clear" style="width: 80px;">CLR</button> <button class="keypad-button" data-key="0">0</button> <button class="keypad-button" data-key="enter" style="width: 80px; background-color: green;">ENT</button>
             </div>
        `;
        inputArea.style.display = 'none';
        attachKeypadListeners();
    }
     function setupLevel4() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/biolab_button_placeholder.jpg" alt="Sterilization Control" style="width:100%; height:auto; max-height: 450px;">
            <div class="hotspot" data-id="sterilize-button" title="Initiate Sterilization" style="top: 40%; left: 40%; width: 20%; height: 20%; border-radius: 50%; background: rgba(255,0,0,0.2); border: 3px dashed red;"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }

    // --- Check Logic ---
     function checkAnswer(level, data) {
        const levelData = levelsData[level];
        if (!levelData) return;
        let isCorrect = false;
        switch (levelData.checkType) {
            case 'textInput': // Level 1 DNA
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer("Incorrect codon identified.");
                break;
            case 'liquidLevels': // Level 2 Tubes
                const tubes = document.querySelectorAll('.sample-tube');
                isCorrect = true; // Assume correct initially
                for(const tube of tubes) {
                    const id = tube.dataset.id;
                    const currentLevel = parseInt(tube.dataset.level);
                    const targetLevel = levelData.correctAnswer[id];
                    if(currentLevel !== targetLevel) {
                        isCorrect = false;
                        break;
                    }
                }
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer("Mixture ratios incorrect. Counter-agent failed.");
                break;
             case 'keypadInput': // Level 3 Code
                isCorrect = (data === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("ACCESS DENIED. Incorrect code.");
                break;
             case 'hotspot': // Level 4 Button
                 isCorrect = (data === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("That doesn't seem to be the main control.");
                 break;
            default: console.warn("Unknown checkType");
        }
    }

    // --- Event Handling ---
    function attachInteractionListeners(selector) {
        const elements = puzzleDisplay.querySelectorAll(selector);
        elements.forEach(el => {
            const newEl = el.cloneNode(true);
            if (el.parentNode) { el.parentNode.replaceChild(newEl, el); newEl.addEventListener('click', handleInteraction); }
        });
    }
     function attachSubmitListener() {
         const button = document.getElementById('submit-button');
         const input = document.getElementById('text-input');
         const levelData = levelsData[currentLevel];
         if (levelData?.checkType === 'textInput') {
             if(button) button.onclick = () => checkAnswer(currentLevel, null);
             if(input) input.onkeydown = (e) => { if (e.key === 'Enter') {e.preventDefault(); checkAnswer(currentLevel, null);} };
         }
     }
    function handleInteraction(event) {
        const targetElement = event.target.closest('[data-id]');
        if (!targetElement) return;
        const clickedId = targetElement.dataset.id;
        const levelData = levelsData[currentLevel];
        if (levelData.checkType === 'hotspot') checkAnswer(currentLevel, clickedId);
        // Add other interaction types if needed
    }
    // Level 2 Tube Listeners
    function attachTubeListeners() {
        document.querySelectorAll('.sample-tube').forEach(tube => {
            tube.onclick = () => cycleTubeLevel(tube);
        });
        const checkButton = document.getElementById('check-mix-button');
        if(checkButton) checkButton.onclick = () => checkAnswer(currentLevel, null); // Trigger check
    }
    function cycleTubeLevel(tubeElement){
        let level = parseInt(tubeElement.dataset.level);
        level = (level + 1) % 11; // Cycle 0-10 (representing 0% to 100%)
        tubeElement.dataset.level = level;
        tubeElement.style.setProperty('--liquid-level', `${level * 10}%`);
    }
     // Level 3 Keypad Listeners
    function attachKeypadListeners() {
        const codeDisplay = document.getElementById('code-display');
        document.querySelectorAll('.keypad-button').forEach(button => {
            button.onclick = () => {
                const key = button.dataset.key;
                if (key >= '0' && key <= '9') {
                    if (levelState.enteredCode.length < 4) {
                        levelState.enteredCode += key;
                    }
                } else if (key === 'clear') {
                    levelState.enteredCode = "";
                } else if (key === 'enter') {
                    checkAnswer(currentLevel, levelState.enteredCode); // Check entered code
                    levelState.enteredCode = ""; // Reset after checking
                }
                // Update display (mask with '*')
                codeDisplay.textContent = levelState.enteredCode.padEnd(4, '-');
            };
        });
    }

    // --- Game Flow Logic ---
    function loadLevel(levelNumber) { if (levelNumber > totalLevels) { showCompletion(); return; } if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading systems."; feedbackArea.className = 'feedback-incorrect'; } return; } currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber]; if(puzzleInstructions) puzzleInstructions.textContent = level.instructions; if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; } if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="padding:50px; color:#aaa;">Loading...</p>'; level.setupFunction(); }
    function handleCorrectAnswer() { if(feedbackArea) { feedbackArea.textContent = "System Update: Accepted."; feedbackArea.className = 'feedback-correct'; } setTimeout(() => { loadLevel(currentLevel + 1); }, 1500); }
    function handleIncorrectAnswer(message) { if(feedbackArea) { feedbackArea.textContent = `System Alert: ${message || "Operation Failed."}`; feedbackArea.className = 'feedback-incorrect'; } if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); } const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop(); if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') { fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} }).then(response => response.json()).then(data => { if(data.success) console.log(`Error reported for ${currentRoomId}. Total: ${data.errors}`); else console.warn(`Failed report: ${data.message}`);}).catch(error => console.error('Error reporting error:', error)); } }
    function showCompletion() { const pf = document.getElementById('puzzle-frame'); const ia = document.getElementById('input-area'); const tl = document.getElementById('terminal-input-line'); if(pf) pf.style.display = 'none'; if(ia) ia.style.display = 'none'; if(tl) tl.style.display = 'none'; if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { console.warn("Completion section not found."); } }

    // --- Initialization ---
    loadLevel(1);
    console.log("Biolab Escape Initialized");
});