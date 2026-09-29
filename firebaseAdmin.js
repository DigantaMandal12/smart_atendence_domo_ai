const {
    initializeApp,
    cert
} = require("firebase-admin/app");

const {
    getAuth
} = require("firebase-admin/auth");

const {
    getFirestore
} = require("firebase-admin/firestore");


// =====================================
// FIREBASE ADMIN CREDENTIALS
// =====================================

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {

    // Vercel / production
    try {

        serviceAccount =
            JSON.parse(
                process.env.FIREBASE_SERVICE_ACCOUNT
            );

    } catch (error) {

        console.error(
            "FIREBASE_SERVICE_ACCOUNT is not valid JSON."
        );

        throw error;

    }

} else {

    // Local development
    serviceAccount =
        require("./serviceAccountKey.json");

}


// =====================================
// INITIALIZE FIREBASE ADMIN
// =====================================

initializeApp({

    credential:
        cert(serviceAccount)

});


// =====================================
// FIREBASE SERVICES
// =====================================

const adminAuth =
    getAuth();

const adminDb =
    getFirestore();


// =====================================
// EXPORT
// =====================================

module.exports = {
    adminAuth,
    adminDb
};