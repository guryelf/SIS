import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Layout from './Layout/Layout';

const ManageDepartmentSchedule = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, course: null, action: '' });
    const [addCourseDialog, setAddCourseDialog] = useState({ open: false, course: null });
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 9 }, (_, i) => `${i + 9}:00`); // 9:00 to 17:00
    const classrooms = ['101', '102', '103', '104', '105', '201', '202', '203', '204', '205'];

    useEffect(() => {
        fetchSchedule();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchSchedule();
        }, 5000); // 5 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const fetchSchedule = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:3000/api/courses/schedule', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchedule(response.data);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:3000/api/courses/search?q=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to search courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        try {
            if (!addCourseDialog.course || !selectedDay || !selectedTimeSlot || !selectedClassroom) {
                setError('Please fill in all required fields');
                return;
            }

            const token = Cookies.get('token');
            await axios.post(
                'http://localhost:3000/api/courses/schedule',
                {
                    courseId: addCourseDialog.course._id,
                    day: selectedDay,
                    startTime: selectedTimeSlot,
                    classroom: selectedClassroom,
                    instructor: 'TBD'
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Course added to schedule successfully');
            setAddCourseDialog({ open: false, course: null });
            setSelectedDay('');
            setSelectedTimeSlot('');
            setSelectedClassroom('');
            await fetchSchedule();
        } catch (error) {
            console.error('Error adding course:', error);
            setError(error.response?.data?.message || 'Failed to add course to schedule');
        }
    };

    const handleRemoveCourse = async (course) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(
                `http://localhost:3000/api/courses/schedule/${course._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Course removed from schedule successfully');
            setConfirmDialog({ open: false, course: null, action: '' });
            await fetchSchedule();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to remove course from schedule');
        }
    };

    const handleCourseClick = (course) => {
        setSelectedCourse(course);
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Course Search Section */}
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Search Courses to Add
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            label="Search by course name or number"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            startIcon={<SearchIcon />}
                        >
                            Search
                        </Button>
                    </Box>

                    {loading && <CircularProgress sx={{ mt: 2 }} />}
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    {searchResults.length > 0 && (
                        <List sx={{ mt: 2 }}>
                            {searchResults.map((course) => (
                                <ListItem key={course._id} divider>
                                    <ListItemText
                                        primary={`${course.courseNumber}: ${course.name}`}
                                        secondary={course.description}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => setAddCourseDialog({
                                                open: true,
                                                course
                                            })}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>

                {/* Current Schedule Section */}
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Department Schedule
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
                                                        height: 100,
                                                        backgroundColor: 'inherit',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {coursesAtTime.map((course) => (
                                                        <Box 
                                                            key={course._id} 
                                                            onClick={() => handleCourseClick(course)}
                                                            sx={{ 
                                                                backgroundColor: '#2196f3',
                                                                color: 'white',
                                                                borderRadius: 1,
                                                                p: 1,
                                                                cursor: 'pointer',
                                                                textAlign: 'center',
                                                                '&:hover': {
                                                                    backgroundColor: '#1976d2',
                                                                    boxShadow: 1
                                                                }
                                                            }}
                                                        >
                                                            <Typography 
                                                                variant="body2" 
                                                                sx={{ 
                                                                    fontWeight: 'medium',
                                                                    fontSize: '0.875rem'
                                                                }}
                                                            >
                                                                {course.courseNumber}
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

                {/* Add Course Dialog */}
                <Dialog
                    open={addCourseDialog.open}
                    onClose={() => setAddCourseDialog({ open: false, course: null })}
                >
                    <DialogTitle>Add Course to Schedule</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Select the day, time slot, and classroom for {addCourseDialog.course?.name}
                        </DialogContentText>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Day</InputLabel>
                            <Select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                label="Day"
                            >
                                {weekDays.map((day) => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Time Slot</InputLabel>
                            <Select
                                value={selectedTimeSlot}
                                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                label="Time Slot"
                            >
                                {timeSlots.map((time) => (
                                    <MenuItem key={time} value={time}>{time}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Classroom</InputLabel>
                            <Select
                                value={selectedClassroom}
                                onChange={(e) => setSelectedClassroom(e.target.value)}
                                label="Classroom"
                            >
                                {classrooms.map((room) => (
                                    <MenuItem key={room} value={room}>{room}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddCourseDialog({ open: false, course: null })}>Cancel</Button>
                        <Button onClick={handleAddCourse} variant="contained" color="primary">
                            Add to Schedule
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Course Details Dialog */}
                <Dialog 
                    open={Boolean(selectedCourse)} 
                    onClose={() => setSelectedCourse(null)}
                    maxWidth="sm"
                    fullWidth
                >
                    {selectedCourse && (
                        <>
                            <DialogTitle sx={{ pb: 1 }}>
                                {selectedCourse.courseNumber}: {selectedCourse.name}
                            </DialogTitle>
                            <DialogContent dividers>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Description:</strong> {selectedCourse.description}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Instructor:</strong> {selectedCourse.instructor}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Room:</strong> {selectedCourse.classroom}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Time:</strong> {selectedCourse.startTime} - {selectedCourse.endTime}
                                    </Typography>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Capacity:</strong> {selectedCourse.enrolledStudents?.length || 0}/{selectedCourse.capacity}
                                    </Typography>
                                </Box>
                            </DialogContent>
                            <DialogActions>
                                <Button 
                                    color="error" 
                                    onClick={() => {
                                        setConfirmDialog({
                                            open: true,
                                            course: selectedCourse,
                                            action: 'remove'
                                        });
                                        setSelectedCourse(null);
                                    }}
                                    startIcon={<DeleteIcon />}
                                >
                                    Remove Course
                                </Button>
                                <Button onClick={() => setSelectedCourse(null)}>Close</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

                {/* Confirm Remove Dialog */}
                <Dialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ open: false, course: null, action: '' })}
                >
                    <DialogTitle>Remove Course</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to remove {confirmDialog.course?.courseNumber}: {confirmDialog.course?.name} from the schedule?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={() => setConfirmDialog({ open: false, course: null, action: '' })}
                        >
                            Cancel
                        </Button>
                        <Button 
                            color="error" 
                            onClick={() => handleRemoveCourse(confirmDialog.course)}
                            autoFocus
                        >
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default ManageDepartmentSchedule; 