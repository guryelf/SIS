import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Grid,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from 'axios';
import Layout from './Layout/Layout';

const DepartmentSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 9 }, (_, i) => `${i + 9}:00`); // 9:00 to 17:00

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            console.log('Fetching schedule...');
            const response = await axios.get('http://localhost:3000/api/courses/schedule');
            console.log('Schedule data:', response.data);
            setSchedule(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            setError('Failed to load course schedule');
            setLoading(false);
        }
    };

    const handleCourseClick = (course) => {
        console.log('Course clicked:', course);
        setSelectedCourse(course);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        console.log('Closing dialog');
        setDialogOpen(false);
        setSelectedCourse(null);
    };

    if (loading) {
        return (
            <Layout>
                <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Container>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Container sx={{ mt: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom align="center" color="primary">
                        Computer Science Department Schedule
                    </Typography>
                    <Typography variant="h6" gutterBottom align="center" color="text.secondary">
                        Current Semester
                    </Typography>

                    <Box sx={{ overflowX: 'auto' }}>
                        <Grid container sx={{ mt: 3, minWidth: 800 }}>
                            {/* Time slots column */}
                            <Grid item xs={2}>
                                <Box sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}>
                                    <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', height: 50 }}>
                                        <Typography variant="subtitle2" align="center">Time</Typography>
                                    </Box>
                                    {timeSlots.map((time) => (
                                        <Box key={time} sx={{ p: 1, borderBottom: 1, borderColor: 'divider', height: 100 }}>
                                            <Typography variant="body2" align="center">{time}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Grid>

                            {/* Days columns */}
                            {weekDays.map((day) => (
                                <Grid item xs={2} key={day}>
                                    <Box sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}>
                                        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', height: 50 }}>
                                            <Typography variant="subtitle2" align="center">{day}</Typography>
                                        </Box>
                                        {timeSlots.map((time) => {
                                            const coursesAtTime = schedule.filter(
                                                course => course.day === day && course.startTime === time
                                            );
                                            return (
                                                <Box 
                                                    key={`${day}-${time}`} 
                                                    sx={{ 
                                                        p: 1, 
                                                        borderBottom: 1, 
                                                        borderColor: 'divider',
                                                        height: coursesAtTime.length > 1 ? 120 : 100,
                                                        backgroundColor: 'inherit',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {coursesAtTime.map((course) => (
                                                        <Box 
                                                            key={course._id}
                                                            onClick={() => handleCourseClick(course)}
                                                            sx={{ 
                                                                backgroundColor: 'primary.main',
                                                                color: 'white',
                                                                borderRadius: 1,
                                                                p: 0.5,
                                                                cursor: 'pointer',
                                                                minHeight: '30px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center',
                                                                '&:hover': {
                                                                    backgroundColor: 'primary.dark',
                                                                    transform: 'scale(1.02)',
                                                                    transition: 'all 0.2s'
                                                                }
                                                            }}
                                                        >
                                                            <Typography 
                                                                variant="body2" 
                                                                align="center"
                                                                sx={{ 
                                                                    fontSize: '0.75rem',
                                                                    lineHeight: 1.2,
                                                                    fontWeight: 'medium',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                            >
                                                                {course.courseNumber}
                                                            </Typography>
                                                            <Typography 
                                                                variant="caption" 
                                                                align="center"
                                                                sx={{ 
                                                                    fontSize: '0.7rem',
                                                                    lineHeight: 1.1,
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}
                                                            >
                                                                Room {course.classroom}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Paper>

                {/* Course Details Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    {selectedCourse && (
                        <>
                            <DialogTitle>
                                {selectedCourse.courseNumber}: {selectedCourse.name}
                            </DialogTitle>
                            <DialogContent dividers>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Description:</strong> {selectedCourse.description}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Instructor:</strong> {selectedCourse.instructor}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Level:</strong> {selectedCourse.level}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Semester Hours:</strong> {selectedCourse.semesterHours}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Current Capacity:</strong> {selectedCourse.enrolledStudents?.length || 0}/{selectedCourse.capacity}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    <strong>Time:</strong> {selectedCourse.startTime} - {selectedCourse.endTime}
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog}>Close</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </Container>
        </Layout>
    );
};

export default DepartmentSchedule; 