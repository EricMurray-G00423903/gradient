import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Define the structure of authentication context
interface AuthContextType {
  user: User | null; // Firebase Auth user object
  userData: any | null; // Additional user details from Firestore
  logout: () => Promise<void>; // Function to handle user logout
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authentication Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    // Firebase listener for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch user profile data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setUserData(userDoc.exists() ? userDoc.data() : null);
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return <AuthContext.Provider value={{ user, userData, logout }}>{children}</AuthContext.Provider>;
};

// Custom hook for accessing authentication state
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
