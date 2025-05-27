// static/js/steampunk_library.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Steampunk Library JS Loaded");
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Steampunk Library Error: Missing essential HTML elements."); return;
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {};

    const levelsData = [ null,
        { // Level 1: Activate Clockwork Gears
            instructions: "Engage the primary clockwork mechanism. Activate the gears marked Alpha, Gamma, and Epsilon.",
            setupFunction: setupLevel1,
            correctAnswer: ['gear-alpha', 'gear-gamma', 'gear-epsilon'], // data-ids
            checkType: 'multiClickExact'
        },
        { // Level 2: Pneumatic Tube Code
            instructions: "A pneumatic tube delivered a coded message: 'PRESSURE'. Read the central pressure gauge and enter the value (psi).",
            setupFunction: setupLevel2,
            correctAnswer: '113', // Example pressure value shown visually
            checkType: 'textInput'
        },
        { // Level 3: Align Orrery Lenses
            instructions: "Align the Orrery lenses. Click the lens corresponding to Mars (the 4th celestial body from the center).",
            setupFunction: setupLevel3,
            correctAnswer: 'lens-mars', // data-id of the correct lens hotspot
            checkType: 'hotspot'
        },
        { // Level 4: Unlock Archive Vault
            instructions: "The Orrery reveals a combination. Enter the 4-digit code found etched on the brass plaque.",
            setupFunction: setupLevel4,
            correctAnswer: '1888', // Example code visible in the image
            checkType: 'textInput'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        levelState = { clickedItems: new Set() };
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/library_gears_placeholder.jpg" alt="Clockwork Gears" style="width:100%; height:auto; max-height: 450px;">
            <div class="gear" data-id="gear-alpha" style="top: 20%; left: 15%; width: 60px; height: 60px;" title="Alpha Gear"></div>
            <div class="gear" data-id="gear-beta" style="top: 50%; left: 30%; width: 40px; height: 40px;" title="Beta Gear"></div>
            <div class="gear" data-id="gear-gamma" style="top: 70%; left: 55%; width: 70px; height: 70px;" title="Gamma Gear"></div>
            <div class="gear" data-id="gear-delta" style="top: 40%; left: 75%; width: 50px; height: 50px;" title="Delta Gear"></div>
            <div class="gear" data-id="gear-epsilon" style="top: 15%; left: 60%; width: 55px; height: 55px;" title="Epsilon Gear"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.gear');
    }
    function setupLevel2() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
             <img src="/static/images/library_gauge_placeholder.jpg" alt="Pressure Gauge" style="width:60%; height:auto; max-height: 350px; margin:auto;">
             <p style="text-align:center; font-size: 1.5em; color: #ffc107; margin-top:10px;">Gauge Reads: <span class="pressure-gauge-value">113</span> psi</p>
             <p style="text-align:center; color: #ccc;">Received via tube: PRESSURE</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Enter Pressure (psi):</label> <input type="text" id="text-input" inputmode="numeric"> <button id="submit-button">Submit Reading</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }
    function setupLevel3() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/library_orrery_placeholder.jpg" alt="Orrery" style="width:100%; height:auto; max-height: 450px;">
            <div class="hotspot" data-id="lens-sun" title="Sun Lens" style="top: 45%; left: 45%; width: 10%; height: 10%;"></div>
            <div class="hotspot" data-id="lens-mercury" title="Mercury Lens" style="top: 30%; left: 30%; width: 8%; height: 8%;"></div>
            <div class="hotspot" data-id="lens-venus" title="Venus Lens" style="top: 60%; left: 25%; width: 9%; height: 9%;"></div>
            <div class="hotspot" data-id="lens-earth" title="Earth Lens" style="top: 70%; left: 50%; width: 9%; height: 9%;"></div>
            <div class="hotspot" data-id="lens-mars" title="Mars Lens" style="top: 55%; left: 70%; width: 8%; height: 8%;"></div> 
            <div class="hotspot" data-id="lens-jupiter" title="Jupiter Lens" style="top: 20%; left: 65%; width: 12%; height: 12%;"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }
     function setupLevel4() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/library_vault_placeholder.jpg" alt="Archive Vault Door" style="width:70%; height:auto; max-height: 400px; margin:auto;">
            <p style="text-align:center; color:#ccc; margin-top:15px;">Plaque reads: <code style="font-size:1.2em; color:gold; background: #333; padding: 5px;">EST. 1888</code></p>
        `;
        inputArea.innerHTML = `<label for="text-input">Vault Combination:</label> <input type="text" id="text-input" placeholder="4 Digits" maxlength="4" inputmode="numeric"> <button id="submit-button">Unlock Vault</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }

    // --- Check Logic (Combined Function) ---
    function checkAnswer(level, data) {
        const levelData = levelsData[level];
        if (!levelData) return;
        let isCorrect = false;

        switch (levelData.checkType) {
            case 'multiClickExact':
                 if (!levelState.clickedItems) levelState.clickedItems = new Set();
                 const element = data.element; const id = data.id;
                 element.classList.toggle('active'); // Toggle visual state for gears
                 if (levelState.clickedItems.has(id)) levelState.clickedItems.delete(id);
                 else levelState.clickedItems.add(id);

                 if (levelState.clickedItems.size === levelData.correctAnswer.length) {
                     isCorrect = levelData.correctAnswer.every(correctId => levelState.clickedItems.has(correctId));
                     if (isCorrect) handleCorrectAnswer();
                     else handleIncorrectAnswer("Incorrect gear combination. Try again.");
                 } else if(feedbackArea){
                     feedbackArea.textContent = `${levelState.clickedItems.size} of ${levelData.correctAnswer.length} gears engaged...`;
                     feedbackArea.className = 'feedback-hint';
                 }
                break; // Prevent fall-through

            case 'textInput':
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer(level === 2 ? "Incorrect pressure reading." : "Vault combination incorrect.");
                break;

            case 'hotspot': // Level 3 Orrery
                isCorrect = (data === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer("That lens doesn't seem to align anything useful.");
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
        else if (levelData.checkType === 'multiClickExact') checkAnswer(currentLevel, { id: clickedId, element: targetElement });
    }

    // --- Game Flow Logic (Simplified - assumes standard functions exist) ---
    function loadLevel(levelNumber) { if (levelNumber > totalLevels) { showCompletion(); return; } if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading puzzle."; feedbackArea.className = 'feedback-incorrect'; } return; } currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber]; if(puzzleInstructions) puzzleInstructions.textContent = level.instructions; if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; } if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="padding:50px; color:#aaa;">Loading...</p>'; level.setupFunction(); }
    function handleCorrectAnswer() { if(feedbackArea) { feedbackArea.textContent = "Correct! The mechanism clicks..."; feedbackArea.className = 'feedback-correct'; } setTimeout(() => { loadLevel(currentLevel + 1); }, 1500); }
    function handleIncorrectAnswer(message) { if(feedbackArea) { feedbackArea.textContent = message || "Nothing seems to happen."; feedbackArea.className = 'feedback-incorrect'; } if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); } const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop(); if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') { fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} }).then(response => response.json()).then(data => { if(data.success) console.log(`Error reported for ${currentRoomId}. Total: ${data.errors}`); else console.warn(`Failed report: ${data.message}`);}).catch(error => console.error('Error reporting error:', error)); } }
    function showCompletion() { const pf = document.getElementById('puzzle-frame'); const ia = document.getElementById('input-area'); if(pf) pf.style.display = 'none'; if(ia) ia.style.display = 'none'; if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { console.warn("Completion section not found."); } }

    // --- Initialization ---
    loadLevel(1);
    console.log("Steampunk Library Initialized");
});