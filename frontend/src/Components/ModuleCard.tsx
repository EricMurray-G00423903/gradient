import { Card, CardContent, Typography, Button, Box } from "@mui/material";

interface ModuleProps {
  id: string;
  name: string;
  proficiency: number;
  hasBeenTested?: boolean; // ✅ Make it optional in case of missing data
  onTakeQuiz: (moduleId: string) => void;
}

const ModuleCard: React.FC<ModuleProps> = ({ id, name, proficiency, hasBeenTested = false, onTakeQuiz }) => {
  return (
    <Card sx={{ mb: 2, p: 2, width: "100%" }}>
      <CardContent>
        <Typography variant="h6">{name}</Typography>
        <Typography variant="body2" color="textSecondary">
          Proficiency: {proficiency}%
        </Typography>
        <Box mt={2}>
          {hasBeenTested ? (
            <Typography color="success.main">✔️ Quiz Completed</Typography>
          ) : (
            <Button variant="contained" color="primary" onClick={() => onTakeQuiz(id)}>
              Take Proficiency Quiz
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
