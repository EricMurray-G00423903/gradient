import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Function to register a new user
export const signupUser = async (email: string, password: string, fullName: string, course: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Store additional user data in Firestore
  await setDoc(doc(db, "users", user.uid), { uid: user.uid, email, fullName, course });

  return user;
};

// Function to authenticate an existing user
export const loginUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};
