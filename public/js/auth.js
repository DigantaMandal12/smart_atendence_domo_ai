import {
    auth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// =====================================
// CREATE SERVER SESSION
// =====================================

async function createServerSession(
    user,
    profile = null
) {

    if (!user) {

        throw new Error(
            "Firebase user is not available."
        );

    }


    const idToken =
        await user.getIdToken(true);


    const response =
        await fetch(
            "/api/auth/session",
            {

                method:
                    "POST",

                credentials:
                    "include",

                headers: {

                    "Authorization":
                        `Bearer ${idToken}`,

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({
                        profile
                    })

            }
        );


    let data = {};


    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            "Invalid server response."
        );

    }


    console.log(
        "Server session:",
        response.status,
        data
    );


    if (!response.ok) {

        throw new Error(
            data.error ||
            `Server session failed (${response.status}).`
        );

    }


    return data;

}


// =====================================
// ELEMENTS
// =====================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


const registerForm =
    document.getElementById(
        "registerForm"
    );


const errorBox =
    document.getElementById(
        "authError"
    );


const successBox =
    document.getElementById(
        "authSuccess"
    );


// =====================================
// UI
// =====================================

function showError(
    message
) {

    if (!errorBox) return;


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );


    successBox?.classList.add(
        "hidden"
    );

}


function showSuccess(
    message
) {

    if (!successBox) return;


    successBox.textContent =
        message;


    successBox.classList.remove(
        "hidden"
    );


    errorBox?.classList.add(
        "hidden"
    );

}


function clearMessages() {

    errorBox?.classList.add(
        "hidden"
    );


    successBox?.classList.add(
        "hidden"
    );

}


function setLoading(
    button,
    loading
) {

    if (!button) return;


    button.disabled =
        loading;


    const text =
        button.querySelector(
            ".button-text"
        );


    const loader =
        button.querySelector(
            ".loader"
        );


    if (text) {

        text.style.opacity =
            loading ? "0" : "1";

    }


    if (loader) {

        loader.classList.toggle(
            "hidden",
            !loading
        );

    }

}


// =====================================
// FIREBASE ERRORS
// =====================================

function getAuthError(
    error
) {

    console.error(
        "Firebase error:",
        error
    );


    const code =
        error?.code || "";


    const messages = {

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/user-not-found":
            "No account exists with this email.",

        "auth/wrong-password":
            "Incorrect email or password.",

        "auth/email-already-in-use":
            "An account already exists with this email.",

        "auth/weak-password":
            "Password is too weak.",

        "auth/too-many-requests":
            "Too many attempts. Try again later.",

        "auth/network-request-failed":
            "Network error. Check your internet connection.",

        "auth/operation-not-allowed":
            "Email/password authentication is not enabled in Firebase.",

        "auth/invalid-api-key":
            "Firebase API key is invalid.",

        "auth/app-not-authorized":
            "This app is not authorized in Firebase.",

        "auth/user-disabled":
            "This account has been disabled."

    };


    return (
        messages[code] ||
        error?.message ||
        "Authentication failed. Please try again."
    );

}


// =====================================
// PASSWORD SHOW/HIDE
// =====================================

document
    .querySelectorAll(
        ".eye-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        document.getElementById(
                            button.dataset.target
                        );


                    if (!input) return;


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";

                        button.textContent =
                            "🙈";

                    } else {

                        input.type =
                            "password";

                        button.textContent =
                            "👁";

                    }

                }
            );

        }
    );


// =====================================
// PASSWORD STRENGTH
// =====================================

const registerPassword =
    document.getElementById(
        "registerPassword"
    );


const strengthFill =
    document.getElementById(
        "strengthFill"
    );


const strengthText =
    document.getElementById(
        "strengthText"
    );


function getPasswordScore(
    password
) {

    let score = 0;


    if (
        password.length >= 8
    )
        score++;


    if (
        /[a-z]/.test(password)
    )
        score++;


    if (
        /[A-Z]/.test(password)
    )
        score++;


    if (
        /[0-9]/.test(password)
    )
        score++;


    if (
        /[^A-Za-z0-9]/.test(password)
    )
        score++;


    return score;

}


registerPassword?.addEventListener(
    "input",
    () => {

        const score =
            getPasswordScore(
                registerPassword.value
            );


        if (strengthFill) {

            strengthFill.style.width =
                `${score * 20}%`;

        }


        const labels = [

            "Very weak",

            "Weak",

            "Fair",

            "Good",

            "Strong",

            "Very strong"

        ];


        if (strengthText) {

            strengthText.textContent =
                labels[score];

        }

    }
);


// =====================================
// PASSWORD MATCH
// =====================================

const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );


const passwordMatch =
    document.getElementById(
        "passwordMatch"
    );


