import { getFirestore, doc, setDoc, getDoc, getDocs, updateDoc, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
const auth = getAuth();

// ✅ Define Module Type
interface Module {
    id: string;
    name: string;
    proficiency?: number;
    lastTested?: Date | null;
    hasBeenTested?: boolean;
  }

/**
 * Create a new user document in Firestore
 */
export const createUserProfile = async (uid: string, name: string, email: string) => {
  try {
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      course: null, // User selects later
    });
    console.log("User profile created successfully.");
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

/**
 * Set the user's course in Firestore
 */
export const setUserCourse = async (uid: string, courseName: string) => {
    try {
      console.log(`Saving course "${courseName}" for user ${uid}`);
  
      await setDoc(doc(db, "users", uid), { course: courseName }, { merge: true });
  
      console.log("Firestore: Course saved successfully!");
    } catch (error) {
      console.error("Firestore: Error saving course:", error);
    }
  };

/**
 * Add a module for a user
 */
export const addModule = async (uid: string, moduleName: string) => {
  try {
    const moduleRef = await addDoc(collection(db, "users", uid, "modules"), {
      name: moduleName,
      proficiency: 0, // Default
      lastTested: null,
      hasBeenTested: false,
    });
    console.log("Module added with ID:", moduleRef.id);
  } catch (error) {
    console.error("Error adding module:", error);
  }
};

/**
 * Update module proficiency
 */
export const updateModuleProficiency = async (uid: string, moduleId: string, proficiency: number) => {
  try {
    await updateDoc(doc(db, "users", uid, "modules", moduleId), {
      proficiency,
      lastTested: new Date(),
      hasBeenTested: true,
    });
    console.log("Module proficiency updated.");
  } catch (error) {
    console.error("Error updating module proficiency:", error);
  }
};

/**
 * Get user profile details from Firestore
 */
export const getUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data(); // Returns { name: "Eric", email: "eric@example.com", ... }
      } else {
        return null; // User does not exist
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  /**
 * Get the user's course and modules from Firestore
 */
  export const getUserCourseAndModules = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      let course = null;
      let name = null; // ✅ Add name variable
      let modules = [];
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        course = userData.course || null;
        name = userData.name || null; // ✅ Fetch name from Firestore
      }
  
      // Fetch modules subcollection
      const modulesCollectionRef = collection(db, "users", uid, "modules");
      const modulesSnapshot = await getDocs(modulesCollectionRef);
  
      modules = modulesSnapshot.docs.map((doc) => {
        const data = doc.data() as Module;
        return {
          id: doc.id,
          name: data.name || "Untitled Module", // Ensure name exists
          proficiency: data.proficiency || 0,
          lastTested: data.lastTested || null,
          hasBeenTested: data.hasBeenTested || false,
        };
      });
      
      return { name, course, modules }; // ✅ Return name along with course and modules
    } catch (error) {
      console.error("Firestore: Error fetching course and modules:", error);
      return { name: null, course: null, modules: [] };
    }
  };

  