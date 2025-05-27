// static/js/castle_siege.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Castle Siege JS Loaded");
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

     if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Castle Siege Error: Missing essential HTML elements."); return;
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {};

    const levelsData = [ null,
        { // Level 1: Identify Weak Point
            instructions: "The siege map shows potential weak points in the enemy formation. Click on the poorly defended Trebuchet.",
            setupFunction: setupLevel1,
            correctAnswer: 'weak-trebuchet',
            checkType: 'hotspot'
        },
        { // Level 2: Load the Catapult
            instructions: "Load the correct ammunition. The note says 'Use the stone blessed by the Sun'.",
            setupFunction: setupLevel2,
            correctAnswer: 'ammo-sunstone',
            checkType: 'hotspot' // Use hotspot check for ammo selection
        },
        { // Level 3: Aim the Catapult
            instructions: "Aim the catapult using the winch controls. Enter the correct angle (degrees) found on the targeting scroll.",
            setupFunction: setupLevel3,
            correctAnswer: '42',
            checkType: 'textInput'
        },
        { // Level 4: Fire the Catapult / Find Escape
            instructions: "Fire the catapult by pulling the lever OR find the loose stone mentioned in the king's decree to escape.",
            setupFunction: setupLevel4,
            correctAnswer: ['fire-lever', 'escape-stone'], // Can click either
            checkType: 'multiCorrectHotspot'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/castle_map_placeholder.jpg" alt="Siege Map" style="width:100%; height:auto; max-height: 450px;">
            <div class="hotspot" data-id="enemy-archers" title="Archers" style="top: 20%; left: 30%; width: 15%; height: 10%;"></div>
            <div class="hotspot" data-id="enemy-ram" title="Battering Ram" style="top: 70%; left: 50%; width: 10%; height: 15%;"></div>
            <div class="hotspot" data-id="weak-trebuchet" title="Trebuchet" style="top: 35%; left: 75%; width: 12%; height: 18%;"></div> 
            <div class="hotspot" data-id="enemy-knights" title="Knights" style="top: 60%; left: 15%; width: 18%; height: 12%;"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }
    function setupLevel2() {
        puzzleDisplay.style.flexDirection = 'row'; // Side-by-side or wrap
        puzzleDisplay.innerHTML = `
            <p style="width:100%; text-align:center; color: #ccc;">Select Ammunition (Note: 'Use stone blessed by Sun')</p>
            
            <div class="hotspot ammo-option" data-id="ammo-boulder" title="Plain Boulder">Boulder</div>
            <div class="hotspot ammo-option" data-id="ammo-firepot" title="Fire Pot">Fire Pot</div>
            <div class="hotspot ammo-option" data-id="ammo-sunstone" title="Sun Stone">Sun Stone</div> 
        `;
        inputArea.style.display = 'none';
        // Use the same listener, check type differentiates behavior
        attachInteractionListeners('.ammo-option');
    }
    function setupLevel3() {
        puzzleDisplay.style.flexDirection = 'initial'; // Or 'column' if needed
        puzzleDisplay.innerHTML = `
            <img src="/static/images/castle_catapult_placeholder.jpg" alt="Catapult Controls" style="width:70%; height:auto; max-height: 350px; margin:auto; display:block;">
            <p style="position:absolute; top: 10px; right: 10px; background: rgba(245, 222, 179, 0.8); color:#333; padding:8px; border: 1px solid peru; font-family: cursive;">Targeting Scroll:<br>Angle: 42°</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Set Angle:</label> <input type="text" id="text-input" placeholder="Degrees" inputmode="numeric"> <button id="submit-button">Lock Angle</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }
     function setupLevel4() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
             <img src="/static/images/castle_keep_placeholder.jpg" alt="Castle Keep Interior" style="width:100%; height:auto; max-height: 450px;">
             <p style="position:absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color:#ccc; padding:5px; font-size:0.9em;">King's Decree: '...the third stone left of the hearth hides the path...'</p>
             
             <div class="hotspot catapult-lever-hotspot" data-id="fire-lever" title="Pull Lever" style="position: absolute; top: 50%; left: 15%; width: 5%; height: 20%;"></div>
             <div class="hotspot escape-stone-hotspot" data-id="escape-stone" title="Loose Stone" style="position: absolute; bottom: 15%; left: 35%; width: 6%; height: 8%;"></div>
             <div class="hotspot" data-id="window-view" title="Window" style="position: absolute; top: 20%; left: 60%; width: 15%; height: 25%;"></div> 
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }

    // --- Check Logic ---
     function checkAnswer(level, data) {
        const levelData = levelsData[level]; if (!levelData) return; let isCorrect = false;
        switch (levelData.checkType) {
            case 'hotspot': // Levels 1, 2
                isCorrect = (data === levelData.correctAnswer);
                 if (isCorrect) {
                      const foundElement = puzzleDisplay.querySelector(`[data-id="${data}"]`);
                      if(foundElement) foundElement.style.border = '3px solid lime'; // Highlight correct choice
                      // Deactivate others for level 2
                      if(level === 2){
                          puzzleDisplay.querySelectorAll('.ammo-option').forEach(el => {
                              if(el.dataset.id !== data) el.style.opacity = '0.5';
                          });
                      }
                      handleCorrectAnswer();
                 } else { handleIncorrectAnswer(level === 1 ? "That point seems well defended." : "That's not the right ammunition."); }
                break;
            case 'textInput': // Level 3
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("The catapult aim seems off.");
                break;
            case 'multiCorrectHotspot': // Level 4
                isCorrect = levelData.correctAnswer.includes(data);
                 if (isCorrect) {
                     const foundElement = puzzleDisplay.querySelector(`[data-id="${data}"]`);
                     if(foundElement) foundElement.style.border = '3px solid lime';
                     handleCorrectAnswer();
                 } else { handleIncorrectAnswer("Nothing happens there."); }
                break;
            default: console.warn("Unknown checkType");
        }
    }

    // --- Event Handling & Game Flow (Standard Structure) ---
    function attachInteractionListeners(selector) { const els = puzzleDisplay.querySelectorAll(selector); els.forEach(el => { const newEl = el.cloneNode(true); if (el.parentNode) { el.parentNode.replaceChild(newEl, el); newEl.addEventListener('click', handleInteraction); } }); }
    function attachSubmitListener() { const btn = document.getElementById('submit-button'); const inp = document.getElementById('text-input'); const ld = levelsData[currentLevel]; if (ld?.checkType === 'textInput') { if(btn) btn.onclick = () => checkAnswer(currentLevel, null); if(inp) inp.onkeydown = (e) => { if (e.key === 'Enter') {e.preventDefault(); checkAnswer(currentLevel, null);} }; } }
    function handleInteraction(event) { const tgt = event.target.closest('[data-id]'); if (!tgt) return; const id = tgt.dataset.id; const ld = levelsData[currentLevel]; if (ld.checkType === 'hotspot' || ld.checkType === 'multiCorrectHotspot') checkAnswer(currentLevel, id); }
    function loadLevel(levelNumber) { if (levelNumber > totalLevels) { showCompletion(); return; } if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading challenge."; feedbackArea.className = 'feedback-incorrect'; } return; } currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber]; if(puzzleInstructions) puzzleInstructions.textContent = level.instructions; if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; } if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="padding:50px; color:#aaa;">Loading...</p>'; level.setupFunction(); }
    function handleCorrectAnswer() { if(feedbackArea) { feedbackArea.textContent = "Success! You proceed..."; feedbackArea.className = 'feedback-correct'; } setTimeout(() => { loadLevel(currentLevel + 1); }, 1500); }
    function handleIncorrectAnswer(message) { if(feedbackArea) { feedbackArea.textContent = message || "That didn't work."; feedbackArea.className = 'feedback-incorrect'; } if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); } const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop(); if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') { fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} }).then(r => r.json()).then(d => { if(d.success) console.log(`Err report: ${currentRoomId}. Total: ${d.errors}`); else console.warn(`Report fail: ${d.message}`);}).catch(e => console.error('Error reporting:', e)); } }
    function showCompletion() { const pf = document.getElementById('puzzle-frame'); const ia = document.getElementById('input-area'); if(pf) pf.style.display = 'none'; if(ia) ia.style.display = 'none'; if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { console.warn("Completion section not found."); } }

    // --- Initialization ---
    loadLevel(1);
    console.log("Castle Siege Initialized");
});