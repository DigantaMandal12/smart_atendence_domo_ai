const chatBox = document.getElementById("chatBox");

const messageInput = document.getElementById("messageInput");

const sendButton = document.getElementById("sendButton");


// Add message to chat
function addMessage(message, type) {

    const messageDiv = document.createElement("div");

    messageDiv.className = `message ${type}`;


    const contentDiv = document.createElement("div");

    contentDiv.className = "message-content";


    // Convert line breaks
    contentDiv.innerHTML = message.replace(/\n/g, "<br>");


    messageDiv.appendChild(contentDiv);

    chatBox.appendChild(messageDiv);


    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Send message
async function sendMessage() {

    const message = messageInput.value.trim();


    if (!message) {
        return;
    }


    // Show user message
    addMessage(message, "user");


    // Clear input
    messageInput.value = "";


    // Disable button
    sendButton.disabled = true;

    sendButton.textContent = "Thinking...";


    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        const data = await response.json();


        if (data.error) {

            addMessage(
                "❌ " + data.error,
                "bot"
            );

        } else {

            addMessage(
                data.answer,
                "bot"
            );

        }


    } catch (error) {

        console.error(error);

        addMessage(
            "❌ Unable to connect to the server.",
            "bot"
        );

    }


    // Enable button
    sendButton.disabled = false;

    sendButton.textContent = "Send";

}


// Button click
sendButton.addEventListener(
    "click",
    sendMessage
);


// Enter key
messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);