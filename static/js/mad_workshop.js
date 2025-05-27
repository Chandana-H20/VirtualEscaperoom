// static/js/mad_workshop.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Mad Scientist's Workshop JS Loaded");
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Mad Workshop Error: Missing essential HTML elements."); return;
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {}; // Reset for each level load

    // --- Wire Cutting Data (Level 3) ---
    const wireColors = ['red', 'blue', 'yellow', 'green', 'black']; // Keep for Lvl 3
    const wireToCut = 'yellow'; // Keep for Lvl 3

    // --- UPDATED Level Data ---
    const levelsData = [ null,
        { // Level 1: Decipher Formula from Notes
            instructions: "Dr. Flinklestein's notes for the Elixir formula are scattered! Find the pieces and enter the complete chemical formula.",
            setupFunction: setupLevel1, // NEW Setup
            correctAnswer: 'H2SO4', // Example Formula
            checkType: 'textInput_L1' // Use specific text input check
        },
        { // Level 2: Decipher Formula Name (Keep as before)
            instructions: "The formula synthesized a gas revealing letters on the chalkboard: E L I X I R   O F   B R I L L I _ _ _ _ _ _ _. Find the missing letters (they rhyme with 'alliance').",
            setupFunction: setupLevel2,
            correctAnswer: 'ANCE',
            checkType: 'textInput_L2'
        },
        { // Level 3: Fix the Tesla Coil (Keep as before)
            instructions: "Sparks fly! The Tesla Coil wiring is faulty. The manual says 'Always cut the wire that shines like the sun'. Click the wire to cut.",
            setupFunction: setupLevel3,
            correctAnswer: wireToCut,
            checkType: 'wireCut'
        },
        { // Level 4: Activate the Contraption (Keep as before)
            instructions: "Enter the full Elixir name into the contraption's input panel to activate it.",
            setupFunction: setupLevel4,
            correctAnswer: 'ELIXIR OF BRILLIANCE',
            checkType: 'textInput_L4'
        }
    ];

    // --- Setup Functions ---

    // --- NEW setupLevel1 ---
    function setupLevel1() {
        levelState = {}; // Reset state
        puzzleDisplay.style.flexDirection = 'initial'; // Reset flex
        puzzleDisplay.innerHTML = `
            <img src="/static/images/workshop_clutter_placeholder.jpg" alt="Mad Scientist's Workshop Clutter" style="width:100%; height:auto; max-height: 450px;">
           
            <div class="hotspot note-fragment" data-fragment="SO" title="Note Fragment 1" style="top: 15%; left: 65%; width: 10%; height: 8%; transform: rotate(15deg);"></div>
            <div class="hotspot note-fragment" data-fragment="H2" title="Note Fragment 2" style="top: 70%; left: 20%; width: 9%; height: 10%; transform: rotate(-10deg);"></div>
            <div class="hotspot note-fragment" data-fragment="4" title="Note Fragment 3" style="top: 40%; left: 45%; width: 7%; height: 7%; transform: rotate(5deg);"></div>
            
            <div class="hotspot" title="Empty Beaker" style="top: 60%; left: 80%; width: 8%; height: 12%;"></div>
            <div class="hotspot" title="Sparking Wire" style="top: 85%; left: 55%; width: 15%; height: 5%;"></div>
        `;
        // Set up the input area for the formula
        inputArea.innerHTML = `
            <label for="text-input">Enter Chemical Formula:</label>
            <input type="text" id="text-input" placeholder="e.g., NaCl">
            <button id="submit-button">Submit Formula</button>
        `;
        inputArea.style.display = 'block'; // Show input area for Level 1
        // Add listeners to notes and submit button
        attachInteractionListeners('.note-fragment'); // Make notes clickable (optional)
        attachSubmitListener(); // Make submit button work
    }
    // --- END NEW setupLevel1 ---

    // --- Keep setupLevel2, setupLevel3, setupLevel4 as before ---
    function setupLevel2() {
        levelState = {}; // Reset state
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
             <div class="formula-display" style="margin: auto; width: 80%; max-width: 500px;">
                 E L I X I R   O F   B R I L L I _ _ _ _ _ _ _
             </div>
             <p style="width: 100%; text-align:center; color: #ccc; margin-top: 15px;">(Hint: Rhymes with 'alliance')</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Missing Letters:</label> <input type="text" id="text-input" placeholder="" maxlength="4"> <button id="submit-button">Submit</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }
    function setupLevel3() {
        levelState = { cutWire: null };
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/workshop_teslacoil_placeholder.jpg" alt="Tesla Coil Wiring" style="width:60%; height:auto; max-height: 300px; margin: 15px auto;">
            <p style="color:#ccc; text-align:center;">Warning! Unstable energy detected!</p>
            <div id="wire-box">
                ${wireColors.map((color, index) => `
                    <div class="wire" data-id="${color}" title="Cut ${color} wire" style="--wire-color: ${color}; top: ${15 + index * 16}%;"></div>
                `).join('')}
            </div>
             <p style="color:#ccc; text-align:center; font-size:0.9em;">Manual: 'Cut the wire that shines like the sun'</p>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.wire');
    }
     function setupLevel4() {
        levelState = {}; // Reset state
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
             <img src="/static/images/workshop_contraption_placeholder.jpg" alt="Contraption Input" style="width:80%; height:auto; max-height: 400px; margin:auto;">
             <p style="position:absolute; top: 10%; left: 10%; background:rgba(0,0,0,0.7); padding:5px; color:#ccc;">Input Panel - Requires Elixir Name</p>
        `;
        inputArea.innerHTML = `<label for="text-input">Activate Contraption:</label> <input type="text" id="text-input" placeholder="Enter Elixir Name..."> <button id="submit-button">Activate</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }

    // --- Check Logic ---
     function checkAnswer(level, data) {
        const levelData = levelsData[level]; if (!levelData) return; let isCorrect = false;
        const inputElement = document.getElementById('text-input'); // Get input element commonly

        switch (levelData.checkType) {
            case 'textInput_L1': // Level 1 Formula
            case 'textInput_L2': // Level 2 Letters
            case 'textInput_L4': // Level 4 Full Name
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer(
                    level === 1 ? "That formula doesn't seem right..." :
                    level === 2 ? "Those letters don't fit the formula." :
                    "Activation failed. Incorrect name."
                );
                break;

            case 'wireCut': // Level 3
                 if (levelState.cutWire) { handleIncorrectAnswer("You already cut a wire!"); return; }
                 const wireId = data.id; const wireElement = data.element;
                 isCorrect = (wireId === levelData.correctAnswer);
                 wireElement.classList.add('cut'); levelState.cutWire = wireId;
                 if (isCorrect) handleCorrectAnswer();
                 else {
                     wireElement.classList.add('incorrect-flash');
                     handleIncorrectAnswer("Zzzzap! Wrong wire! Sparks fly!");
                     setTimeout(() => { wireElement.classList.remove('incorrect-flash'); }, 600);
                 }
                 break;

            case 'hotspot': // For L1 notes (optional interaction)
                 const noteElement = data.element;
                 const fragment = noteElement.dataset.fragment;
                 // Optional: Display fragment temporarily or highlight note
                 if(feedbackArea){
                     feedbackArea.textContent = `Found note fragment: "${fragment}"`;
                     feedbackArea.className = 'feedback-hint';
                     noteElement.style.border = '2px solid yellow'; // Highlight clicked note
                 }
                 break; // Don't advance level just by clicking notes

            default: console.warn("Unknown checkType in checkAnswer:", levelData.checkType);
        }
    }

    // --- Event Handling & Helpers ---
    function attachInteractionListeners(selector) {
        const elements = puzzleDisplay.querySelectorAll(selector);
        elements.forEach(el => {
            const newEl = el.cloneNode(true);
            if (el.parentNode) {
                 el.parentNode.replaceChild(newEl, el);
                 // Add different handlers based on class/type if needed
                 if (newEl.classList.contains('note-fragment')) {
                    newEl.addEventListener('click', handleNoteClick);
                 } else if (newEl.classList.contains('wire')) {
                    newEl.addEventListener('click', handleWireClick);
                 }
                 // Add other types as needed
            }
        });
    }
     function attachSubmitListener() {
         const button = document.getElementById('submit-button');
         const input = document.getElementById('text-input');
         const levelData = levelsData[currentLevel];
         // Check if the level type starts with 'textInput'
         if (levelData?.checkType?.startsWith('textInput')) {
             if(button) button.onclick = () => checkAnswer(currentLevel, null);
             if(input) input.onkeydown = (e) => { if (e.key === 'Enter') {e.preventDefault(); checkAnswer(currentLevel, null);} };
         }
     }
    // Specific handlers to call checkAnswer with correct data format
    function handleNoteClick(event) {
        const targetElement = event.target.closest('[data-id]');
        if (!targetElement) return;
        checkAnswer(currentLevel, { type: 'hotspot', element: targetElement });
    }
    function handleWireClick(event) {
        const targetElement = event.target.closest('[data-id]');
        if (!targetElement) return;
        checkAnswer(currentLevel, { type: 'wireCut', id: targetElement.dataset.id, element: targetElement });
    }


    // --- Game Flow Logic (Standard Structure) ---
    function loadLevel(levelNumber) { if (levelNumber > totalLevels) { showCompletion(); return; } if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading experiment."; feedbackArea.className = 'feedback-incorrect'; } return; } currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber]; if(puzzleInstructions) puzzleInstructions.textContent = level.instructions; if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; } if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="padding:50px; color:#aaa;">Setting up equipment...</p>'; level.setupFunction(); }
    function handleCorrectAnswer() { if(feedbackArea) { feedbackArea.textContent = "It worked! Something sparks to life..."; feedbackArea.className = 'feedback-correct'; } setTimeout(() => { loadLevel(currentLevel + 1); }, 1500); }
    function handleIncorrectAnswer(message) { if(feedbackArea) { feedbackArea.textContent = `FAILURE: ${message || "Something went wrong!"}`; feedbackArea.className = 'feedback-incorrect'; } if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); } const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop(); if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') { fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} }).then(r => r.json()).then(d => { if(d.success) console.log(`Err report: ${currentRoomId}. Total: ${d.errors}`); else console.warn(`Report fail: ${d.message}`);}).catch(e => console.error('Error reporting:', e)); } }
    function showCompletion() { const pf = document.getElementById('puzzle-frame'); const ia = document.getElementById('input-area'); if(pf) pf.style.display = 'none'; if(ia) ia.style.display = 'none'; if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else { console.warn("Completion section not found."); } }

    // --- Initialization ---
    loadLevel(1);
    console.log("Mad Scientist's Workshop Initialized");
});