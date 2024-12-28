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
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Layout from './Layout/Layout';

const CourseManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, course: null, action: '' });
    const [studentId, setStudentId] = useState('');
    const [isSecretary, setIsSecretary] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState('');
    const [studentSearchResults, setStudentSearchResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        studentNumber: '',
        idNumber: '',
        currentAddress: '',
        permanentAddress: '',
        dateOfBirth: '',
        gender: '',
        classYear: '',
        major: '',
        minor: '',
        program: ''
    });

    useEffect(() => {
        const initializeComponent = async () => {
            try {
                const user = Cookies.get('user');
                if (user) {
                    const userData = JSON.parse(user);
                    const isSecretaryRole = userData.role === 'department_secretary';
                    setIsSecretary(isSecretaryRole);
                    
                    if (!isSecretaryRole) {
                        await fetchEnrolledCourses();
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
            } finally {
                setLoading(false);
            }
        };
        
        initializeComponent();
    }, []);

    const fetchEnrolledCourses = async (targetStudentId = '') => {
        try {
            const token = Cookies.get('token');
            const endpoint = isSecretary && targetStudentId 
                ? `/api/students/${targetStudentId}/courses`
                : '/api/students/my-courses';
            
            const response = await axios.get(`http://localhost:3000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolledCourses(response.data);
            setError('');
        } catch (error) {
            if (!isSecretary) {
                setError(error.response?.data?.message || 'Failed to fetch enrolled courses');
            }
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:3000/api/courses/schedule`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
            setError('');
        } catch (error) {
            console.error('Error searching courses:', error);
            setError(error.response?.data?.message || 'Failed to search courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async (course) => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const courseGroupId = course._id;
            const endpoint = isSecretary && studentId 
                ? `/api/students/${studentId}/courses/${courseGroupId}`
                : `/api/students/my-courses/${courseGroupId}`;

            await axios.post(`http://localhost:3000${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccess('Course added successfully');
            await fetchEnrolledCourses(studentId);
            setConfirmDialog({ open: false, course: null, action: '' });
        } catch (error) {
            console.error('Error adding course:', error);
            setError(error.response?.data?.message || 'Failed to add course');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCourse = async (course) => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const endpoint = isSecretary && studentId 
                ? `/api/students/${studentId}/courses/${course._id}`
                : `/api/students/my-courses/${course._id}`;

            await axios.delete(`http://localhost:3000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSuccess('Course removed successfully');
            fetchEnrolledCourses(studentId);
            setConfirmDialog({ open: false, course: null, action: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to remove course');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSearch = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const response = await axios.get(
                `http://localhost:3000/api/students/search?query=${studentSearchQuery}&criteria=${studentSearchCriteria}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStudentSearchResults(response.data);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to search students');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            await axios.post(
                'http://localhost:3000/api/students',
                newStudent,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Student added successfully');
            setShowAddStudentDialog(false);
            setNewStudent({
                name: '',
                studentNumber: '',
                idNumber: '',
                currentAddress: '',
                permanentAddress: '',
                dateOfBirth: '',
                gender: '',
                classYear: '',
                major: '',
                minor: '',
                program: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            await axios.delete(
                `http://localhost:3000/api/students/${selectedStudent.studentNumber}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Student deleted successfully');
            setShowDeleteConfirmDialog(false);
            setSelectedStudent(null);
            handleStudentSearch(); // Refresh the search results
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete student');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (student) => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const response = await axios.get(
                `http://localhost:3000/api/students/${student.studentNumber}/details`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedStudent({ ...response.data.student, enrolledCourses: response.data.enrolledCourses });
            setShowDetailsDialog(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch student details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        {/* Secretary Student Search Section */}
                        {isSecretary && (
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Search Student
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField
                                        fullWidth
                                        label="Student ID"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleStudentSearch}
                                        startIcon={<SearchIcon />}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </Paper>
                        )}

                        {/* Course Search Section */}
                        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Search Courses
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    label="Search by course name or description"
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
                            {!isSecretary && error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                            {searchResults.length > 0 && (
                                <List sx={{ mt: 2 }}>
                                    {searchResults.map((course) => (
                                        <ListItem key={course._id} divider>
                                            <ListItemText
                                                primary={`${course.courseNumber}: ${course.name}`}
                                                secondary={
                                                    <>
                                                        {course.description}
                                                        <br />
                                                        {`${course.day} ${course.startTime}-${course.endTime}`}
                                                    </>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => setConfirmDialog({
                                                        open: true,
                                                        course,
                                                        action: 'add'
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

                        {/* Enrolled Courses Section */}
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                {isSecretary ? `Student's Enrolled Courses` : 'My Enrolled Courses'}
                            </Typography>
                            {enrolledCourses.length > 0 ? (
                                <List>
                                    {enrolledCourses.map((course) => (
                                        <ListItem key={course._id} divider>
                                            <ListItemText
                                                primary={`${course.courseNumber}: ${course.name}`}
                                                secondary={`${course.day} ${course.startTime}-${course.endTime}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => setConfirmDialog({
                                                        open: true,
                                                        course,
                                                        action: 'remove'
                                                    })}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography color="text.secondary" align="center">
                                    No courses enrolled
                                </Typography>
                            )}
                        </Paper>

                        {/* Student Management Section for Secretary */}
                        {isSecretary && (
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Student Management</Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setShowAddStudentDialog(true)}
                                    >
                                        Add New Student
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                                    <FormControl sx={{ minWidth: 120 }}>
                                        <InputLabel>Search By</InputLabel>
                                        <Select
                                            value={studentSearchCriteria}
                                            onChange={(e) => setStudentSearchCriteria(e.target.value)}
                                            label="Search By"
                                        >
                                            <MenuItem value="number">Student Number</MenuItem>
                                            <MenuItem value="name">Name</MenuItem>
                                            <MenuItem value="program">Program</MenuItem>
                                            <MenuItem value="class">Class</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth
                                        label="Search students"
                                        value={studentSearchQuery}
                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleStudentSearch}
                                        startIcon={<SearchIcon />}
                                    >
                                        Search
                                    </Button>
                                </Box>

                                {studentSearchResults.length > 0 && (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Student Number</TableCell>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Class</TableCell>
                                                    <TableCell>Major</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {studentSearchResults.map((student) => (
                                                    <TableRow key={student._id}>
                                                        <TableCell>{student.studentNumber}</TableCell>
                                                        <TableCell>{student.name}</TableCell>
                                                        <TableCell>{student.classYear}</TableCell>
                                                        <TableCell>{student.major}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                onClick={() => handleViewDetails(student)}
                                                                color="primary"
                                                            >
                                                                <VisibilityIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => {
                                                                    setSelectedStudent(student);
                                                                    setShowDeleteConfirmDialog(true);
                                                                }}
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Paper>
                        )}

                        {/* Add Student Dialog */}
                        <Dialog
                            open={showAddStudentDialog}
                            onClose={() => setShowAddStudentDialog(false)}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogContent>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Student Name"
                                            value={newStudent.name}
                                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Student Number"
                                            value={newStudent.studentNumber}
                                            onChange={(e) => setNewStudent({ ...newStudent, studentNumber: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="ID Number"
                                            value={newStudent.idNumber}
                                            onChange={(e) => setNewStudent({ ...newStudent, idNumber: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Date of Birth"
                                            type="date"
                                            value={newStudent.dateOfBirth}
                                            onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Gender</InputLabel>
                                            <Select
                                                value={newStudent.gender}
                                                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                                                label="Gender"
                                            >
                                                <MenuItem value="M">Male</MenuItem>
                                                <MenuItem value="F">Female</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Class Year"
                                            value={newStudent.classYear}
                                            onChange={(e) => setNewStudent({ ...newStudent, classYear: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Current Address"
                                            value={newStudent.currentAddress}
                                            onChange={(e) => setNewStudent({ ...newStudent, currentAddress: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Permanent Address"
                                            value={newStudent.permanentAddress}
                                            onChange={(e) => setNewStudent({ ...newStudent, permanentAddress: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            label="Major"
                                            value={newStudent.major}
                                            onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            label="Minor"
                                            value={newStudent.minor}
                                            onChange={(e) => setNewStudent({ ...newStudent, minor: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            label="Program"
                                            value={newStudent.program}
                                            onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowAddStudentDialog(false)}>Cancel</Button>
                                <Button onClick={handleAddStudent} variant="contained" color="primary">
                                    Add Student
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Delete Confirmation Dialog */}
                        <Dialog
                            open={showDeleteConfirmDialog}
                            onClose={() => setShowDeleteConfirmDialog(false)}
                        >
                            <DialogTitle>Delete Student</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Are you sure you want to delete {selectedStudent?.name}? This will remove all their enrolled courses and cannot be undone.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</Button>
                                <Button onClick={handleDeleteStudent} color="error" variant="contained">
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Student Details Dialog */}
                        <Dialog
                            open={showDetailsDialog}
                            onClose={() => setShowDetailsDialog(false)}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle>Student Details</DialogTitle>
                            <DialogContent>
                                {selectedStudent && (
                                    <>
                                        <Grid container spacing={2} sx={{ mt: 1 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Name</Typography>
                                                <Typography>{selectedStudent.name}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Student Number</Typography>
                                                <Typography>{selectedStudent.studentNumber}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">ID Number</Typography>
                                                <Typography>{selectedStudent.idNumber}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Class Year</Typography>
                                                <Typography>{selectedStudent.classYear}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Major</Typography>
                                                <Typography>{selectedStudent.major}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="subtitle2">Program</Typography>
                                                <Typography>{selectedStudent.program}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2">Current Address</Typography>
                                                <Typography>{selectedStudent.currentAddress}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2">Permanent Address</Typography>
                                                <Typography>{selectedStudent.permanentAddress}</Typography>
                                            </Grid>
                                        </Grid>

                                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                            Enrolled Courses
                                        </Typography>
                                        {selectedStudent.enrolledCourses?.length > 0 ? (
                                            <List>
                                                {selectedStudent.enrolledCourses.map((course) => (
                                                    <ListItem key={course._id}>
                                                        <ListItemText
                                                            primary={`${course.courseNumber}: ${course.name}`}
                                                            secondary={`${course.day} ${course.startTime}-${course.endTime}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            <Typography color="text.secondary">
                                                No courses enrolled
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}

                {/* Confirmation Dialog */}
                <Dialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ open: false, course: null, action: '' })}
                >
                    <DialogTitle>
                        {confirmDialog.action === 'add' ? 'Add Course' : 'Remove Course'}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to {confirmDialog.action} {confirmDialog.course?.courseNumber}: {confirmDialog.course?.name}?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setConfirmDialog({ open: false, course: null, action: '' })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (confirmDialog.action === 'add') {
                                    handleAddCourse(confirmDialog.course);
                                } else {
                                    handleRemoveCourse(confirmDialog.course);
                                }
                            }}
                            color="primary"
                            variant="contained"
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default CourseManagement; 