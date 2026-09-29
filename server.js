require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const academicData = require("./academicData");

const app = express();

const PORT = process.env.PORT || 3000;

// Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


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


        if (!question) {

            return res.status(400).json({

                error: "Question is required."

            });

        }


        // Find relevant data
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
        // Gemini Prompt
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
        // Gemini Request
        // ===============================

        const response = await ai.interactions.create({

    model: "gemini-3.8-flash",

    input: prompt

});

        const answer = response.output_text;


     


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
            "========== GEMINI ERROR =========="
        );

        console.error(error);

        console.error(
            "=================================="
        );


        res.status(500).json({

            error:
                error.message ||
                "Gemini API error"

        });

    }

});


// ===============================
// Start Server
// ===============================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;