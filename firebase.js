import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAEZqKWi-UKCfaSqJieAZt1oHn_dVThJ4Q",
  authDomain: "myproject-ff4c1.firebaseapp.com",
  projectId: "myproject-ff4c1",
  storageBucket: "myproject-ff4c1.firebasestorage.app",
  messagingSenderId: "170787079514",
  appId: "1:170787079514:web:03725bc15f4f60eef59f63",
  measurementId: "G-ES4QVQ0CGN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
