const chatBox =
    document.getElementById("chatBox");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const typingIndicator =
    document.getElementById("typingIndicator");


// =========================================
// MARKED CONFIGURATION
// =========================================

marked.setOptions({

    gfm: true,

    breaks: true

});


// =========================================
// RENDER MARKDOWN
// =========================================

function renderMarkdown(message) {

    const html =
        marked.parse(message);

    return DOMPurify.sanitize(html);

}


// =========================================
// DETECT LANGUAGE
// =========================================

function detectLanguage(className = "") {

    const match =
        className.match(
            /language-([\w+-]+)/
        );

    return match
        ? match[1]
        : "code";

}


// =========================================
// ADD COPY BUTTONS
// =========================================

function enhanceCodeBlocks(container) {

    const blocks =
        container.querySelectorAll("pre");

    blocks.forEach(pre => {

        const code =
            pre.querySelector("code");

        if (!code) {
            return;
        }


        const language =
            detectLanguage(
                code.className
            );


        // Prevent duplicate header

        if (
            pre.querySelector(".code-header")
        ) {
            return;
        }


        const header =
            document.createElement("div");

        header.className =
            "code-header";


        const label =
            document.createElement("span");

        label.className =
            "code-language";

        label.textContent =
            language;


        const copyButton =
            document.createElement("button");

        copyButton.className =
            "copy-button";

        copyButton.textContent =
            "Copy";


        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        code.innerText
                    );

                    copyButton.textContent =
                        "Copied ✓";


                    setTimeout(() => {

                        copyButton.textContent =
                            "Copy";

                    }, 1500);

                } catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );

                    copyButton.textContent =
                        "Failed";

                }

            }
        );


        header.appendChild(label);

        header.appendChild(copyButton);

        pre.prepend(header);

    });

}


// =========================================
// ADD MESSAGE
// =========================================

function addMessage(
    message,
    type
) {

    const row =
        document.createElement("div");


    row.className =
        type === "user"
            ? "message-row user-row"
            : "message-row bot-row";


    // Avatar

    const avatar =
        document.createElement("div");


    avatar.className =
        "ai-avatar";


    avatar.textContent =
        type === "user"
            ? "👤"
            : "🎓";


    // Message

    const bubble =
        document.createElement("div");


    bubble.className =
        type === "user"
            ? "message user-message"
            : "message bot-message";


    if (type === "user") {

        bubble.textContent =
            message;

    } else {

        bubble.classList.add(
            "message-content"
        );

        bubble.innerHTML =
            renderMarkdown(message);

        enhanceCodeBlocks(bubble);

    }


    row.appendChild(avatar);

    row.appendChild(bubble);

    chatBox.appendChild(row);


    scrollToBottom();

}


// =========================================
// SCROLL
// =========================================

function scrollToBottom() {

    chatBox.scrollTo({

        top:
            chatBox.scrollHeight,

        behavior:
            "smooth"

    });

}


// =========================================
// TYPING
// =========================================

function showTyping() {

    typingIndicator.classList.remove(
        "hidden"
    );

    scrollToBottom();

}


function hideTyping() {

    typingIndicator.classList.add(
        "hidden"
    );

}


// =========================================
// SEND MESSAGE
// =========================================

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) {
        return;
    }


    // User message

    addMessage(
        message,
        "user"
    );


    // Clear input

    messageInput.value = "";


    // Disable send

    sendButton.disabled =
        true;

    sendButton.querySelector(
        "span:first-child"
    ).textContent =
        "Thinking";


    showTyping();


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                message
                        })
                }
            );


        const data =
            await response.json();


        hideTyping();


        if (!response.ok) {

            addMessage(

                data.error ||
                "Something went wrong.",

                "bot"

            );

            return;

        }


        if (data.answer) {

            addMessage(
                data.answer,
                "bot"
            );

        } else {

            addMessage(
                "The AI returned an empty response.",
                "bot"
            );

        }


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        hideTyping();


        addMessage(

            "Unable to connect to the server. Please try again.",

            "bot"

        );

    }


    sendButton.disabled =
        false;


    sendButton.querySelector(
        "span:first-child"
    ).textContent =
        "Send";


    messageInput.focus();

}


// =========================================
// SEND BUTTON
// =========================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// =========================================
// ENTER KEY
// =========================================

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =========================================
// INITIAL FOCUS
// =========================================

messageInput.focus();