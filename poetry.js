// poetry.js
//TODO: Probably use monospace font so every letter is the same size.
const poetryContainer = document.getElementById("poetry-container");
const newTextButton = document.getElementById("new-text");

let isSelecting = false; // Tracks whether the user is selecting text
let startSpan = null; // The first span element clicked to start selection

// Full-page length sample texts with line breaks
const texts = [
    `In the stillness of the early morning,\nbefore the sun crests the horizon, the world is a place of silence and shadow.\n\nThe trees, tall and ancient, stand like guardians of the night, their leaves rustling only when the wind dares to breathe.`,
    
    `The city was a labyrinth of streets and alleys,\neach turn offering a new sight, a new sound, a new mystery to unravel.\nThe buildings, towering and close together, created a maze of shadows that danced along the pavement...`,
    
    `The sea stretched out before me,\nan endless expanse of blue that seemed to go on forever.\nThe waves crashed against the shore with a steady rhythm...`,
    
    `The mountains rose up around me,\ntowering peaks that seemed to touch the sky.\nThe path beneath my feet was narrow and winding...\n`,

    `Blah blah
    blababa blabba`
];

// Ghost sentences that the ghost tries to reveal
const ghostMessages = [
    "help me",
    "find me",
    "i am lost",
    "see the truth",
    "they know",
    "follow the signs",
    "i am waiting"
];

// Function to make the ghost search for its message
function ghostBlackout(textArray, ghostMessage) {
    let currentLetterIndex = 0; // Track which letter the ghost is currently searching for

    for (let i = 0; i < textArray.length; i++) {
        const letter = textArray[i].textContent.toLowerCase(); // Get current letter (ignore case)

        if (letter === ghostMessage[currentLetterIndex]) {
            // If the letter matches the next one in the ghost's message, move to the next letter
            currentLetterIndex++;
            if (currentLetterIndex >= ghostMessage.length) {
                // If the ghost's message is complete, blackout the remaining text
                for (let j = i + 1; j < textArray.length; j++) {
                    textArray[j].classList.add('blackout');
                }
                break; // Stop processing after the message is complete
            }
        } else if (letter !== '\u00A0') {
            // Black out any non-space letters that don't match the ghost's message
            textArray[i].classList.add('blackout');
        } else if (ghostMessage[currentLetterIndex] === ' ') {
            // Leave space visible if it's part of the ghost's message
            currentLetterIndex++;
        } else {
            // Otherwise, black out spaces (including line breaks) that are not needed
            textArray[i].classList.add('blackout');
        }
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
        span.addEventListener('mouseup', handleMouseUp);  // End selection
        
        textArray.push(span);
        poetryContainer.appendChild(span);
    }

    // Apply "ghost" blackout if applicable
    if (isGhost) {
        ghostBlackout(textArray, ghostMessage);
    }
}

// Selection logic: Handles the start of a selection (mouse down)
function handleMouseDown(event, span) {
    event.preventDefault();  // Prevent text highlighting
    isSelecting = true;
    startSpan = span;
    span.classList.toggle('selected');  // Toggle selection on click
}

// Selection logic: Handles entering letters while selecting
function handleMouseEnter(event, span) {
    if (isSelecting) {
        span.classList.add('selected');  // Highlight letter during selection
    }
}

function handleMouseUp(event) {
    if (isSelecting) {
        const selectedSpans = document.querySelectorAll('.selected');

        // Loop through the selected spans and invert their blackout state
        selectedSpans.forEach(span => {
            if (span.classList.contains('blackout')) {
                // If the span is already blacked out, remove the blackout
                span.classList.remove('blackout');
            } else {
                // If the span is not blacked out, apply the blackout
                span.classList.add('blackout');
            }

            // Remove the selection highlighting
            span.classList.remove('selected');
        });

        // End selection
        isSelecting = false;
    }
}

// Detect if the mouse goes up outside the container (to end selection)
document.addEventListener('mouseup', () => {
    isSelecting = false;
    document.querySelectorAll('.selected').forEach(span => span.classList.remove('selected'));
});

// Function to get random text from the list
function getRandomText() {
    const randomIndex = Math.floor(Math.random() * texts.length);
    return texts[randomIndex];
}

// Function to get a random ghost message
function getRandomGhostMessage() {
    const randomIndex = Math.floor(Math.random() * ghostMessages.length);
    return ghostMessages[randomIndex];
}

// Function to determine whether to show a ghost message
function getNewPoetry() {
    const text = getRandomText();
    const isGhost = Math.random() < 0.3; // 30% chance to get ghost text

    if (isGhost) {
        const ghostMessage = getRandomGhostMessage();
        displayText(text, true, ghostMessage);
    } else {
        displayText(text, false);
    }
}



// Initial load of text
getNewPoetry();

// Event listener for "Get New Text" button
newTextButton.addEventListener('click', getNewPoetry);

const exportButton = document.getElementById("export-poetry");

function exportPoetry() {
    // Get the poetry container element
    const poetryContainer = document.getElementById("poetry-container");

    // Use html2canvas to capture the poetry container as an image
    html2canvas(poetryContainer, {
        useCORS: true,
        backgroundColor: null, // Set background to transparent to handle blacked-out areas
        logging: true, // Enable logging to debug issues
        scale: 2 // Increase scale for higher resolution
    }).then(canvas => {
        // Create a temporary link element for downloading the image
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'blackout-poetry.png';
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Remove the link from the DOM
        document.body.removeChild(link);
    }).catch(error => {
        console.error('Error generating image:', error);
    });
}

// Event listener for export button
exportButton.addEventListener('click', exportPoetry);