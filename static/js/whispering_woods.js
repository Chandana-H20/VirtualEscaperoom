// static/js/whispering_woods.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Whispering Woods JS Loaded");

    // Get DOM elements (ensure these IDs exist in whispering_woods.html)
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content');

    // Check if essential elements exist
    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Whispering Woods Error: One or more essential HTML elements not found (puzzle-display, puzzle-instructions, input-area, feedback-area, completion-section). Aborting script.");
        return; // Stop execution if elements are missing
    }

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = {}; // Store state like sequences, clicks

    // --- Level Data ---
    const levelsData = [ null, // Index 0 unused
        { // Level 1: Matching Runestones
            instructions: "A pattern is shown on the ancient oak. Touch the matching runes carved into its bark.",
            setupFunction: setupLevel1,
            correctAnswer: ['rune-leaf', 'rune-water', 'rune-wind'],
            checkType: 'multiClickExact'
        },
        { // Level 2: Dryad's Riddle
            instructions: "A Dryad whispers a riddle from the leaves: 'I have cities, but no houses; forests, but no trees; and water, but no fish. What am I?'",
            setupFunction: setupLevel2,
            correctAnswer: 'A MAP', // Answer needs to be uppercase for comparison
            checkType: 'textInput'
        },
        { // Level 3: Arrange Sacred Stones (Using Canopic Jar CSS classes for now)
            instructions: "Place the Sacred Stones (Sun, Moon, Star) onto the altar slots in the order guided by the celestial cycle: Day, Night, Twilight.",
            setupFunction: setupLevel3,
            correctAnswer: ['sun', 'moon', 'star'],
            checkType: 'sequenceOrder'
        },
        { // Level 4: Warding Spell
            instructions: "To dispel the final barrier, chant the warding spell by touching the symbols in order: Water, Earth, Air, Fire.",
            setupFunction: setupLevel4,
            correctAnswer: ['symbol-water', 'symbol-earth', 'symbol-air', 'symbol-fire'],
            checkType: 'sequence' // Click sequence check
        }
    ];

    // --- Setup Functions ---
     function setupLevel1() {
         levelState = { clickedItems: new Set() };
         puzzleDisplay.style.flexDirection = 'initial'; // Ensure default layout
         puzzleDisplay.innerHTML = `
             <img src="/static/images/forest_runes_placeholder.jpg" alt="Tree with Runes" style="width:100%; height:auto; max-height: 400px;">
             <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); padding:10px; border:1px solid #ccc;">
                Pattern: <span style="font-size:1.5em; color:yellow;">  </span> <!-- Leaf, Droplet, Wind -->
             </div>
             <!-- Clickable Runes -->
             <div class="clickable-symbol rune-like" data-id="rune-leaf" title="Leaf Rune" style="top: 30%; left: 25%; width: 40px; height: 40px;"></div>
             <div class="clickable-symbol rune-like" data-id="rune-fire" title="Fire Rune" style="top: 50%; left: 60%; width: 40px; height: 40px;"></div>
             <div class="clickable-symbol rune-like" data-id="rune-water" title="Water Rune" style="top: 70%; left: 35%; width: 40px; height: 40px;"></div>
             <div class="clickable-symbol rune-like" data-id="rune-earth" title="Earth Rune" style="top: 20%; left: 75%; width: 40px; height: 40px;"></div>
             <div class="clickable-symbol rune-like" data-id="rune-wind" title="Wind Rune" style="top: 55%; left: 10%; width: 40px; height: 40px;"></div>
         `;
         inputArea.style.display = 'none';
         attachInteractionListeners('.clickable-symbol'); // Attach to symbols
     }

    function setupLevel2() {
         puzzleDisplay.style.flexDirection = 'initial';
         puzzleDisplay.innerHTML = `
             <div class="riddle-text" style="margin: auto;">
                 I have cities, but no houses;<br>
                 forests, but no trees;<br>
                 and water, but no fish.<br><br>
                 What am I?
             </div>
         `;
         inputArea.innerHTML = `
            <label for="text-input">Your Answer:</label>
            <input type="text" id="text-input" placeholder="Enter answer...">
            <button id="submit-button">Whisper Answer</button>
         `;
         inputArea.style.display = 'block';
         attachSubmitListener();
     }

    function setupLevel3() {
         levelState = { placedOrder: new Array(3).fill(null), currentStone: null }; // 3 slots for sun, moon, star
         puzzleDisplay.style.flexDirection = 'column'; // Arrange vertically
         puzzleDisplay.innerHTML = `
            <div id="stone-inventory">
                 <p style="color:#ccc;">Sacred Stones (Click to select, then click an altar slot):</p>
                 
                 <div class="sacred-stone stone-sun" data-id="sun" title="Sun Stone">S</div> 
                 <div class="sacred-stone stone-moon" data-id="moon" title="Moon Stone">M</div>
                 <div class="sacred-stone stone-star" data-id="star" title="Star Stone">*</div>
            </div>
            <div id="stone-slots">
                 <p style="color:#ccc;">Altar Slots (Order: Day, Night, Twilight):</p>
                 
                 <div class="stone-slot" data-slot-index="0"></div>
                 <div class="stone-slot" data-slot-index="1"></div>
                 <div class="stone-slot" data-slot-index="2"></div>
            </div>
         `;
         inputArea.style.display = 'none';
         attachStoneListeners();
     }

     // --- CORRECTED setupLevel4 ---
     function setupLevel4() {
         levelState = { clickSequence: [] }; // Reset sequence state
         puzzleDisplay.style.flexDirection = 'initial'; // Reset flex layout if needed
         puzzleDisplay.innerHTML = `
             <img src="/static/images/forest_altar_placeholder.jpg" alt="Elemental Altar" style="width:100%; height:auto; max-height: 450px;">
             <!-- Clickable Symbols using Font Awesome -->
             <div class="clickable-symbol" data-id="symbol-water" title="Water Symbol" style="top: 20%; left: 20%; width: 60px; height: 60px;"><i class="fas fa-tint"></i></div>
             <div class="clickable-symbol" data-id="symbol-earth" title="Earth Symbol" style="top: 70%; left: 30%; width: 60px; height: 60px;"><i class="fas fa-mountain"></i></div>
             <div class="clickable-symbol" data-id="symbol-air" title="Air Symbol" style="top: 30%; left: 75%; width: 60px; height: 60px;"><i class="fas fa-wind"></i></div>
             <div class="clickable-symbol" data-id="symbol-fire" title="Fire Symbol" style="top: 65%; left: 65%; width: 60px; height: 60px;"><i class="fas fa-fire"></i></div>
             
             <div class="clickable-symbol" data-id="decoy-leaf" title="Leaf Symbol" style="top: 45%; left: 50%; width: 50px; height: 50px;"><i class="fas fa-leaf"></i></div>

         `;
         inputArea.style.display = 'none';
         // *** CRUCIAL: Attach listeners AFTER creating the elements ***
         attachInteractionListeners('.clickable-symbol');
    }
    // --- END CORRECTION ---

    // --- Check Logic ---
    function checkAnswer(level, data) {
        const levelData = levelsData[level];
        if (!levelData) { console.error("Invalid level number:", level); return; }

        let isCorrect = false;
        switch (levelData.checkType) {
            case 'hotspot': // e.g., Level 1 if it were hotspot based
            case 'hiddenObject':
                isCorrect = (data === levelData.correctAnswer);
                if (isCorrect) handleCorrectAnswer();
                else handleIncorrectAnswer("That doesn't seem correct.");
                break;

            case 'multiClickExact': // Level 1 Runes
                 if (!levelState.clickedItems) levelState.clickedItems = new Set();
                 const element = data.element; // Get element from passed data
                 const id = data.id; // Get id from passed data

                 if (levelState.clickedItems.has(id)) {
                     levelState.clickedItems.delete(id);
                     element.classList.remove('selected');
                 } else {
                     levelState.clickedItems.add(id);
                     element.classList.add('selected');
                 }

                 if (levelState.clickedItems.size === levelData.correctAnswer.length) {
                     isCorrect = levelData.correctAnswer.every(correctId => levelState.clickedItems.has(correctId));
                     if (isCorrect) {
                         handleCorrectAnswer();
                     } else {
                         handleIncorrectAnswer("The combination of runes isn't quite right.");
                         // Optional: Reset selection on wrong final combo after delay
                         setTimeout(() => {
                              document.querySelectorAll('.clickable-symbol.selected').forEach(el => el.classList.remove('selected'));
                              levelState.clickedItems.clear();
                         }, 1000);
                     }
                 } else if (levelState.clickedItems.size > levelData.correctAnswer.length) {
                      handleIncorrectAnswer("Too many runes selected.");
                      // Optional: Deselect last clicked
                      setTimeout(() => {
                           element.classList.remove('selected');
                           levelState.clickedItems.delete(id);
                      }, 500);
                 } else {
                     if(feedbackArea){
                          feedbackArea.textContent = `${levelState.clickedItems.size} of ${levelData.correctAnswer.length} runes selected...`;
                          feedbackArea.className = 'feedback-hint';
                      }
                 }
                 break; // Prevent falling through

            case 'textInput': // Level 2 Riddle
                const inputElement = document.getElementById('text-input');
                const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
                isCorrect = (userAnswer === levelData.correctAnswer);
                 if (isCorrect) handleCorrectAnswer();
                 else handleIncorrectAnswer("The Dryad shakes her head slowly.");
                break;

            case 'sequence': // Level 4 Symbols
                 if (!levelState.clickSequence) levelState.clickSequence = [];
                 levelState.clickSequence.push(data.id); // data.id is the symbol id
                 const sequence = levelState.clickSequence;
                 const correctSeq = levelData.correctAnswer;

                 data.element.classList.add('selected'); // Highlight clicked element

                 for (let i = 0; i < sequence.length; i++) {
                     if (sequence[i] !== correctSeq[i]) {
                         handleIncorrectAnswer("Incorrect sequence. The magic falters...");
                         setTimeout(() => {
                             document.querySelectorAll('.clickable-symbol.selected').forEach(el => el.classList.remove('selected'));
                             levelState.clickSequence = [];
                         }, 1000);
                         return; // Exit check
                     }
                 }
                 if (sequence.length === correctSeq.length) {
                     handleCorrectAnswer(); // Full correct sequence
                 } else if(feedbackArea) {
                     feedbackArea.textContent = `Symbol ${sequence.length} of ${correctSeq.length} activated...`;
                     feedbackArea.className = 'feedback-hint';
                 }
                break;

             case 'sequenceOrder': // Level 3 logic is handled by placeStone
                 break; // Let placeStone handle completion check

            default: console.warn("Unknown checkType for level:", level);
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
            } else {
                // If the original element somehow got removed before listener attached
                console.warn("Could not attach listener, element parent not found:", el);
            }
        });
    }
     function attachSubmitListener() {
         const button = document.getElementById('submit-button');
         const input = document.getElementById('text-input');
         const levelData = levelsData[currentLevel];
         if (levelData?.checkType === 'textInput') {
             if(button) button.onclick = () => checkAnswer(currentLevel, null); // Pass null data
             if(input) input.onkeydown = (e) => { if (e.key === 'Enter') {e.preventDefault(); checkAnswer(currentLevel, null);} };
         }
     }
    function handleInteraction(event) {
        const targetElement = event.target.closest('[data-id]'); // Get element with data-id
        if (!targetElement) return;

        const clickedId = targetElement.dataset.id;
        const levelData = levelsData[currentLevel];

        // Pass necessary data based on check type
        if (levelData.checkType === 'sequence' || levelData.checkType === 'multiClickExact') {
            checkAnswer(currentLevel, { id: clickedId, element: targetElement });
        } else if (levelData.checkType === 'hotspot' || levelData.checkType === 'hiddenObject') {
            checkAnswer(currentLevel, clickedId);
        }
        // sequenceOrder handled by stone listeners
    }

     // --- Specific Listeners/Handlers for Level 3 ---
     function attachStoneListeners() {
         document.querySelectorAll('.sacred-stone').forEach(stone => { // Use updated class name if changed in setup
             const newStone = stone.cloneNode(true);
             if(stone.parentNode) stone.parentNode.replaceChild(newStone, stone);
             newStone.onclick = () => selectStone(newStone);
         });
         document.querySelectorAll('.stone-slot').forEach(slot => { // Use updated class name if changed in setup
             const newSlot = slot.cloneNode(true);
              if(slot.parentNode) slot.parentNode.replaceChild(newSlot, slot);
             newSlot.onclick = () => placeStone(newSlot);
         });
     }
    function selectStone(stoneElement) {
         if (stoneElement.classList.contains('placed')) return; // Use classList.contains
         document.querySelectorAll('.sacred-stone.selected').forEach(s => s.classList.remove('selected'));
         stoneElement.classList.add('selected');
         levelState.currentStone = stoneElement;
         if(feedbackArea) feedbackArea.textContent = `Selected ${stoneElement.title || stoneElement.dataset.id}. Click an altar slot.`;
         feedbackArea.className = '';
     }
     function placeStone(slotElement) {
         const slotIndex = parseInt(slotElement.dataset.slotIndex);
         const currentStone = levelState.currentStone;
         if (!currentStone || slotElement.classList.contains('filled')) { handleIncorrectAnswer("Select a stone first or slot is already filled."); return; }
         const stoneId = currentStone.dataset.id;
         const correctOrder = levelsData[currentLevel].correctAnswer;
         // Apply the ID of the stone as a class to the slot for CSS background image
         slotElement.className = `stone-slot filled stone-${stoneId}`;
         slotElement.dataset.placedId = stoneId;
         currentStone.classList.add('placed'); currentStone.classList.remove('selected');
         if (!levelState.placedOrder) levelState.placedOrder = new Array(3).fill(null); // Correct array size
         levelState.placedOrder[slotIndex] = stoneId;
         levelState.currentStone = null;
         const filledSlots = document.querySelectorAll('.stone-slot.filled').length;
         if (filledSlots === correctOrder.length) {
             let placementCorrect = correctOrder.every((id, index) => levelState.placedOrder[index] === id);
             if (placementCorrect) handleCorrectAnswer();
             else {
                 handleIncorrectAnswer("The stones radiate disharmony... They reset.");
                 setTimeout(() => {
                     document.querySelectorAll('.stone-slot').forEach(s => { s.className = 'stone-slot'; delete s.dataset.placedId; });
                     document.querySelectorAll('.sacred-stone').forEach(s => { s.classList.remove('placed','selected'); s.style.cursor = 'pointer';});
                     levelState.placedOrder = new Array(3).fill(null);
                 }, 1500);
             }
         } else if(feedbackArea) { feedbackArea.textContent = `${filledSlots} of ${correctOrder.length} stones placed...`; feedbackArea.className = 'feedback-hint'; }
     }

    // --- Game Flow Logic ---
    function loadLevel(levelNumber) { // Keep as before
        if (levelNumber > totalLevels) { showCompletion(); return; }
        if (!levelsData[levelNumber]?.setupFunction) { console.error("Invalid level data/setup:", levelNumber); if(feedbackArea){ feedbackArea.textContent = "Error loading the next part of the forest."; feedbackArea.className = 'feedback-incorrect'; } return; }
        currentLevel = levelNumber; levelState = {}; const level = levelsData[levelNumber];
        if(puzzleInstructions) puzzleInstructions.textContent = level.instructions;
        if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; }
        if(puzzleDisplay) puzzleDisplay.innerHTML = '<p style="text-align:center; padding: 50px; color: #aaa;">Loading...</p>';
        level.setupFunction();
    }
    function handleCorrectAnswer() { // Keep as before
        if(feedbackArea) { feedbackArea.textContent = "The forest seems pleased..."; feedbackArea.className = 'feedback-correct'; }
        setTimeout(() => { loadLevel(currentLevel + 1); }, 1500);
    }
    function handleIncorrectAnswer(message) { // Keep as before (with error reporting)
        if(feedbackArea) { feedbackArea.textContent = message || "The woods remain silent."; feedbackArea.className = 'feedback-incorrect'; }
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
         console.error("Whispering Woods: Missing one or more essential HTML elements.");
    } else {
        loadLevel(1);
        console.log("Whispering Woods Initialized");
    }
});