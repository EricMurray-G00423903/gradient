import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { getUserCourseAndModules } from "../Utils/FirestoreService"; 

// Define authentication context type
interface AuthContextType {
  user: User | null;
  userData: any | null;
  logout: () => Promise<void>;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await getUserCourseAndModules(currentUser.uid); // ✅ Fetch Firestore Data
        setUserData(userProfile);
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
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
