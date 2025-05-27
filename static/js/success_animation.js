// static/js/success_animation.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('confetti-canvas');
    const leaderboardPreview = document.getElementById('leaderboard-preview');

    // --- Confetti Logic ---
    if (typeof confetti === 'function' && canvas) {
        console.log("Success Animation JS: Confetti found.");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

        function launchConfetti() {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10 };
            function randomInRange(min, max) { return Math.random() * (max - min) + min; }

            const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                myConfetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                myConfetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }
        setTimeout(launchConfetti, 500); // Start confetti after small delay
    } else {
        console.warn("Confetti library or canvas not found.");
    }

    // --- Leaderboard Fade-in Logic ---
    if (leaderboardPreview) {
        console.log("Success Animation JS: Leaderboard preview found.");
        // Fade in after a longer delay (e.g., after confetti starts settling)
        setTimeout(() => {
            leaderboardPreview.classList.add('visible');
             console.log("Leaderboard preview made visible.");
        }, 2500); // Adjust delay (milliseconds) as needed
    } else {
         console.warn("Success Animation JS: Leaderboard preview element not found.");
    }
});