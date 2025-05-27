// static/js/alien_starship.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Alien Starship JS Loaded");
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Alien Starship Error: Missing essential HTML elements."); return;
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {};

    // --- Alien Symbol Mapping (Example) ---
    // You would replace these with actual symbols or image names if using images
    const alienSymbols = {
        triangle: '△', sphere: '○', square: '□',
        wave: '〰', star: '✧', hexagon: '⬡',
        crescent: '☾', lightning: '⚡'
    };
    // Correct sequence for Level 1
    const correctSymbolSequence = ['sphere', 'wave', 'hexagon']; // Example: ○〰⬡

    const levelsData = [ null,
        { // Level 1: Activate Console
            instructions: `The console displays flickering alien symbols. Activate the correct sequence shown on the damaged schematic: ${alienSymbols.sphere} ${alienSymbols.wave} ${alienSymbols.hexagon}`,
            setupFunction: setupLevel1,
            correctAnswer: correctSymbolSequence,
            checkType: 'sequence'
        },
        { // Level 2: Translate Message
            instructions: "A message appears: 'XELOS PRIME REQUIRES COORDINATES'. Use the translation key found on a nearby datapad (XELOS = 12345) to find the coordinate number for 'PRIME'.",
            setupFunction: setupLevel2, // Shows message and key
            correctAnswer: '90672', // P=9, R=0, I=6, M=7, E=2 (Example mapping)
            checkType: 'textInput'
        },
        { // Level 3: Route Power
            instructions: "Warp drive power is low. Route power by clicking the glowing conduits connecting the Primary Core to the Warp Nacelle.",
            setupFunction: setupLevel3, // Shows conduit layout
            correctAnswer: ['conduit-1', 'conduit-3', 'conduit-5'], // Example data-ids of correct conduits
            checkType: 'multiClickExact'
        },
        { // Level 4: Engage Warp Drive
            instructions: "Power routed. Enter the final command: 'ENGAGE WARP' followed by the coordinate number from Level 2.",
            setupFunction: setupLevel4, // Shows final console prompt
            correctAnswer: 'ENGAGE WARP 90672', // Example command
            checkType: 'textInput'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        levelState = { clickSequence: [] };
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/starship_console_placeholder.jpg" alt="Alien Console" style="width:100%; height:auto; max-height: 400px;">
            <p style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.6); color:#ccc; padding:5px; font-size:0.9em;">Schematic: ${alienSymbols.sphere} ${alienSymbols.wave} ${alienSymbols.hexagon}</p>
            <div id="alien-symbols-container" style="position:absolute; bottom: 10%; left: 50%; transform: translateX(-50%); display:flex; gap: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
                <span class="alien-symbol" data-id="triangle">${alienSymbols.triangle}</span>
                <span class="alien-symbol" data-id="sphere">${alienSymbols.sphere}</span>
                <span class="alien-symbol" data-id="square">${alienSymbols.square}</span>
                <span class="alien-symbol" data-id="wave">${alienSymbols.wave}</span>
                <span class="alien-symbol" data-id="star">${alienSymbols.star}</span>
                <span class="alien-symbol" data-id="hexagon">${alienSymbols.hexagon}</span>
            </div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.alien-symbol');
    }
    function setupLevel2() {
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
            <div class="console-text" style="width: 80%; margin: 20px auto;">CONSOLE: XELOS PRIME REQUIRES COORDINATES</div>
            <div class="console-text" style="width: 80%; margin: 10px auto;">DATAPAD KEY: X=1 E=2 L=3 O=4 S=5 | P=9 R=0 I=6 M=7</div>
        `;
        inputArea.innerHTML = `<label for="text-input">Coordinate Number (PRIME):</label> <input type="text" id="text-input" placeholder="Enter number..."> <button id="submit-button">Transmit</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }
    function setupLevel3() {
        levelState = { clickedItems: new Set() };
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/starship_power_grid_placeholder.jpg" alt="Power Grid" style="width:100%; height:auto; max-height: 450px;">
            <div class="power-conduit" data-id="conduit-1" style="top: 30%; left: 20%; width: 15%; height: 5%;"></div> 
            <div class="power-conduit" data-id="conduit-2" style="top: 50%; left: 30%; width: 10%; height: 5%;"></div>
            <div class="power-conduit" data-id="conduit-3" style="top: 45%; left: 45%; width: 20%; height: 5%;"></div> 
            <div class="power-conduit" data-id="conduit-4" style="top: 70%; left: 55%; width: 15%; height: 5%;"></div>
            <div class="power-conduit" data-id="conduit-5" style="top: 60%; left: 70%; width: 10%; height: 5%;"></div> 
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.power-conduit');
    }
     function setupLevel4() {
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
            <div class="console-text" style="width: 80%; margin: 20px auto;">CONSOLE: POWER ROUTED. AWAITING WARP ENGAGE COMMAND.</div>
            <p style="color:#ccc; text-align:center;">Format: ENGAGE WARP [Coordinate Number]</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Enter Command:</label> <input type="text" id="text-input" placeholder="ENGAGE WARP ..."> <button id="submit-button">Engage</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }

    // --- Check Logic ---
     function checkAnswer(level, data) {
        const levelData = levelsData[level]; if (!levelData) return; let isCorrect = false;
        switch (levelData.checkType) {
            case 'sequence': // Level 1 Symbols
                 if (!levelState.clickSequence) levelState.clickSequence = []; levelState.clickSequence.push(data.id);
                 const sequence = levelState.clickSequence; const correctSeq = levelData.correctAnswer;
                 data.element.classList.add('selected');
                 for (let i = 0; i < sequence.length; i++) {
                     if (sequence[i] !== correctSeq[i]) {
                         handleIncorrectAnswer("Incorrect symbol sequence. Console resets.");
                         setTimeout(() => { document.querySelectorAll('.alien-symbol.selected').forEach(el => el.classList.remove('selected')); levelState.clickSequence = []; }, 1000);
                         return;
                     }
                 }
                 if (sequence.length === correctSeq.length) handleCorrectAnswer();
                 else if(feedbackArea) { feedbackArea.textContent = `Symbol ${sequence.length} of ${correctSeq.length} entered...`; feedbackArea.className = 'feedback-hint'; }
                break;
            case 'textInput': // Levels 2 & 4
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer(level === 2 ? "Translation Incorrect." : "Command Unrecognized.");
                break;
            case 'multiClickExact': // Level 3 Conduits
                 if (!levelState.clickedItems) levelState.clickedItems = new Set();
                 const element = data.element; const id = data.id;
                 element.style.backgroundColor = 'lime'; // Simple visual feedback
                 levelState.clickedItems.add(id);
                 if (levelState.clickedItems.size === levelData.correctAnswer.length) {
                     isCorrect = levelData.correctAnswer.every(correctId => levelState.clickedItems.has(correctId));
                     if (isCorrect) handleCorrectAnswer();
                     else {
                         handleIncorrectAnswer("Incorrect power routing. Resetting conduits.");
                         setTimeout(() => { document.querySelectorAll('.power-conduit').forEach(el => el.style.backgroundColor = 'rgba(0, 229, 255, 0.3)'); levelState.clickedItems.clear(); }, 1000);
                     }
                 } else if (levelState.clickedItems.size > levelData.correctAnswer.length) {
                      handleIncorrectAnswer("Too many conduits selected. Resetting.");
                      setTimeout(() => { document.querySelectorAll('.power-conduit').forEach(el => el.style.backgroundColor = 'rgba(0, 229, 255, 0.3)'); levelState.clickedItems.clear(); }, 1000);
                 } else if(feedbackArea){ feedbackArea.textContent = `${levelState.clickedItems.size} of ${levelData.correctAnswer.length} conduits active...`; feedbackArea.className = 'feedback-hint'; }
                break;
            default: console.warn("Unknown checkType");
        }
    }

    // --- Event Handling & Game Flow (Keep standard structure) ---
    function attachInteractionListeners(selector) { const els = puzzleDisplay.querySelectorAll(selector); els.forEach(el => { const newEl = el.cloneNode(true); if (el.parentNode) { el.parentNode.replaceChild(newEl, el); newEl.addEventListener('click', handleInteraction); } }); }
    function attachSubmitListener() { const btn = document.getElementById('submit-button'); const inp = document.getElementById('text-input'); const ld = levelsData[currentLevel]; if (ld?.checkType === 'textInput') { if(btn) btn.onclick = () => checkAnswer(currentLevel, null); if(inp) inp.onkeydown = (e) => { if (e.key === 'Enter') {e.preventDefault(); checkAnswer(currentLevel, null);} }; } }
    function handleInteraction(event) { const tgt = event.target.closest('[data-id]'); if (!tgt) return; const id = tgt.dataset.id; const ld = levelsData[currentLevel]; if (ld.checkType === 'sequence' || ld.checkType === 'multiClickExact') checkAnswer(currentLevel, { id: id, element: tgt }); else if (ld.checkType === 'hotspot') checkAnswer(currentLevel, id); }
    function loadLevel(levelNumber) { if (levelNumber > totalLevels) { showCompletion(); return; } if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading systems."; feedbackArea.className = 'feedback-incorrect'; } return; } currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber]; if(puzzleInstructions) puzzleInstructions.textContent = level.instructions; if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; } if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="padding:50px; color:#aaa;">Loading interface...</p>'; level.setupFunction(); }
    function handleCorrectAnswer() { if(feedbackArea) { feedbackArea.textContent = "Acknowledged. Proceeding..."; feedbackArea.className = 'feedback-correct'; } setTimeout(() => { loadLevel(currentLevel + 1); }, 1500); }
    function handleIncorrectAnswer(message) { if(feedbackArea) { feedbackArea.textContent = `SYSTEM ERROR: ${message || "Input Rejected."}`; feedbackArea.className = 'feedback-incorrect'; } if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); } const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop(); if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') { fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} }).then(r => r.json()).then(d => { if(d.success) console.log(`Err report: ${currentRoomId}. Total: ${d.errors}`); else console.warn(`Report fail: ${d.message}`);}).catch(e => console.error('Error reporting:', e)); } }
    function showCompletion() { const pf = document.getElementById('puzzle-frame'); const ia = document.getElementById('input-area'); const tl = document.getElementById('terminal-input-line'); if(pf) pf.style.display = 'none'; if(ia) ia.style.display = 'none'; if(tl) tl.style.display = 'none'; if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { console.warn("Completion section not found."); } }

    loadLevel(1); console.log("Alien Starship Initialized");
});