// App.js
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase.config";
import { toast, Toaster } from "react-hot-toast";
import { CgSpinner } from "react-icons/cg";

export default function App() {
  /* ─── local state ─── */
  const [mode, setMode]           = useState("signup"); // signup | verify | login | dashboard
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  /* ─── keep React in sync with Firebase ─── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setEmailVerified(false); if (mode !== "signup") setMode("login"); return; }
      await u.reload();
      setEmailVerified(u.emailVerified);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── poll every 4 s while in verify screen ─── */
  useEffect(() => {
    if (mode !== "verify") return;
    if (!auth.currentUser) return;

    const id = setInterval(async () => {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setEmailVerified(true);
        toast.success("Email verified – you can now log in.");
        clearInterval(id);
      }
    }, 4000);

    return () => clearInterval(id);
  }, [mode]);

  /* ─── sign‑up ─── */
  async function handleSignup() {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      toast.success("Verification e‑mail sent. Check your inbox.");
      setMode("verify");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ─── login ─── */
  async function handleLogin() {
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await user.reload();
      if (!user.emailVerified) {
        toast.error("Verify your e‑mail first.");
        await signOut(auth);
      } else {
        setMode("dashboard");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ─── UI blocks ─── */

  /* Auth form (sign‑up / login) */
  const AuthForm = (
    <div className="w-96 flex flex-col gap-4 p-6 bg-gray-200 rounded shadow">
      <h2 className="text-2xl font-semibold text-center mb-2">
        {mode === "signup" ? "Create account" : "Log in"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
      />

      <button
        onClick={mode === "signup" ? handleSignup : handleLogin}
        disabled={loading}
        className="bg-emerald-600 text-white py-2 rounded flex justify-center items-center gap-2"
      >
        {loading && <CgSpinner className="animate-spin" />}
        {mode === "signup" ? "Sign Up" : "Log In"}
      </button>

      <p
        onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        className="text-center text-sm text-emerald-700 cursor-pointer"
      >
        {mode === "signup"
          ? "Already have an account? Log in"
          : "Don't have an account? Sign up"}
      </p>
    </div>
  );

  /* Verify notice */
  const VerifyNotice = (
    <div className="w-96 p-6 bg-white rounded shadow text-center">
      <h3 className="text-xl font-medium mb-4">Verify your e‑mail</h3>
      <p className="text-gray-600">
        We’ve sent a link to <strong>{email}</strong>. Click it, then return
        here — this page will update automatically.
      </p>

      {emailVerified && (
        <p className="mt-4 text-emerald-600 font-semibold">
          ✅ Email verified successfully – you can now log in.
        </p>
      )}

      <button
        onClick={() => setMode("login")}
        disabled={!emailVerified}
        className={`mt-6 w-full py-2 rounded ${
          emailVerified
            ? "bg-emerald-600 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Continue to Login
      </button>
    </div>
  );

  /* Dashboard */
  const Dashboard = (
<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-white p-8">
  <div className="text-center bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105">
    <h1 className="text-5xl text-emerald-600 font-semibold mb-6 animate-bounce">🎉 Login Success</h1>
    <h2 className="text-7xl sm:text-8xl font-extrabold text-gray-900 bg-gradient-to-r from-emerald-400 to-emerald-700 bg-clip-text text-transparent mb-4 drop-shadow-lg">
      👋 Welcome PTCians
    </h2>

      <button
        onClick={() => {
          signOut(auth);
          setMode("login");
        }}
        className="px-5 py-2 bg-black rounded text-orange-600 font-medium"
      >
        Sign Out
      </button>
    </div>
     </div>
  );

  /* ─── render ─── */
  return (
    <section
      className={`
        ${
          mode === "dashboard"
            ? "bg-[url('/src/assets/dashboard-bg.jpg')]"
            : "bg-emerald-500 bg-[url('/src/assets/bg.jpg')]"
        }
        bg-cover bg-center bg-no-repeat
        flex items-center justify-center min-h-screen`}
    >
      <Toaster toastOptions={{ duration: 4000 }} />
      {mode === "dashboard"
        ? Dashboard
        : mode === "verify"
        ? VerifyNotice
        : AuthForm}
    </section>
  );
}