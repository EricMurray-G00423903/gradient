import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

// Mock module data (to replace with Firestore later)
const mockModules = [
  { id: "1", name: "React Basics", proficiency: 75 },
  { id: "2", name: "TypeScript", proficiency: 60 },
  { id: "3", name: "Firebase Auth", proficiency: 80 },
];

const Profile = () => {
  const { user, userData } = useAuth(); // Access user authentication data
  const [modules, setModules] = useState(mockModules); // Use mock data
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>Profile</h2>
        {/* Settings button redirects to the settings page */}
        <IconButton onClick={() => navigate("/settings")}>
          <SettingsIcon />
        </IconButton>
      </header>

      <section className="user-info">
        <h3>{userData?.fullName || "John Doe"}</h3>
        <p>Email: {userData?.email || "john.doe@example.com"}</p>
        <p>Course: {userData?.course || "Computer Science"}</p>
      </section>

      <section className="modules-section">
        <h3>Your Modules</h3>
        {modules.length > 0 ? (
          <ul>
            {modules.map((mod) => (
              <li key={mod.id}>{mod.name} - Proficiency: {mod.proficiency}%</li>
            ))}
          </ul>
        ) : (
          <p>No modules added yet.</p>
        )}
      </section>
    </div>
  );
};

export default Profile;
