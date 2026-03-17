// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBkYauzWzs4XdIKf2zV4yUKfHgpedd6b3s",
    authDomain: "okpay-92576.firebaseapp.com",
    projectId: "okpay-92576",
    storageBucket: "okpay-92576.firebasestorage.app",
    messagingSenderId: "164514862570",
    appId: "1:164514862570:web:64756fbbd966fd8cf9ce93",
    measurementId: "G-605K6L947R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize some other commonly used Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
export default app;
