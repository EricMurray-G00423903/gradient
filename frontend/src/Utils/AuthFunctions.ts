import { auth } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  signOut 
} from "firebase/auth";

// ✅ Ensure persistent login
setPersistence(auth, browserLocalPersistence);

/**
 * Logs in an existing user with email and password.
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Pass the error back to the UI
  }
};

/**
 * Creates a new user account with email and password.
 */
export const signupUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Signup error:", error);
    throw error; // Pass the error back to the UI
  }
};

/**
 * Logs out the currently signed-in user.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
