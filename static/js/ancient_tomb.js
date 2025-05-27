// static/js/ancient_tomb.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Ancient Tomb JS Loaded");

    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {};

    // --- Level Definitions (Level 4 Corrected) ---
    const levelsData = [ null,
        { // Level 1: Sealed Door
            instructions: "The stone door is sealed by ancient magic. Touch the correct symbol to gain passage.",
            setupFunction: setupLevel1,
            correctAnswer: 'eye-of-horus', // data-id of the correct hotspot
            checkType: 'hotspot'
        },
        { // Level 2: Serpent Puzzle
            instructions: "Carvings of intertwined serpents line the walls. How many heads can you count?",
            setupFunction: setupLevel2,
            correctAnswer: '7', // The correct number of heads
            checkType: 'textInput'
        },
        { // Level 3: Canopic Jars
            instructions: "Place the Canopic Jars onto the altar slots in the correct order: Imsety (Liver), Hapy (Lungs), Duamutef (Stomach), Qebehsenuef (Intestines).",
            setupFunction: setupLevel3,
            correctAnswer: ['imsety', 'hapy', 'duamutef', 'qebehsenuef'], // Correct click order ID sequence
            checkType: 'sequenceOrder'
        },
         { // Level 4: Find the Sceptre (Corrected)
            instructions: "The Pharaoh's Sceptre grants passage, but it's hidden within this chamber. Find it.",
            setupFunction: setupLevel4, // Uses hotspot setup
            correctAnswer: 'sceptre-location', // The data-id of the correct hotspot
            checkType: 'hiddenObject' // Use hiddenObject check type
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `
            <img src="/static/images/tomb_door_placeholder.jpg" alt="Sealed Stone Door" style="width:100%; height:auto; max-height: 450px;">
            <div class="hotspot" data-id="scarab" style="top: 30%; left: 20%; width: 15%; height: 20%;" title="Scarab Symbol"></div>
            <div class="hotspot" data-id="ankh" style="top: 60%; left: 65%; width: 18%; height: 25%;" title="Ankh Symbol"></div>
            <div class="hotspot" data-id="eye-of-horus" style="top: 45%; left: 42%; width: 16%; height: 15%;" title="Eye of Horus Symbol"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }

    function setupLevel2() {
        puzzleDisplay.style.flexDirection = 'initial';
        puzzleDisplay.innerHTML = `<img src="/static/images/tomb_serpents_placeholder.jpg" alt="Intertwined Serpents Carving" style="width:100%; height:auto; max-height: 450px;">`;
        inputArea.innerHTML = `<label for="text-input">Number of Heads:</label> <input type="text" id="text-input" placeholder="Enter number..." inputmode="numeric" pattern="[0-9]*"> <button id="submit-button">Submit Count</button>`;
        inputArea.style.display = 'block';
        attachSubmitListener();
    }

    function setupLevel3() {
        levelState = { placedOrder: new Array(4).fill(null), currentJar: null };
        puzzleDisplay.style.flexDirection = 'column';
        puzzleDisplay.innerHTML = `
            <div id="jar-inventory">
                 <p style="color:#ccc;">Canopic Jars (Click to select, then click an altar slot):</p>
                 <div class="canopic-jar-item" id="jar-imsety" data-id="imsety" title="Imsety (Liver)">Imsety</div>
                 <div class="canopic-jar-item" id="jar-hapy" data-id="hapy" title="Hapy (Lungs)">Hapy</div>
                 <div class="canopic-jar-item" id="jar-duamutef" data-id="duamutef" title="Duamutef (Stomach)">Duamutef</div>
                 <div class="canopic-jar-item" id="jar-qebehsenuef" data-id="qebehsenuef" title="Qebehsenuef (Intestines)">Qeb.</div>
            </div>
            <div id="altar-slots">
                 <p style="color:#ccc;">Altar Slots (Order: Liver, Lungs, Stomach, Intestines):</p>
                 <div class="altar-slot" data-slot-index="0"></div>
                 <div class="altar-slot" data-slot-index="1"></div>
                 <div class="altar-slot" data-slot-index="2"></div>
                 <div class="altar-slot" data-slot-index="3"></div>
            </div>
        `;
        inputArea.style.display = 'none';
        attachJarListeners();
    }

    // --- CORRECTED setupLevel4 ---
    function setupLevel4() {
         levelState = {}; // Reset state if needed
         puzzleDisplay.style.flexDirection = 'initial'; // Reset flex
         puzzleDisplay.innerHTML = `
             <img src="/static/images/tomb_chamber_placeholder.jpg" alt="Pharaoh's Tomb Chamber" style="width:100%; height:auto; max-height: 450px;">
             <div class="hotspot" data-id="sceptre-location" title="Examine Sceptre" style="top: 70%; left: 75%; width: 5%; height: 15%;"></div>
             <div class="hotspot" data-id="false-idol-1" title="Examine Idol" style="top: 50%; left: 15%; width: 10%; height: 20%;"></div>
             <div class="hotspot" data-id="false-vase" title="Examine Vase" style="top: 80%; left: 45%; width: 8%; height: 12%;"></div>
         `;
         inputArea.style.display = 'none';
         attachInteractionListeners('.hotspot');
    }
    // --- END CORRECTION ---

    // --- Check Logic ---
    function checkAnswer(level, data) {
        const levelData = levelsData[level];
        if (!levelData) return;
        let isCorrect = false;
        switch (levelData.checkType) {
            case 'hotspot': // Level 1
                isCorrect = (data === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer("The symbol glows faintly, but nothing happens.");
                break;
            case 'hiddenObject': // Level 4
                isCorrect = (data === levelData.correctAnswer);
                 if (isCorrect) {
                     // Optional: Highlight the found object explicitly
                     const foundElement = puzzleDisplay.querySelector(`[data-id="${data}"]`);
                     if (foundElement) {
                         foundElement.style.border = '3px solid lime'; // Make it obvious
                         foundElement.style.boxShadow = '0 0 15px lime';
                     }
                     handleCorrectAnswer();
                 } else {
                     handleIncorrectAnswer("Just dust and shadows here...");
                 }
                break;
            case 'textInput': // Level 2
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("That count seems incorrect."); // More specific message
                break;
            case 'sequence': // Not used in L1-4 anymore, but kept for completeness if structure changes
                 // ... (sequence checking logic for L4 symbols if it were still used) ...
                break;
             case 'sequenceOrder': // Level 3 logic is handled entirely by placeJar
                 break;
            default: console.warn("Unknown checkType");
        }
    }

    // --- Event Handling ---
    function attachInteractionListeners(selector) {
        const elements = puzzleDisplay.querySelectorAll(selector);
        elements.forEach(el => {
            const newEl = el.cloneNode(true);
            if (el.parentNode) {
                 el.parentNode.replaceChild(newEl, el);
                 newEl.addEventListener('click', handleInteraction);
            }
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
        // Pass clickedId for hotspot/hiddenObject checks
        if (levelData.checkType === 'hotspot' || levelData.checkType === 'hiddenObject') {
             checkAnswer(currentLevel, clickedId);
        }
        // Add handling for other types if necessary (like sequence)
        // else if (levelData.checkType === 'sequence') {
        //     checkAnswer(currentLevel, { id: clickedId, element: targetElement });
        // }
    }

     // --- Specific Listeners/Handlers for Level 3 ---
     function attachJarListeners() { // Keep as before
         document.querySelectorAll('.canopic-jar-item').forEach(jar => {
             const newJar = jar.cloneNode(true);
             if(jar.parentNode) jar.parentNode.replaceChild(newJar, jar);
             newJar.onclick = () => selectJar(newJar);
         });
         document.querySelectorAll('.altar-slot').forEach(slot => {
             const newSlot = slot.cloneNode(true);
              if(slot.parentNode) slot.parentNode.replaceChild(newSlot, slot);
             newSlot.onclick = () => placeJar(newSlot);
         });
     }
    function selectJar(jarElement) { // Keep as before
         if (jarElement.classList.contains('placed')) return;
         document.querySelectorAll('.canopic-jar-item.selected').forEach(j => j.classList.remove('selected'));
         jarElement.classList.add('selected');
         levelState.currentJar = jarElement;
         if(feedbackArea) feedbackArea.textContent = `Selected ${jarElement.title || jarElement.dataset.id}. Click an altar slot.`;
         feedbackArea.className = '';
     }
     function placeJar(slotElement) { // Keep as before
         const slotIndex = parseInt(slotElement.dataset.slotIndex);
         const currentJar = levelState.currentJar;
         if (!currentJar || slotElement.classList.contains('filled')) { handleIncorrectAnswer("Select an available jar first or slot is already filled."); return; }
         const jarId = currentJar.dataset.id;
         const correctOrder = levelsData[currentLevel].correctAnswer;
         slotElement.className = `altar-slot filled jar-${jarId}`;
         slotElement.dataset.placedId = jarId;
         currentJar.classList.add('placed'); currentJar.classList.remove('selected');
         if (!levelState.placedOrder) levelState.placedOrder = new Array(4).fill(null);
         levelState.placedOrder[slotIndex] = jarId;
         levelState.currentJar = null;
         const filledSlots = document.querySelectorAll('.altar-slot.filled').length;
         if (filledSlots === correctOrder.length) {
             let placementCorrect = correctOrder.every((id, index) => levelState.placedOrder[index] === id);
             if (placementCorrect) handleCorrectAnswer();
             else {
                 handleIncorrectAnswer("The jars are in the wrong order. They reset.");
                 setTimeout(() => {
                     document.querySelectorAll('.altar-slot').forEach(s => { s.className = 'altar-slot'; delete s.dataset.placedId; });
                     document.querySelectorAll('.canopic-jar-item').forEach(s => { s.classList.remove('placed','selected'); s.style.cursor = 'pointer';});
                     levelState.placedOrder = new Array(4).fill(null);
                 }, 1500);
             }
         } else if(feedbackArea) { feedbackArea.textContent = `${filledSlots} of ${correctOrder.length} jars placed...`; feedbackArea.className = 'feedback-hint'; }
     }

    // --- Game Flow Logic ---
    function loadLevel(levelNumber) { // Keep as before
        if (levelNumber > totalLevels) { showCompletion(); return; }
        if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading puzzle."; feedbackArea.className = 'feedback-incorrect'; } return; }
        currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber];
        if(puzzleInstructions) puzzleInstructions.textContent = level.instructions;
        if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; }
        if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="text-align:center; padding: 50px; color: #aaa;">Loading...</p>';
        level.setupFunction();
    }
    function handleCorrectAnswer() { // Keep as before
        if(feedbackArea) { feedbackArea.textContent = "Correct! The mechanism responds..."; feedbackArea.className = 'feedback-correct'; }
        setTimeout(() => { loadLevel(currentLevel + 1); }, 1500);
    }
    function handleIncorrectAnswer(message) { // Keep as before (with error reporting)
        if(feedbackArea) { feedbackArea.textContent = message || "Nothing happens..."; feedbackArea.className = 'feedback-incorrect'; }
        if(puzzleFrame) { puzzleFrame.classList.add('shake'); setTimeout(() => puzzleFrame.classList.remove('shake'), 500); }
        // Report Error
        const currentRoomId = document.body.querySelector('.escape-room-content')?.dataset.roomId || window.location.pathname.split('/').pop();
        if (currentRoomId && currentRoomId !== 'room' && currentRoomId !== 'start_room') {
            fetch(`/report_error/${currentRoomId}`, { method: 'POST', headers: {'Content-Type': 'application/json'} })
                .then(response => response.json()).then(data => { if(data.success) console.log(`Error reported for ${currentRoomId}. Total: ${data.errors}`); else console.warn(`Failed to report error: ${data.message}`);})
                .catch(error => console.error('Error reporting incorrect answer:', error));
        } else { console.warn("Could not determine room ID for error report."); }
    }
    function showCompletion() { // Keep as before
        const puzzleFrameElement = document.getElementById('puzzle-frame');
        if(puzzleFrameElement) puzzleFrameElement.style.display = 'none';
        if(inputArea) inputArea.style.display = 'none';
        if(completionSection) { completionSection.style.display = 'block'; completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        else { console.warn("Completion section not found."); }
    }

    // --- Initialization ---
    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
         console.error("Ancient Tomb: Missing one or more essential HTML elements.");
    } else {
        loadLevel(1);
        console.log("Ancient Tomb Initialized");
    }
});