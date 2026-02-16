import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBSOc8qx8nt8f_O2VayKdif5YDiVLc1AYQ",
    authDomain: "itzmyproj.firebaseapp.com",
    projectId: "itzmyproj",
    storageBucket: "itzmyproj.firebasestorage.app",
    messagingSenderId: "935897314143",
    appId: "1:935897314143:web:57fe725c395555529e3cea",
    measurementId: "G-1Q48J6VXCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional, wrapping in check to avoid errors in environments where it might fail)
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export default app;
