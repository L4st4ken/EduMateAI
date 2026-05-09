const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Store full conversation history
const conversation = [];

/**
 * Create and append a message element to chat box
 * @param {string} text
 * @param {string} sender - "user" or "bot"
 * @returns {HTMLElement}
 */
function appendMessage(text, sender) {
    const messageEl = document.createElement("div");

    messageEl.classList.add("message", sender);
    messageEl.textContent = text;

    chatBox.appendChild(messageEl);

    // Auto scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;

    return messageEl;
}

/**
 * Send conversation to backend API
 */
async function sendMessage(userMessage) {

    // Add user message to UI
    appendMessage(userMessage, "user");

    // Save user message to conversation history
    conversation.push({
        role: "user",
        text: userMessage
    });

    // Show temporary bot thinking message
    const thinkingMessage = appendMessage("Thinking...", "bot");

    try {

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                conversation
            })
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        // Replace thinking message with AI response
        if (data.result) {

            thinkingMessage.textContent = data.result;

            // Save AI response to conversation history
            conversation.push({
                role: "model",
                text: data.result
            });

        } else {

            thinkingMessage.textContent =
                "Sorry, no response received.";

        }

    } catch (error) {

        console.error(error);

        thinkingMessage.textContent =
            "Failed to get response from server.";

    }
}

// Handle form submit
chatForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const message = userInput.value.trim();

    if (!message) return;

    // Clear input field
    userInput.value = "";

    // Send message
    await sendMessage(message);

});