// static/js/crimson_case.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Crimson Case JS Loaded");

    // Get DOM elements
    const puzzleDisplay = document.getElementById('puzzle-display');
    const puzzleInstructions = document.getElementById('puzzle-instructions');
    const inputArea = document.getElementById('input-area');
    const feedbackArea = document.getElementById('feedback-area');
    const completionSection = document.getElementById('completion-section');
    const puzzleFrame = document.getElementById('puzzle-frame') || document.querySelector('.escape-room-content'); // For shake

    let currentLevel = 1;
    const totalLevels = 4;
    let levelState = { foundClues: {} }; // Store found items/clues across levels

    // --- Level Data ---
    const levelsData = [
        null, // Index 0 unused
        { // Level 1: Find the Desk Key
            instructions: "The office is a mess. Find the key to the locked desk drawer.",
            setupFunction: setupLevel1,
            correctAnswer: 'desk-key', // data-id of the hidden key hotspot
            checkType: 'hiddenObject'
        },
        { // Level 2: Decipher the Note
            instructions: "The drawer contained a coded note and a partial cipher key (on the blotter). Decipher the location mentioned.",
            // Cipher key visual in setup image, ROT13 for example
            // Coded note: "GUR FNSF PNAR" --> "THE SAFE CANE"
            setupFunction: setupLevel2,
            correctAnswer: 'THE SAFE CANE', // Location related to a cane near the safe
            checkType: 'textInput'
        },
        { // Level 3: Open the Safe
            instructions: "The note mentioned the safe. Look around the office for the three digits of the combination. The first is on the calendar, second on the clock, third under the phone.",
            setupFunction: setupLevel3,
            correctAnswer: '419', // Example combination
            checkType: 'textInput'
        },
        { // Level 4: Find the Necklace
            instructions: "The safe is open! Inside is just a cryptic riddle: 'Where the city sleeps in miniature'. Find the necklace's hiding spot.",
            setupFunction: setupLevel4,
            correctAnswer: 'model-building', // Hotspot on a model building
            checkType: 'hiddenObject'
        }
    ];

    // --- Setup Functions ---
    function setupLevel1() {
        levelState = { foundClues: {} }; // Reset clues
        puzzleDisplay.innerHTML = `
            <img src="/static/images/office_clutter_placeholder.jpg" alt="Ransacked Detective Office" style="width:100%; height:auto;">
            <div class="hotspot" data-id="desk-key" title="Examine Loose Floorboard" style="top: 75%; left: 15%; width: 8%; height: 6%;"></div>
            <div class="hotspot" data-id="paper-clue" title="Examine Torn Paper" style="top: 50%; left: 55%; width: 12%; height: 10%;"></div>
        `;
        inputArea.style.display = 'none';
        attachInteractionListeners('.hotspot');
    }

    function setupLevel2() {
         puzzleDisplay.innerHTML = `
            <img src="/static/images/office_desk_placeholder.jpg" alt="Desk with note and blotter" style="width:100%; height:auto;">
            <div class="document-display" style="position:absolute; top: 20%; left: 15%; width: 30%; font-size:0.9em; transform: rotate(2deg);">NOTE FOUND:\nGUR FNSF PNAR</div>
            <div class="document-display" style="position:absolute; top: 55%; left: 40%; width: 40%; font-size:0.8em; transform: rotate(-5deg); background-color: rgba(245, 232, 216, 0.8);">BLOTTER MARKINGS:\n(A=M, B=N, ... ROT13)</div>
        `;
        inputArea.innerHTML = `
            <label for="text-input">Deciphered Location:</label>
            <input type="text" id="text-input" placeholder="Enter location...">
            <button id="submit-button">Submit</button>
        `;
        inputArea.style.display = 'block';
        attachSubmitListener(levelsData[currentLevel].checkType);
    }

    function setupLevel3() {
         puzzleDisplay.innerHTML = `
            <img src="/static/images/office_clutter_placeholder.jpg" alt="Ransacked Detective Office - Finding Combination" style="width:100%; height:auto;">
            <div class="hotspot" title="Calendar: 4th Marked" style="top: 20%; left: 70%; width: 10%; height: 15%; border-color:rgba(255,255,0,0.3);"></div>
            <div class="hotspot" title="Clock: Stopped at 1" style="top: 15%; left: 10%; width: 12%; height: 18%; border-color:rgba(255,255,0,0.3);"></div>
            <div class="hotspot" title="Phone: Note with '9' under receiver" style="top: 65%; left: 40%; width: 15%; height: 12%; border-color:rgba(255,255,0,0.3);"></div>
             <p style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.7); color:#ccc; padding:5px; font-size:0.9em;">Find the 3-digit safe combination.</p>
        `;
        inputArea.innerHTML = `
            <label for="text-input">Safe Combination:</label>
            <input type="text" id="text-input" placeholder="Enter 3 digits..." maxlength="3" inputmode="numeric" pattern="[0-9]*">
            <button id="submit-button">Try Combination</button>
        `;
        inputArea.style.display = 'block';
        attachSubmitListener(levelsData[currentLevel].checkType);
    }

     function setupLevel4() {
         puzzleDisplay.innerHTML = `
            <img src="/static/images/office_clutter_placeholder.jpg" alt="Ransacked Detective Office - Find Necklace" style="width:100%; height:auto;">
             <p style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.7); color:#e8d8c8; padding:8px; border: 1px solid #777; font-style:italic;">Riddle from safe: "Where the city sleeps in miniature"</p>
            <div class="hotspot" data-id="model-building" title="Examine Model Building" style="top: 30%; left: 80%; width: 15%; height: 25%;"></div>
            <div class="hotspot" data-id="picture-frame" title="Examine Picture Frame" style="top: 55%; left: 20%; width: 10%; height: 15%;"></div>
        `;
         inputArea.style.display = 'none';
         attachInteractionListeners('.hotspot');
     }

    // --- Check Logic / Interaction Handling ---
     function handleInteraction(event) {
         const targetElement = event.target;
         const clickedId = targetElement.dataset.id;
         const levelData = levelsData[currentLevel];

         // Only handle clicks intended for hiddenObject checks here
         if (!clickedId || levelData.checkType !== 'hiddenObject') return;

         if (clickedId === levelData.correctAnswer) {
             levelState.foundClues[clickedId] = true; // Mark as found
             targetElement.style.border = '2px solid lime'; // Feedback
             targetElement.style.cursor = 'default';
             handleCorrectAnswer();
         } else {
             handleIncorrectAnswer("Just dust and shadows here...");
             // Optional: Make decoy disappear or change state
             // targetElement.style.opacity = '0.2';
             // targetElement.style.pointerEvents = 'none';
         }
     }

      function checkTextInput() {
        const inputElement = document.getElementById('text-input');
        const userAnswer = inputElement ? inputElement.value.trim().toUpperCase() : '';
        const levelData = levelsData[currentLevel];

        if (!levelData || levelData.checkType !== 'textInput') return; // Ensure correct check type

        if (userAnswer === levelData.correctAnswer) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer(currentLevel === 2 ? "That doesn't decode correctly." : "Incorrect combination. The safe remains locked tight.");
        }
    }

    // --- Event Listener Helpers ---
    function attachInteractionListeners(selector) {
        const elements = puzzleDisplay.querySelectorAll(selector);
        elements.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            // Only add listener if it's relevant to the current level check type
            if (levelsData[currentLevel].checkType === 'hiddenObject') {
                newEl.addEventListener('click', handleInteraction);
            }
        });
    }

     function attachSubmitListener(checkType) {
         if (checkType === 'textInput') {
             const button = document.getElementById('submit-button');
             const input = document.getElementById('text-input');
             if(button) button.onclick = checkTextInput;
             if(input) input.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); checkTextInput(); } };
         }
     }

    // --- Game Flow Logic ---
    function loadLevel(levelNumber) {
        if (levelNumber > totalLevels) { showCompletion(); return; }
        if (!levelsData[levelNumber] || !levelsData[levelNumber].setupFunction) {
             console.error("Invalid level data or setup function for level:", levelNumber);
             if(feedbackArea){ feedbackArea.textContent = "Error loading scene."; feedbackArea.className = 'feedback-incorrect'; }
             return;
        }
        currentLevel = levelNumber;
        // Retain foundClues across levels if needed, otherwise reset levelState = {}
        const level = levelsData[levelNumber];
        if(puzzleInstructions) puzzleInstructions.textContent = level.instructions;
        if(feedbackArea) { feedbackArea.textContent = ''; feedbackArea.className = ''; }
        level.setupFunction(); // This will attach appropriate listeners for the new level
    }

    function handleCorrectAnswer() {
        if(feedbackArea){
            feedbackArea.textContent = "Got it. What's next on the docket?";
            feedbackArea.className = 'feedback-correct';
        }
        setTimeout(() => { loadLevel(currentLevel + 1); }, 1500);
    }

    function handleIncorrectAnswer(message) {
        if(feedbackArea){
            feedbackArea.textContent = message || "That lead went cold.";
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
        if(inputArea) inputArea.style.display = 'none';
        if(completionSection) {
            completionSection.style.display = 'block'; // Show FORM
            completionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
             console.warn("Completion section not found.");
        }
    }

    // --- Initialization ---
    if (!puzzleDisplay || !puzzleInstructions || !inputArea || !feedbackArea || !completionSection) {
        console.error("Crimson Case: Missing one or more essential HTML elements.");
    } else {
        loadLevel(1);
        console.log("Crimson Case Initialized");
    }
});