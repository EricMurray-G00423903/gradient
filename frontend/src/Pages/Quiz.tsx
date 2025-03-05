import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Box, CircularProgress, Typography } from "@mui/material";
import { getModuleById } from "../Utils/FirestoreService";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import QuizIntro from "../Components/QuizIntro";
import QuizQuestion from "../Components/QuizQuestion";
import QuizResults from "../Components/QuizResults";
import QuizProgress from "../Components/QuizProgress";

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id") || "";
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  useEffect(() => {
    if (!moduleId) {
      console.error("No module ID found.");
      navigate("/modules");
      return;
    }
  
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const data = await getModuleById(user.uid, moduleId);
          if (data) {
            setModuleData(data);
          } else {
            console.error("Module not found for user:", user.uid);
          }
        } catch (error) {
          console.error("Error fetching module:", error);
        }
      } else {
        navigate("/login"); // Redirect if user is not authenticated
      }
    });
  
    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, [moduleId, navigate]);
  

  const startQuiz = async () => {
    if (!moduleData) return;

    setLoading(true);
    setError(null);
    setQuizQuestions([]); // ✅ Clears old questions before fetching new ones
    setUserAnswers({}); // ✅ Reset user answers
    setCurrentQuestionIndex(0); // ✅ Reset question index

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/gradient-3b33e/us-central1/generateQuizQuestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleName: moduleData.name,
            proficiencyScore: moduleData.proficiency || 0,
            moduleDescription: moduleData.description || "No description provided.",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch quiz questions");

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) throw new Error("Invalid response format from AI");

      setQuizQuestions(data.questions);
      setStep("questions");
    } catch (err) {
      console.error("Quiz API Error:", err);
      setError("Failed to generate quiz. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedAnswer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer, // ✅ Store answer for current question
    }));

    // ✅ Move to next question after storing answer
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 500); // ⏳ Small delay for better UX
    } else {
      setTimeout(() => {
        handleQuizFinish(); // ✅ When last question is reached, finish quiz
      }, 500);
    }
  };

  const handleQuizFinish = async () => {
    const totalQuestions = quizQuestions.length;
    const correctAnswers = Object.keys(userAnswers).filter(
      (index) => userAnswers[parseInt(index)] === quizQuestions[parseInt(index)].correctAnswer
    ).length;

    const scorePercentage = (correctAnswers / totalQuestions) * 100;

    // 🔥 Categorize Strong & Weak Topics
    const topicScores: { [topic: string]: number } = {};

    quizQuestions.forEach((q, index) => {
      if (!topicScores[q.topic]) topicScores[q.topic] = 0;
      if (userAnswers[index] === q.correctAnswer) topicScores[q.topic] += 1; // ✅ Correct answer = +1
    });

    const strongTopics = Object.keys(topicScores).filter((topic) => {
      const totalAppearances = quizQuestions.filter((q) => q.topic === topic).length;
      const accuracy = topicScores[topic] / totalAppearances;
      return accuracy >= 0.75;
    });
    
    const weakTopics = Object.keys(topicScores).filter((topic) => {
      const totalAppearances = quizQuestions.filter((q) => q.topic === topic).length;
      const accuracy = topicScores[topic] / totalAppearances;
      return accuracy < 0.75;
    });
    

    // ✅ Update Firestore with results
    if (userId) {
      await updateFirestoreResults(userId, moduleId, scorePercentage, strongTopics, weakTopics);
      fetchStudyPlan(userId, moduleId, scorePercentage, weakTopics);
    } else {
      console.error("User ID is null. Cannot update Firestore results.");
    }

    setStep("results");
};

