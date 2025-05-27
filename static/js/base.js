// static/js/base.js
console.log("Base JS loaded.");

// Function to handle flash message dismissal
function handleFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    if (flashMessages.length === 0) return; // No messages

    console.log(`Found ${flashMessages.length} flash messages.`);

    // Ensure transition style is present
    if (!document.querySelector('style#flash-transition')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "flash-transition";
        styleSheet.type = "text/css";
        styleSheet.innerText = `.flash-message { transition: opacity 0.5s ease-out, transform 0.5s ease-out, margin-bottom 0.5s ease-out, padding 0.5s ease-out; }`;
        document.head.appendChild(styleSheet);
    }

    flashMessages.forEach(message => {
        // Function to dismiss a message
        const dismissMessage = () => {
            message.style.opacity = '0';
            message.style.transform = 'scale(0.9)';
            message.style.marginBottom = '0';
            message.style.paddingTop = '0';
            message.style.paddingBottom = '0';
            // Remove after fade out transition
            setTimeout(() => {
                // Check if parent container might become empty
                const container = message.closest('.flash-messages-container');
                message.remove();
                if (container && container.children.length === 0) {
                    // Optionally hide or remove the container if it's now empty
                    // container.style.display = 'none';
                }
            }, 500); // Match CSS transition duration
        };

        // Auto-dismiss after 7 seconds
        const timer = setTimeout(dismissMessage, 7000);

        // Dismiss on click
        message.addEventListener('click', () => {
            clearTimeout(timer); // Clear the auto-dismiss timer
            dismissMessage();
        }, { once: true }); // Listener runs only once
    });
}

// Run flash message handling when the DOM is ready
document.addEventListener('DOMContentLoaded', handleFlashMessages);

// Add shake animation CSS globally if needed by multiple room JS files
function addShakeAnimationCSS() {
    if (!document.querySelector('style#shake-animation')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = "shake-animation";
        styleSheet.type = "text/css";
        styleSheet.innerText = `@keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } } .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }`;
        document.head.appendChild(styleSheet);
        console.log("Shake animation CSS added.");
    }
}
document.addEventListener('DOMContentLoaded', addShakeAnimationCSS);