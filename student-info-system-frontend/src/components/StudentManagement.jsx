import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ButtonGroup
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import Cookies from 'js-cookie';
import Layout from './Layout/Layout';

const StudentManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, student: null });
    const [newStudent, setNewStudent] = useState({
        name: '',
        studentNumber: '',
        idNumber: '',
        email: '',
        password: '',
        class: ''
    });
    const [enrollDialog, setEnrollDialog] = useState({ open: false, student: null });
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewStudent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(
                `http://localhost:3000/api/students/search?q=${searchQuery}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching students:', error);
        }
    };

    const handleAddStudent = async (event) => {
        event.preventDefault();
        
        // Frontend validation for all required fields
        const requiredFields = {
            name: 'Name',
            studentNumber: 'Student Number',
            idNumber: 'ID Number',
            email: 'Email',
            password: 'Password'
        };

        // Check all required fields
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!newStudent[field] || newStudent[field].trim() === '') {
                alert(`${label} is required`);
                return; // Stop execution if any required field is missing
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudent.email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (newStudent.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        try {
            const token = Cookies.get('token');
            const userData = JSON.parse(Cookies.get('user'));
            
            console.log('Secretary user data:', userData);
            
            const studentData = {
                name: newStudent.name.trim(),
                studentNumber: newStudent.studentNumber.trim(),
                idNumber: newStudent.idNumber.trim(),
                currentAddress: "Not Provided",
                permanentAddress: "Not Provided",
                currentPhone: "Not Provided",
                permanentPhone: "Not Provided",
                dateOfBirth: new Date().toISOString(),
                gender: "Not Specified",
                class: newStudent.class || "first year",
                program: "undergraduate",
                email: newStudent.email.trim(),
                password: newStudent.password
            };

            console.log('Sending student data:', studentData);

            const response = await axios.post(
                'http://localhost:3000/api/students',
                studentData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Server response:', response.data);

            // Reset form
            setNewStudent({
                name: '',
                studentNumber: '',
                idNumber: '',
                email: '',
                password: '',
                class: ''
            });

            // Show success message and refresh search results
            alert('Student added successfully');
            if (searchQuery) {
                handleSearch();
            }
        } catch (error) {
            console.error('Error details:', error.response?.data);
            
            let errorMessage = 'Failed to add student. ';
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message) {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        }
    };

    const handleRemoveClick = (student) => {
        setConfirmDialog({ open: true, student });
    };

    const handleRemoveStudent = async (student) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(
                `http://localhost:3000/api/students/${student.studentNumber}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConfirmDialog({ open: false, student: null });
            // Refresh search results
            handleSearch();
        } catch (error) {
            console.error('Error removing student:', error);
            alert(error.response?.data?.message || 'Failed to remove student');
        }
    };

    const fetchAvailableCourses = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(
                'http://localhost:3000/api/courses/schedule',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAvailableCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleEnrollStudent = async () => {
        try {
            const token = Cookies.get('token');
            await axios.post(
                `http://localhost:3000/api/courses/${selectedCourse}/enroll`,
                { studentId: enrollDialog.student.studentNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Close dialog and reset state
            setEnrollDialog({ open: false, student: null });
            setSelectedCourse('');
            
            // Show success message (you can add a success state and display it)
            alert('Student enrolled successfully');
            
            // Refresh the search results to show updated data
            handleSearch();
        } catch (error) {
            // Show error message to user
            alert(error.response?.data?.message || 'Failed to enroll student');
            console.error('Error enrolling student:', error);
        }
    };

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Add Student Section - Left Side */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Add New Student
                            </Typography>
                            <Box component="form" onSubmit={handleAddStudent} sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            name="name"
                                            value={newStudent.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Student Number"
                                            name="studentNumber"
                                            value={newStudent.studentNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="ID Number"
                                            name="idNumber"
                                            value={newStudent.idNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={newStudent.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Password"
                                            name="password"
                                            type="password"
                                            value={newStudent.password}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel>Class</InputLabel>
                                            <Select
                                                name="class"
                                                value={newStudent.class}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <MenuItem value="first year">First Year</MenuItem>
                                                <MenuItem value="second year">Second Year</MenuItem>
                                                <MenuItem value="third year">Third Year</MenuItem>
                                                <MenuItem value="fourth year">Fourth Year</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            sx={{ mt: 2 }}
                                        >
                                            Add Student
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Remove Student Section - Right Side */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Search Student
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Search by student number or name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{ mb: 3 }}
                                >
                                    Search
                                </Button>
                                <List>
                                    {searchResults.map((student) => (
                                        <ListItem
                                            key={student._id}
                                            divider
                                            secondaryAction={
                                                <ButtonGroup>
                                                    <IconButton
                                                        onClick={() => {
                                                            setEnrollDialog({ open: true, student });
                                                            fetchAvailableCourses();
                                                        }}
                                                        color="primary"
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleRemoveClick(student)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ButtonGroup>
                                            }
                                        >
                                            <ListItemText
                                                primary={`${student.name} (${student.studentNumber})`}
                                                secondary={`Class: ${student.class}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Confirm Remove Dialog */}
                <Dialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ open: false, student: null })}
                >
                    <DialogTitle>Remove Student</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to remove {confirmDialog.student?.name}?
                            This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmDialog({ open: false, student: null })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleRemoveStudent(confirmDialog.student)}
                            color="error"
                            autoFocus
                        >
                            Remove
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Add Enroll Dialog */}
                <Dialog
                    open={enrollDialog.open}
                    onClose={() => setEnrollDialog({ open: false, student: null })}
                >
                    <DialogTitle>Enroll Student in Course</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Select a course to enroll {enrollDialog.student?.name} in:
                        </DialogContentText>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Course</InputLabel>
                            <Select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                label="Course"
                            >
                                {availableCourses.map((course) => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.courseNumber}: {course.name} ({course.day} {course.startTime}-{course.endTime})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEnrollDialog({ open: false, student: null })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEnrollStudent}
                            variant="contained"
                            color="primary"
                            disabled={!selectedCourse}
                        >
                            Enroll
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default StudentManagement; 