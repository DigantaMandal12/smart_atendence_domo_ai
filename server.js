require("dotenv").config();

const express = require("express");
const path = require("path");

const academicData = require("./academicData");

const app = express();

const PORT = process.env.PORT || 3000;


// ===============================
// OpenRouter Configuration
// ===============================

const OPENROUTER_API_URL =
    "https://openrouter.ai/api/v1/chat/completions";


// ===============================
// Express Configuration
// ===============================

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ===============================
// Chatbot Page
// ===============================

app.get("/", (req, res) => {

    res.render("chatbot");

});


// ===============================
// Find Relevant Academic Data
// ===============================

function findRelevantData(question) {

    const words = question
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);


    const results = academicData.filter(item => {

        const searchableText = `
            ${item.subject}
            ${item.topic}
            ${item.content}
        `.toLowerCase();


        return words.some(word =>
            searchableText.includes(word)
        );

    });


    return results;
}


// ===============================
// AI Chat API
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const question = req.body.message;


        // ===============================
        // Validate Question
        // ===============================

        if (!question) {

            return res.status(400).json({

                error: "Question is required."

            });

        }


        // ===============================
        // Check OpenRouter API Key
        // ===============================

        if (!process.env.OPENROUTER_API_KEY) {

            return res.status(500).json({

                error:
                    "OpenRouter API key is not configured."

            });

        }


        // ===============================
        // Find Relevant Academic Data
        // ===============================

        const relevantData =
            findRelevantData(question);


        let context;


        if (relevantData.length > 0) {

            context = relevantData
                .map(item => {

                    return `
Subject: ${item.subject}

Topic: ${item.topic}

${item.content}
                    `;

                })
                .join(
                    "\n----------------------\n"
                );

        } else {

            context =
                "No relevant information was found in our academic database.";

        }


        // ===============================
        // AI Prompt
        // ===============================

        const prompt = `

You are the AI Study Assistant
inside a Smart Academic System.

Your job is to help students understand
their academic subjects.

IMPORTANT RULES:

1. Use the provided academic data as your
   primary source.

2. Do not invent syllabus information.

3. Do not invent previous-year questions.

4. If the provided academic data does not
   contain enough information, clearly say so.

5. You may use general knowledge to explain
   concepts, but clearly distinguish it from
   the provided academic data.

6. Give simple and student-friendly answers.

7. For exam questions, use structured answers.

8. If possible, give examples.

9. Keep answers focused on the student's question.


==============================
ACADEMIC DATA
==============================

${context}


==============================
STUDENT QUESTION
==============================

${question}


==============================
ANSWER
==============================

`;


        // ===============================
        // OpenRouter API Request
        // ===============================

        const response = await fetch(
            OPENROUTER_API_URL,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type":
                        "application/json",

                    "HTTP-Referer":
                        "https://smart-atendence-domo-ai.vercel.app",

                    "X-Title":
                        "Smart Academic AI"
                },

                body: JSON.stringify({

                    model: "google/gemma-4-31b-it:free",

                    messages: [

                        {
                            role: "system",

                            content:
                                "You are a helpful academic study assistant. Follow the provided academic data carefully."
                        },

                        {
                            role: "user",

                            content: prompt
                        }

                    ]

                })

            }
        );


        // ===============================
        // Read OpenRouter Response
        // ===============================

        const data = await response.json();


        // ===============================
        // Handle API Error
        // ===============================

        if (!response.ok) {

            console.error(
                "OpenRouter API Error:",
                data
            );

            return res.status(500).json({

                error:
                    data?.error?.message ||
                    "OpenRouter API request failed."

            });

        }


        // ===============================
        // Get AI Answer
        // ===============================

        const answer =
            data?.choices?.[0]?.message?.content;


        if (!answer) {

            return res.status(500).json({

                error:
                    "OpenRouter returned an empty response."

            });

        }


        // ===============================
        // Send Response
        // ===============================

        res.json({

            answer: answer,

            sourceFound:
                relevantData.length > 0

        });


    } catch (error) {

        console.error(
            "========== OPENROUTER ERROR =========="
        );

        console.error(error);

        console.error(
            "======================================"
        );


        res.status(500).json({

            error:
                error.message ||
                "OpenRouter API error."

        });

    }

});


// ===============================
// Start Server
// ===============================

if (require.main === module) {

    app.listen(PORT, () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    });

}


module.exports = app;