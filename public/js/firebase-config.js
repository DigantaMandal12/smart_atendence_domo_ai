import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAiI6Ug8cy3BO72Mye9gAeX0UHbeR4edXw",

    authDomain:
        "smart-education-ai-5ed0c.firebaseapp.com",

    projectId:
        "smart-education-ai-5ed0c",

    storageBucket:
        "smart-education-ai-5ed0c.firebasestorage.app",

    messagingSenderId:
        "396994287214",

    appId:
        "1:396994287214:web:a80ae0acae20d3c04b787f",

    measurementId:
        "G-P48M1106F1"
};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


export {
    app,
    auth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
};