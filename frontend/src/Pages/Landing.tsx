import { useState } from "react";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import GoogleIcon from "@mui/icons-material/Google";
import { auth, firestore } from "../firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";

// Features for the slideshow
const slides = [
  { title: "AI-Powered Study Planner", description: "Get personalized study plans based on your progress and goals." },
  { title: "Smart Project Recommendations", description: "AI suggests coding projects to enhance your portfolio." },
  { title: "GitHub Integration", description: "Connect GitHub to analyze your coding skills and track growth." },
  { title: "Build Your Portfolio", description: "Showcase your work with an AI-generated portfolio." },
];

const Landing = () => {
  const [screen, setScreen] = useState<"landing" | "login" | "signup">("landing");
  const [form, setForm] = useState({ name: "", course: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (screen === "signup" && form.password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (screen === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;

        // Save user details in Firestore
        await setDoc(doc(firestore, "users", user.uid), {
          name: form.name,
          course: form.course,
          email: form.email,
        });
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "",
          email: user.email,
          course: "",
        });
      }
    } catch (error: any) {
      alert("Google Sign-In Error: " + error.message);
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
      {/* LANDING PAGE WITH SLIDESHOW */}
      {screen === "landing" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: "100%", maxWidth: "400px" }}>
          <Typography variant="h3" fontWeight="bold">Welcome to Gradient</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Your AI-powered study planner and portfolio builder.</Typography>

          {/* Slideshow */}
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            spaceBetween={50}
            slidesPerView={1}
            style={{ width: "100%", height: "300px", marginTop: "20px" }}
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="h5" fontWeight="bold">{slide.title}</Typography>
                  <Typography variant="body1" sx={{ mt: 1, maxWidth: "300px" }}>{slide.description}</Typography>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Get Started Button */}
          <Button variant="contained" color="secondary" sx={{ mt: 4, px: 4, py: 1.5, fontSize: "1.2rem" }} onClick={() => setScreen("login")}>
            Get Started
          </Button>
        </motion.div>
      )}

     {/* LOGIN SCREEN */}
        {screen === "login" && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            
            {/* Back Arrow at the Top */}
            <IconButton onClick={() => setScreen("landing")} sx={{ position: "absolute", top: 20, left: 20, color: "white" }}>
            <ArrowBackIcon fontSize="large" />
            </IconButton>

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
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>

            {/* Back Arrow at the Top */}
            <IconButton onClick={() => setScreen("login")} sx={{ position: "absolute", top: 20, left: 20, color: "white" }}>
            <ArrowBackIcon fontSize="large" />
            </IconButton>

            <Typography variant="h4" fontWeight="bold">Sign Up</Typography>
            <form onSubmit={handleSubmit}>
            <TextField label="Full Name" name="name" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField label="Course Name" name="course" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField label="Email" name="email" type="email" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <TextField label="Password" name="password" type="password" fullWidth onChange={handleChange} required sx={{ mb: 2 }} />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>Sign Up</Button>
            </form>
        </motion.div>
    )}
    </Box>
  );
};

export default Landing;
