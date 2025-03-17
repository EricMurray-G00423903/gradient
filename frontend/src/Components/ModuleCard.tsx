import { Card, CardContent, Typography, Button, Box } from "@mui/material";

interface ModuleProps {
  id: string;
  name: string;
  description?: string;
  proficiency: number;
  hasBeenTested?: boolean;
  ready?: boolean;
}

const ModuleCard: React.FC<ModuleProps> = ({ id, name, description, proficiency, hasBeenTested = false, ready = true }) => {
  return (
    <Card sx={{ 
      mb: 2, 
      p: 2, 
      width: "100%", 
      boxShadow: '0 4px 12px rgba(85, 0, 170, 0.1)',
      borderRadius: '12px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 8px 16px rgba(85, 0, 170, 0.2)',
      }
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#5500aa" }}>{name}</Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Proficiency: {proficiency}%
        </Typography>

        <Box mt={2}>
          <Button 
            variant="contained" 
            color="primary" 
            disabled={!ready}
            onClick={() => ready && (window.location.href = `/module-details?id=${id}`)}
            sx={{
              borderRadius: '8px',
              fontWeight: 500,
              boxShadow: 'none',
            }}
          >
            Go to Module
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
