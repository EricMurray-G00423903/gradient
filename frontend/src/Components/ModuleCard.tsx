import { Card, CardContent, Typography, Button, Box } from "@mui/material";

interface ModuleProps {
  id: string;
  name: string;
  description?: string;
  proficiency: number;
  hasBeenTested?: boolean;
}

const ModuleCard: React.FC<ModuleProps> = ({ id, name, description, proficiency, hasBeenTested = false }) => {
  return (
    <Card sx={{ mb: 2, p: 2, width: "100%" }}>
      <CardContent>
        <Typography variant="h6">{name}</Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Proficiency: {proficiency}%
        </Typography>

        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={() => window.location.href = `/module-details?id=${id}`}>
            Go to Module
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
