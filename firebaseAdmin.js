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
// SERVICE ACCOUNT
// =====================================

const serviceAccount =
    require("./serviceAccountKey.json");


// =====================================
// INITIALIZE FIREBASE ADMIN
// =====================================

initializeApp({

    credential:
        cert(serviceAccount)

});


// =====================================
// SERVICES
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