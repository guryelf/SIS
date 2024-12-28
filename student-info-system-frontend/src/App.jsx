import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import MessageAlert from './components/MessageAlert';
import DepartmentSchedule from './components/DepartmentSchedule';
import StudentSchedule from './components/StudentSchedule';
import CourseManagement from './components/CourseManagement';
import ManageDepartmentSchedule from './components/ManageDepartmentSchedule';
import StudentManagement from './components/StudentManagement';

// Create a light theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MessageAlert />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course-schedule" element={<DepartmentSchedule />} />

          {/* Student Routes */}
          <Route 
            path="/my-schedule" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentSchedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-courses" 
            element={
              <ProtectedRoute allowedRoles={['student', 'department_secretary']}>
                <CourseManagement />
              </ProtectedRoute>
            } 
          />

          {/* Secretary Routes */}
          <Route 
            path="/manage-students" 
            element={
              <ProtectedRoute allowedRoles={['department_secretary']}>
                <StudentManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-department-courses" 
            element={
              <ProtectedRoute allowedRoles={['department_secretary']}>
                <ManageDepartmentSchedule />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
