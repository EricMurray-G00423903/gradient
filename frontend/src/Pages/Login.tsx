import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../Utils/AuthFunctions"; // Use refactored functions
import { Container, Typography, TextField, Button, Box, Paper, CircularProgress } from "@mui/material";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signupUser(email, password);
      } else {
        await loginUser(email, password);
      }
      navigate("/profile"); // Redirect to Profile after login
    } catch (err: any) {
      // Improve error messages for better UX
      if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
      <Paper elevation={6} sx={{ padding: 4, bgcolor: "#121212", color: "#fff", textAlign: "center", borderRadius: 3 }}>
        <Typography variant="h4" sx={{ color: "#b39ddb", fontWeight: "bold", mb: 2 }}>
          {isSignUp ? "Sign Up" : "Log In"}
        </Typography>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#b39ddb" } }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            InputProps={{ style: { color: "#fff" } }}
            InputLabelProps={{ style: { color: "#b39ddb" } }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: "#b39ddb", color: "#121212", fontWeight: "bold" }} disabled={loading}>
            {loading ? <CircularProgress size={24} sx={{ color: "#121212" }} /> : isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </Box>

        <Typography variant="body1" sx={{ mt: 2 }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <Button sx={{ color: "#b39ddb", textTransform: "none", ml: 1 }} onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Log In" : "Sign Up"}
          </Button>
        </Typography>
      </Paper>
    </Container>
  );
}