const updateFirestoreResults = async (userId: string, moduleId: string, score: number, strongTopics: string[], weakTopics: string[]) => {
    try {
      const moduleRef = doc(db, `users/${userId}/modules/${moduleId}`);

      // Fetch current proficiency & previous topic data from Firestore
      const moduleSnapshot = await getDoc(moduleRef);
      const currentProficiency = moduleSnapshot.exists() ? moduleSnapshot.data().proficiency || 0 : 0;
      const existingStrongTopics = moduleSnapshot.exists() ? moduleSnapshot.data().strongTopics || {} : {};
      const existingWeakTopics = moduleSnapshot.exists() ? moduleSnapshot.data().weakTopics || {} : {};

      // **Determine weight based on current proficiency**
      let weight = 1.0;
      let proficiencyLevel = "Expert";
      if (currentProficiency < 25) { weight = 0.25; proficiencyLevel = "Beginner"; }
      else if (currentProficiency < 50) { weight = 0.5; proficiencyLevel = "Intermediate"; }
      else if (currentProficiency < 75) { weight = 0.75; proficiencyLevel = "Advanced"; }
      else if (currentProficiency < 90) { weight = 0.9; proficiencyLevel = "Very Advanced"; }

      // **Calculate new proficiency score**
      const proficiencyIncrease = Math.round(score * weight);
      const newProficiency = Math.max(currentProficiency, proficiencyIncrease); // ✅ Only increase, never decrease

      // 🔥 Update Strong & Weak Topics (Store only Level, NOT raw scores)
      strongTopics.forEach(topic => {
        existingStrongTopics[topic] = proficiencyLevel;
      });

      weakTopics.forEach(topic => {
        existingWeakTopics[topic] = proficiencyLevel;
      });

      // ✅ Always update lastTested & hasBeenTested
      const updateData: any = {
        hasBeenTested: true,
        lastTested: Timestamp.now(),
        strongTopics: existingStrongTopics,
        weakTopics: existingWeakTopics,
      };

      // ✅ Only update proficiency if it's increasing
      if (newProficiency > currentProficiency) {
        updateData.proficiency = newProficiency;
        console.log(`🔥 Firestore updated: Proficiency increased from ${currentProficiency} → ${newProficiency}`);
      } else {
        updateData.proficiency = currentProficiency;
        console.log("⚠️ Firestore updated: Last tested timestamp updated, but proficiency remains the same.");
      }

      // ✅ Update Firestore
      await updateDoc(moduleRef, updateData);

    } catch (error) {
      console.error("❌ Error updating Firestore:", error);
    }
};

const fetchStudyPlan = async (userId: string, moduleId: string, proficiency: number, weakTopics: string[]) => {
  try {
      console.log("📢 Fetching study plan...");

      // **Fetch Module Data**
      const moduleRef = doc(db, `users/${userId}/modules/${moduleId}`);
      const moduleSnapshot = await getDoc(moduleRef);
      if (!moduleSnapshot.exists()) {
          console.error("❌ Module not found.");
          return;
      }

      const moduleData = moduleSnapshot.data();
      const moduleName = moduleData.name || "Unknown Module";
      const moduleDescription = moduleData.description || "No description provided.";

      // **Call Backend Function**
      const response = await fetch("http://127.0.0.1:5001/gradient-3b33e/us-central1/generateStudyPlan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              moduleName,
              moduleDescription,
              proficiency,
              weakTopics
          }),
      });

      if (!response.ok) throw new Error("Failed to fetch study plan");

      const studyPlan = await response.json();

      console.log("✅ Study Plan Received:", studyPlan);

      // **Store Study Plan in Firestore**
      await updateDoc(moduleRef, {
          studyPlan, // Directly store study plan
      });

      console.log("🔥 Study plan saved to Firestore!");
  } catch (error) {
      console.error("❌ Error fetching study plan:", error);
  }
};

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {step === "intro" && moduleData && (
          <>
            <QuizIntro module={moduleData} onStart={startQuiz} />
            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}
          </>
        )}

        {step === "questions" && quizQuestions.length > 0 && (
          <>
            <QuizProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={quizQuestions.length}
            />
            <QuizQuestion
              question={quizQuestions[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              userAnswer={userAnswers[currentQuestionIndex] || ""} // ✅ Fix: Pass single answer
              onAnswer={handleAnswer}
            />
          </>
        )}

        {step === "results" && (
          <QuizResults
            module={moduleData}
            userAnswers={userAnswers}
            questions={quizQuestions}
            onFinish={() => navigate("/modules")} // ✅ Fix: Handle quiz completion
          />
        )}
      </Box>
    </Container>
  );
};

export default Quiz;