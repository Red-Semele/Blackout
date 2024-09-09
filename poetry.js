const poetryContainer = document.getElementById("poetry-container");
const newTextButton = document.getElementById("new-text");
const exportButton = document.getElementById("export-poetry");

let isSelecting = false; // Tracks whether the user is selecting text
let selectedElements = []; // Tracks the selected spans (letters)

// Full-page length sample texts with line breaks
const texts = [
    `In the stillness of the early morning,\nbefore the sun crests the horizon, the world is a place of silence and shadow.\n\nThe trees, tall and ancient, stand like guardians of the night, their leaves rustling only when the wind dares to breathe.`,
    `The city was a labyrinth of streets and alleys,\neach turn offering a new sight, a new sound, a new mystery to unravel.\nThe buildings, towering and close together, created a maze of shadows that danced along the pavement...`,
    `The sea stretched out before me,\nan endless expanse of blue that seemed to go on forever.\nThe waves crashed against the shore with a steady rhythm...`,
    `The mountains rose up around me,\ntowering peaks that seemed to touch the sky.\nThe path beneath my feet was narrow and winding...\n`
];

// Ghost's predefined messages
const ghostMessages = [
    "help me",
    "find me",
    "i am lost",
    "see the truth",
    "they know",
    "follow the signs",
    "i am waiting",
    "charon had already brought him halfway when a man heard calling out to him. Not coming from his destination. He lept off the boat he had paid to get on.",
    "I saw her standing there. A being of light and fire. The very reason the Void knows travellers. That you know them. The divine sun casts a gate of shadow."
];

let currentGhostMessage = "";
let ghostProgress = 0;
let ghostActive = false;

// Function to randomly pick a ghost message
function getRandomGhostMessage() {
    return ghostMessages[Math.floor(Math.random() * ghostMessages.length)];
}

// Function to display new poetry (either with or without the ghost)
function getNewPoetry() {
    const text = getRandomText(); // Get a random piece of text

    // 30% chance to display a ghost message
    const isGhost = Math.random() < 0.3;

    if (isGhost || ghostActive) {
        // If ghost is already active, continue the message
        if (!ghostActive) {
            // If ghost isn't active yet, pick a random ghost message and start
            currentGhostMessage = getRandomGhostMessage();
            ghostProgress = 0; // Start at the beginning of the message
            ghostActive = true;
        }

        console.log("Ghost message: ", currentGhostMessage);
        displayText(text, true, currentGhostMessage); // Display with ghost blackout
    } else {
        displayText(text, false); // Display normal text
    }
}

// Function to display the text with selectable letters (handling line breaks as special cases)
function displayText(text, isGhost = false, ghostMessage = "") {
    poetryContainer.innerHTML = ''; // Clear existing text
    const textArray = [];

    // Create span elements for each character and handle line breaks
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');

        // Treat line breaks ('\n') as non-breaking spaces and add a line-break class
        if (text[i] === '\n') {
            span.textContent = '\u00A0'; // Non-breaking space for visual consistency
            span.classList.add('letter', 'line-break'); // Mark line breaks with a special class
        } else {
            span.textContent = text[i] === ' ' ? '\u00A0' : text[i]; // Preserve spaces
            span.classList.add('letter');
        }

        // Add event listeners for selection
        span.addEventListener('mousedown', (e) => handleMouseDown(e, span));  // Start selection
        span.addEventListener('mouseenter', (e) => handleMouseEnter(e, span)); // Mouseover for selection

        poetryContainer.appendChild(span);
        textArray.push(span);
    }

    // Apply ghost blackout if applicable
    if (isGhost) {
        ghostBlackout(textArray, ghostMessage);
    }
}

// Function to blackout letters to hide parts of the text based on the ghost message
function ghostBlackout(textArray, ghostMessage) {
    let currentGhostIndex = ghostProgress; // Start from where the ghost left off
    let messageCompleted = false; // Track if the ghost message is completed

    for (let i = 0; i < textArray.length; i++) {
        const letter = textArray[i].textContent.toLowerCase();

        if (!messageCompleted && currentGhostIndex < ghostMessage.length) {
            if (letter === ghostMessage[currentGhostIndex].toLowerCase()) {
                // Leave the letter visible and move to the next ghost message character
                currentGhostIndex++;
            } else if (letter === '\u00A0' && ghostMessage[currentGhostIndex] === ' ') {
                // Handle spaces
                currentGhostIndex++;
            } else {
                // Black out any letters that don't match the ghost's message
                textArray[i].classList.add('blackout');
            }
        } else {
            // Black out the remaining text after the ghost message is completed
            textArray[i].classList.add('blackout');
        }

        if (currentGhostIndex >= ghostMessage.length) {
            messageCompleted = true; // Mark the ghost message as completed
            ghostProgress = 0; // Reset progress for the next ghost message
            ghostActive = false; // Ghost has finished delivering the message
        }
    }

    // Update ghost progress if not completed
    if (!messageCompleted) {
        ghostProgress = currentGhostIndex; // Continue in the next text
    }
}

// Handle text selection (mousedown, mouseenter, mouseup events)
function handleMouseDown(event, span) {
    event.preventDefault(); // Prevent default text selection behavior
    isSelecting = true;
    span.classList.add('selected'); // Add selected class to span
    selectedElements = [span]; // Track the selected element
}

function handleMouseEnter(event, span) {
    if (isSelecting) {
        span.classList.add('selected'); // Continue to select as mouse hovers over spans
        selectedElements.push(span); // Track selected spans
    }
}

function handleMouseUp(event) {
    if (isSelecting) {
        isSelecting = false;

        // Process any remaining selected text
        document.querySelectorAll('.letter.selected').forEach(span => {
            if (span.classList.contains('blackout')) {
                span.classList.remove('blackout'); // Remove blackout if already applied
            } else {
                span.classList.add('blackout'); // Apply blackout to selected elements
            }
            span.classList.remove('selected'); // Remove selection after mouseup
        });

        // Clear selectedElements array
        selectedElements = [];
    }
}

// Add a global mouseup event listener to handle selection outside the text container
document.addEventListener('mouseup', handleMouseUp);

// Event listener for "New Text" button to get a new piece of poetry
newTextButton.addEventListener('click', getNewPoetry);

// Function to get random text from the predefined list
function getRandomText() {
    return texts[Math.floor(Math.random() * texts.length)];
}

// Export functionality to share the blackout poetry
exportButton.addEventListener('click', () => {
    let exportText = "";

    // Loop through the container's children (spans) and build the export string
    for (const span of poetryContainer.children) {
        if (span.classList.contains('blackout')) {
            exportText += "█"; // Represent blacked-out letters with block character
        } else {
            exportText += span.textContent; // Include visible letters/spaces
        }
    }

    // Create a downloadable file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blackout_poetry.txt';
    a.click();

    // Release the object URL after download
    URL.revokeObjectURL(url);
});
