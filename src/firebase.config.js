// firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // We only need Auth for Email/Password login

const firebaseConfig = {
  apiKey: "AIzaSyC3MfPJrFQBKVupBLGSwG1e0zIyLMia9SY",
  authDomain: "bachoco-otp-sms.firebaseapp.com",
  projectId: "bachoco-otp-sms",
  storageBucket: "bachoco-otp-sms.appspot.com",
  messagingSenderId: "961202488438",
  appId: "1:961202488438:web:90815d7bb509c8be8acb57",
  measurementId: "G-1M4R50EZYB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;
