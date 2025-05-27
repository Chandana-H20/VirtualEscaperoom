// static/js/index.js
// This file is for JavaScript specific to the index.html landing page.
// The original index.html included a modal, but it seemed static.
// If you have interactive elements on the index page (other than basic navigation), add their JS here.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Index JS Loaded.");

    // Example: Initialize the glitch effect if it needs JS (it might be CSS only)
    const glitchElement = document.querySelector('.glitch');
    if (glitchElement) {
        console.log("Glitch element found.");
        // Add any JS-based glitch logic here if necessary
    }

    // Example: Handle the Room Preview Modal if you decide to use it
    // const modal = document.getElementById('room-modal');
    // const roomCards = document.querySelectorAll('.rooms-index-preview .room-card'); // Target index page cards
    // const closeButton = document.querySelector('.modal .close-button');

    // if (modal && roomCards.length > 0 && closeButton) {
    //     console.log("Modal elements found, attaching listeners.");
    //     roomCards.forEach(card => {
    //         card.addEventListener('click', (event) => {
    //             // Prevent triggering if the 'View Rooms' button was clicked
    //             if (event.target.closest('.room-preview-button')) {
    //                 return;
    //             }

    //             // --- Populate Modal (Example - Adapt with actual data if needed) ---
    //             const title = card.querySelector('h3')?.textContent || 'Room Title';
    //             const difficulty = card.dataset.difficulty || 'medium';
    //             const description = card.querySelector('p')?.textContent || 'Room description...';
    //             const players = card.querySelector('.fa-users')?.nextSibling.textContent.trim() || 'N/A Players';
    //             const time = card.querySelector('.fa-clock')?.nextSibling.textContent.trim() || 'N/A Minutes';

    //             document.getElementById('modal-title').textContent = title;
    //             document.getElementById('modal-difficulty').textContent = difficulty.toUpperCase();
    //             document.getElementById('modal-difficulty').className = `modal-difficulty difficulty-${difficulty}`; // Add class for styling maybe
    //             document.getElementById('modal-description').textContent = description;
    //             document.getElementById('modal-players').textContent = players;
    //             document.getElementById('modal-time').textContent = time;
    //             // Rating is static in the example

    //             modal.style.display = 'block';
    //             setTimeout(() => modal.classList.add('visible'), 10); // Add class for transition
    //         });
    //     });

    //     closeButton.addEventListener('click', () => {
    //         modal.classList.remove('visible');
    //         setTimeout(() => modal.style.display = 'none', 300); // Match CSS transition duration
    //     });

    //     // Close modal if clicking outside the content
    //     modal.addEventListener('click', (event) => {
    //         if (event.target === modal) {
    //              modal.classList.remove('visible');
    //              setTimeout(() => modal.style.display = 'none', 300);
    //         }
    //     });
    // } else {
    //     console.log("Modal elements not fully found on index page.");
    // }
});