import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Container, Box } from "@mui/material";
import { getModuleById } from "../Utils/FirestoreService";
import QuizIntro from "../Components/QuizIntro";
import QuizQuestion from "../Components/QuizQuestion";
import QuizResults from "../Components/QuizResults";
import QuizProgress from "../Components/QuizProgress";
import { DocumentData } from "firebase/firestore";

const HARDCODED_UID = "LDkrfJqOSvV59ddYaLTUdI9lgWB2"; // Temporary for testing

interface ModuleData {
  name: string;
}

interface Question {
  question: string;
  answers: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  topic: string;
}

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id") || "";
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!moduleId) {
      console.error("No module ID found.");
      navigate("/modules");
      return;
    }

    const fetchModule = async () => {
      try {
        const data: DocumentData | null = await getModuleById(HARDCODED_UID, moduleId);
        if (data && data.name) {
          setModuleData({ name: data.name });
        } else {
          console.error("Invalid module data:", data);
        }
      } catch (error) {
        console.error("Error fetching module:", error);
      }
    };

    fetchModule();
  }, [moduleId, navigate]);

  const startQuiz = async () => {
    // TODO: Replace with OpenAI-generated questions
    setQuizQuestions([
      {
        question: "What is the purpose of inheritance in OOP?",
        answers: { A: "To store variables", B: "To reuse code", C: "To define loops", D: "To create arrays" },
        correctAnswer: "B",
        topic: "Inheritance",
      },
      {
        question: "What does 'encapsulation' mean in OOP?",
        answers: { A: "Hiding implementation details", B: "Copying objects", C: "Running parallel threads", D: "Creating variables" },
        correctAnswer: "A",
        topic: "Encapsulation",
      },
    ]);
    setStep("questions");
  };

  const handleAnswer = (questionIndex: number, selectedAnswer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedAnswer,
    }));

    if (questionIndex < quizQuestions.length - 1) {
      setCurrentQuestion(questionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizCompleted(true);
    setStep("results");
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {step === "intro" && moduleData && <QuizIntro module={moduleData} onStart={startQuiz} />}
        {step === "questions" && quizQuestions.length > 0 && (
          <>
            <QuizProgress totalQuestions={quizQuestions.length} currentQuestion={currentQuestion} />
            <QuizQuestion
              question={quizQuestions[currentQuestion]}
              questionIndex={currentQuestion}
              userAnswers={userAnswers}
              onAnswer={handleAnswer}
              onFinish={finishQuiz}
            />
          </>
        )}
        {step === "results" && moduleData && (
          <QuizResults
            module={moduleData}
            userAnswers={userAnswers}
            questions={quizQuestions}
            onFinish={() => navigate("/modules")}
          />
        )}
      </Box>
    </Container>
  );
};

export default Quiz;
