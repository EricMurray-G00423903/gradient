import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { auth, firestore } from "../firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import GoogleIcon from "@mui/icons-material/Google";

const Landing = () => {
  const [screen, setScreen] = useState<"getStarted" | "login" | "signup">("getStarted");
  const [form, setForm] = useState({ name: "", course: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //Prevent sign-up if the password is too short
    if (screen === "signup" && form.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (screen === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;
        await setDoc(doc(firestore, "users", user.uid), {
          name: form.name,
          course: form.course,
          email: form.email,
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
    } catch (error: any) {
      console.error("Auth error:", error.message);
      alert(error.message); // Show the error message to the user
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        background: "linear-gradient(135deg, #6e8efb, #a777e3)",
        color: "white",
        padding: "1.5rem",
      }}
    >
      {/* GET STARTED SCREEN */}
      {screen === "getStarted" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: "400px" }}>
          <Typography variant="h3" fontWeight="bold">Welcome to Gradient</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Your AI-powered study planner and portfolio builder.</Typography>
          <Button variant="contained" color="secondary" sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1.2rem" }} onClick={() => setScreen("login")}>Get Started</Button>
        </motion.div>
      )}

      {/* LOGIN SCREEN */}
      {screen === "login" && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: "400px" }}>
          <Typography variant="h4" fontWeight="bold">Log In</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Email" name="email" type="email" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField label="Password" name="password" type="password" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>Log In</Button>
          </form>
          <Button variant="outlined" startIcon={<GoogleIcon />} fullWidth sx={{ mt: 2, py: 1.5 }} onClick={handleGoogleSignIn}>Continue with Google</Button>
          <Typography variant="body2" sx={{ mt: 2 }}>Don't have an account? <Button onClick={() => setScreen("signup")}>Sign Up</Button></Typography>
        </motion.div>
      )}

      {/* SIGNUP SCREEN */}
      {screen === "signup" && (
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: "400px" }}>
          <Typography variant="h4" fontWeight="bold">Sign Up</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Full Name" name="name" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField label="Course Name" name="course" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField label="Email" name="email" type="email" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField 
              label="Password" 
              name="password" 
              type="password" 
              fullWidth 
              onChange={handleChange} 
              required 
              sx={{ mb: 2 }} 
              helperText="Password must be at least 6 characters" // 🔹 Display rule to user
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>Sign Up</Button>
          </form>
          <Button variant="outlined" startIcon={<GoogleIcon />} fullWidth sx={{ mt: 2, py: 1.5 }} onClick={handleGoogleSignIn}>Continue with Google</Button>
          <Typography variant="body2" sx={{ mt: 2 }}>Already have an account? <Button onClick={() => setScreen("login")}>Log In</Button></Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default Landing;
