// static/js/sunken_ship.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sunken Ship JS Loaded");
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Sunken Ship Error: Missing essential HTML elements."); return;
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {}; // For lock combination etc.

    const levelsData = [ null,
        { // Level 1: Find the Captain's Key
            instructions: "Search the Captain's Cabin for the rusted key.",
            setupFunction: setupLevel1,
            correctAnswer: 'cabin-key-spot', // data-id
            checkType: 'hiddenObject'
        },
        { // Level 2: Decode the Map Fragment
            instructions: "The key opened a small chest containing a map fragment with symbols. Decode the number based on the ship's wheel.",
            setupFunction: setupLevel2, // Shows map + wheel
            correctAnswer: '815', // Example: 8 spokes, symbol 1, symbol 5
            checkType: 'textInput'
        },
        { // Level 3: Open the Treasure Chest Lock
            instructions: "Enter the 3-digit combination found from the map to open the main treasure chest.",
            setupFunction: setupLevel3, // Shows chest with dials
            correctAnswer: '815', // Matches previous answer
            checkType: 'combinationLock' // Special check type
        },
        { // Level 4: Identify the True Treasure
            instructions: "The chest is full of trinkets, but only one item matches the description in the hidden logbook. Find the Kraken Medallion.",
            setupFunction: setupLevel4, // Shows open chest contents
            correctAnswer: 'kraken-medallion', // data-id
            checkType: 'hiddenObject'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/ship_cabin_placeholder.jpg" alt="Captain's Cabin" style="width:100%; height:auto; max-height: 450px;">
            <div class="hotspot" data-id="loose-plank" title="Loose Plank" style="top: 80%; left: 25%; width: 15%; height: 8%;"></div>
            <div class="hotspot" data-id="cabin-key-spot" title="Under the Chart" style="top: 40%; left: 65%; width: 10%; height: 7%;"></div>
            <div class="hotspot" data-id="old-bottle" title="Old Bottle" style="top: 60%; left: 10%; width: 6%; height: 12%;"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }
    function setupLevel2() {
        puzzleDisplay.style.flexDirection = 'column'; // Stack items
        puzzleDisplay.innerHTML = `
            <img src="/static/images/ship_map_fragment_placeholder.jpg" alt="Map Fragment" style="width:70%; height:auto; max-height: 250px; margin-bottom: 15px;">
            <img src="/static/images/ship_wheel_placeholder.jpg" alt="Ship's Wheel (8 spokes)" style="width:50%; height:auto; max-height: 150px;">
            <p style="color:#ccc; text-align:center;">Map Symbols: Wheel Spoke Count, Skull Symbol (1), Anchor Symbol (5)</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Enter Number:</label> <input type="text" id="text-input" placeholder="3 Digits" maxlength="3" inputmode="numeric"> <button id="submit-button">Submit Code</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }
    function setupLevel3() {
        levelState = { combination: ['0', '0', '0'] }; // Store current combo state
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/ship_treasure_chest_placeholder.jpg" alt="Treasure Chest" class="treasure-chest" style="width:60%; height:auto; max-height: 300px; margin: 20px auto;">
            <div id="combination-lock" style="text-align:center; margin-top: 15px;">
                <span class="lock-dial" data-dial="0">0</span>
                <span class="lock-dial" data-dial="1">0</span>
                <span class="lock-dial" data-dial="2">0</span>
            </div>
            <button id="try-lock-button" class="cta-button" style="margin: 20px auto; display: block;">Try Lock</button>
        `;
        inputArea.style.display = 'none'; // Using custom lock interface
        attachLockListeners();
    }
     function setupLevel4() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/ship_chest_open_placeholder.jpg" alt="Open Treasure Chest" style="width:100%; height:auto; max-height: 450px;">
             <p style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.7); color:#ccc; padding:5px; border-radius:3px; font-size:0.9em;">Logbook: '...only the Medallion bearing the mark of the deep beast...'</p>
            <div class="hotspot" data-id="gold-coins" title="Gold Coins" style="top: 50%; left: 20%; width: 20%; height: 20%;"></div>
            <div class="hotspot" data-id="kraken-medallion" title="Kraken Medallion" style="top: 75%; left: 60%; width: 12%; height: 15%;"></div> 
            <div class="hotspot" data-id="silver-goblet" title="Silver Goblet" style="top: 30%; left: 50%; width: 15%; height: 25%;"></div>
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
            case 'hiddenObject': // Levels 1 & 4
                isCorrect = (data === levelData.correctAnswer);
                if (isCorrect) {
                     const foundElement = puzzleDisplay.querySelector(`[data-id="${data}"]`);
                     if(foundElement) foundElement.style.border = '3px solid lime';
                     handleCorrectAnswer();
                 } else { handleIncorrectAnswer("Nothing of interest there."); }
                break;
            case 'textInput': // Level 2
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("That number doesn't match the map's clues.");
                break;
            case 'combinationLock': // Level 3 - data is the entered combo array
                isCorrect = (data.join('') === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("The lock clicks, but doesn't open.");
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
        if (levelData.checkType === 'hiddenObject') checkAnswer(currentLevel, clickedId);
    }
    // Level 3 Lock Listeners
    function attachLockListeners() {
        const dials = document.querySelectorAll('.lock-dial');
        dials.forEach(dial => {
            dial.onclick = () => cycleDial(dial);
        });
        const tryButton = document.getElementById('try-lock-button');
        if(tryButton) tryButton.onclick = () => checkAnswer(currentLevel, levelState.combination);
    }
    function cycleDial(dialElement) {
        const dialIndex = parseInt(dialElement.dataset.dial);
        let currentValue = parseInt(levelState.combination[dialIndex]);
        currentValue = (currentValue + 1) % 10; // Cycle 0-9
        levelState.combination[dialIndex] = currentValue.toString();
        dialElement.textContent = currentValue;
    }

    // --- Game Flow Logic ---
    function loadLevel(levelNumber) { if (levelNumber > totalLevels) { showCompletion(); return; } if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading puzzle."; feedbackArea.className = 'feedback-incorrect'; } return; } currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber]; if(puzzleInstructions) puzzleInstructions.textContent = level.instructions; if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; } if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="padding:50px; color:#aaa;">Loading...</p>'; level.setupFunction(); }
    function handleCorrectAnswer() { if(feedbackArea) { feedbackArea.textContent = "Success! Something shifts..."; feedbackArea.className = 'feedback-correct'; } setTimeout(() => { loadLevel(currentLevel + 1); }, 1500); }
    function handleIncorrectAnswer(message) { if(feedbackArea) { feedbackArea.textContent = message || "It doesn't seem to work."; feedbackArea.className = 'feedback-incorrect'; } if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); } const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop(); if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') { fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} }).then(response => response.json()).then(data => { if(data.success) console.log(`Error reported for ${currentRoomId}. Total: ${data.errors}`); else console.warn(`Failed report: ${data.message}`);}).catch(error => console.error('Error reporting error:', error)); } }
    function showCompletion() { const pf = document.getElementById('puzzle-frame'); const ia = document.getElementById('input-area'); if(pf) pf.style.display = 'none'; if(ia) ia.style.display = 'none'; if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { console.warn("Completion section not found."); } }

    // --- Initialization ---
    loadLevel(1);
    console.log("Sunken Ship Initialized");
});