function checkPasswordMatch() {

    if (
        !registerPassword ||
        !confirmPassword ||
        !passwordMatch
    ) {

        return false;

    }


    if (
        !confirmPassword.value
    ) {

        passwordMatch.textContent =
            "";

        return false;

    }


    if (
        registerPassword.value ===
        confirmPassword.value
    ) {

        passwordMatch.textContent =
            "✓ Passwords match";

        passwordMatch.className =
            "field-message valid";

        return true;

    }


    passwordMatch.textContent =
        "Passwords do not match";

    passwordMatch.className =
        "field-message invalid";

    return false;

}


registerPassword?.addEventListener(
    "input",
    checkPasswordMatch
);


confirmPassword?.addEventListener(
    "input",
    checkPasswordMatch
);


// =====================================
// REGISTER
// =====================================

registerForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        clearMessages();


        const button =
            document.getElementById(
                "registerButton"
            );


        const name =
            document.getElementById(
                "name"
            ).value.trim();


        const email =
            document.getElementById(
                "registerEmail"
            ).value.trim();


        const semester =
            document.getElementById(
                "semester"
            ).value;


        const branch =
            document.getElementById(
                "branch"
            ).value;


        const password =
            registerPassword.value;


        const confirm =
            confirmPassword.value;


        const terms =
            document.getElementById(
                "terms"
            ).checked;


        // =================================
        // VALIDATION
        // =================================

        if (
            name.length < 2
        ) {

            showError(
                "Please enter your full name."
            );

            return;

        }


        if (
            password.length < 6
        ) {

            showError(
                "Password must contain at least 6 characters."
            );

            return;

        }


        if (
            password !== confirm
        ) {

            showError(
                "Passwords do not match."
            );

            return;

        }


        if (!terms) {

            showError(
                "Please accept the Terms and Privacy Policy."
            );

            return;

        }


        try {

            setLoading(
                button,
                true
            );


            // =================================
            // CREATE FIREBASE ACCOUNT
            // =================================

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            console.log(
                "Firebase account created:",
                user.uid
            );


            // =================================
            // SAVE DISPLAY NAME
            // =================================

            await updateProfile(
                user,
                {
                    displayName:
                        name
                }
            );


            // =================================
            // CREATE SERVER SESSION
            // AND SAVE PROFILE
            // =================================

            await createServerSession(
                user,
                {
                    name,

                    email,

                    semester:
                        semester || "",

                    branch:
                        branch || "",

                    university:
                        "MAKAUT",

                    preferredLanguage:
                        "English"
                }
            );


            showSuccess(
                "Account created successfully! Redirecting..."
            );


            // User is already authenticated,
            // so go directly to the chatbot.

            setTimeout(
                () => {

                    window.location.href =
                        "/";

                },
                700
            );


        } catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            showError(
                getAuthError(error)
            );


        } finally {

            setLoading(
                button,
                false
            );

        }

    }
);


// =====================================
// LOGIN
// =====================================

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        clearMessages();


        const button =
            document.getElementById(
                "loginButton"
            );


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        const password =
            document.getElementById(
                "password"
            ).value;


        const rememberMe =
            document.getElementById(
                "rememberMe"
            ).checked;


        if (!email) {

            showError(
                "Please enter your email address."
            );

            return;

        }


        if (!password) {

            showError(
                "Please enter your password."
            );

            return;

        }


        try {

            setLoading(
                button,
                true
            );


            // =================================
            // PERSISTENCE
            // =================================

            await setPersistence(

                auth,

                rememberMe
                    ? browserLocalPersistence
                    : browserSessionPersistence

            );


            // =================================
            // FIREBASE LOGIN
            // =================================

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            console.log(
                "Firebase login successful:",
                user.email
            );


            // =================================
            // CREATE SERVER SESSION
            // =================================

            await createServerSession(
                user
            );


            showSuccess(
                "Login successful! Redirecting..."
            );


            setTimeout(
                () => {

                    window.location.href =
                        "/";

                },
                500
            );


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            showError(
                getAuthError(error)
            );


        } finally {

            setLoading(
                button,
                false
            );

        }

    }
);


// =====================================
// FORGOT PASSWORD
// =====================================

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


forgotPassword?.addEventListener(
    "click",
    async () => {

        clearMessages();


        const email =
            document.getElementById(
                "email"
            ).value.trim();


        if (!email) {

            showError(
                "Enter your email address first."
            );

            return;

        }


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            showSuccess(
                "Password reset email sent. Check your inbox."
            );


        } catch (error) {

            console.error(
                "PASSWORD RESET ERROR:",
                error
            );


            showError(
                getAuthError(error)
            );

        }

    }
);