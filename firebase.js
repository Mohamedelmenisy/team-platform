// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEZqKWi-UKCfaSqJieAZt1oHn_dVThJ4Q",
  authDomain: "myproject-ff4c1.firebaseapp.com",
  projectId: "myproject-ff4c1",
  storageBucket: "myproject-ff4c1.appspot.com",  // ✅ Corrected here!
  messagingSenderId: "170787079514",
  appId: "1:170787079514:web:03725bc15f4f60eef59f63",
  measurementId: "G-ES4QVQ0CGN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app to use in other files
export { app, analytics };
