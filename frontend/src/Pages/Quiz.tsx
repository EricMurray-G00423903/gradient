import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Box, CircularProgress, Typography } from "@mui/material";
import { getModuleById } from "../Utils/FirestoreService";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import QuizIntro from "../Components/QuizIntro";
import QuizQuestion from "../Components/QuizQuestion";
import QuizResults from "../Components/QuizResults";
import QuizProgress from "../Components/QuizProgress";

const HARDCODED_UID = "LDkrfJqOSvV59ddYaLTUdI9lgWB2"; // Temporary for testing

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id") || "";
  const navigate = useNavigate();

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

    const fetchModule = async () => {
      try {
        const data = await getModuleById(HARDCODED_UID, moduleId);
        if (data) {
          setModuleData(data);
        }
      } catch (error) {
        console.error("Error fetching module:", error);
      }
    };

    fetchModule();
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

    // ✅ Update Firestore with results
    await updateFirestoreResults(HARDCODED_UID, moduleId, scorePercentage);

    setStep("results");
  };

  const updateFirestoreResults = async (userId: string, moduleId: string, score: number) => {
    try {
      const moduleRef = doc(db, `users/${userId}/modules/${moduleId}`);
  
      // Fetch current proficiency from Firestore
      const moduleSnapshot = await getDoc(moduleRef);
      const currentProficiency = moduleSnapshot.exists() ? moduleSnapshot.data().proficiency || 0 : 0;
  
      // **Determine weight based on current proficiency**
      let weight = 1.0;
      if (currentProficiency < 25) weight = 0.25; // Beginner
      else if (currentProficiency < 50) weight = 0.5; // Intermediate
      else if (currentProficiency < 75) weight = 0.75; // Advanced
      else if (currentProficiency < 90) weight = 0.9; // Very Advanced
      else weight = 1.0; // Expert
  
      // **Calculate new proficiency score**
      const proficiencyIncrease = Math.round(score * weight);
      const newProficiency = Math.max(currentProficiency, proficiencyIncrease); // ✅ Only increase, never decrease
  
      // **Update Firestore if proficiency has improved**
      if (newProficiency > currentProficiency) {
        await updateDoc(moduleRef, {
          hasBeenTested: true,
          lastTested: Timestamp.now(),
          proficiency: newProficiency, // ✅ Update proficiency only if it's increasing
        });
  
        console.log(`🔥 Firestore updated: Proficiency increased from ${currentProficiency} → ${newProficiency}`);
      } else {
        // **Still update lastTested and hasBeenTested even if proficiency doesn't change**
        await updateDoc(moduleRef, {
          hasBeenTested: true,
          lastTested: Timestamp.now(),
          proficiency: currentProficiency, // ✅ Keep the same proficiency
        });
  
        console.log("⚠️ Firestore updated: Last tested timestamp updated, but proficiency remains the same.");
      }
    } catch (error) {
      console.error("❌ Error updating Firestore:", error);
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
