// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBlIKCgyB2aDjjwzR-8FcfJWaxKjk5LRuQ",
  authDomain: "probeai-website-login.firebaseapp.com",
  projectId: "probeai-website-login",
  storageBucket: "probeai-website-login.appspot.com",
  messagingSenderId: "866201054215",
  appId: "1:866201054215:web:6f1f6148bee554f3bd8ea2",
  measurementId: "G-3B6F9B5WDV"
};

export const app = initializeApp(firebaseConfig);
