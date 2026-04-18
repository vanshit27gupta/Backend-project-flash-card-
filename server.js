const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '.'))); // Serve frontend files

// Setup Multer for image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/';
        fs.ensureDirSync(uploadPath); // Create folder if not exists
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Database simulation (JSON file)
const DB_FILE = './students.json';

// Function to read students from file
const getStudentsFromFile = () => {
    if (fs.existsSync(DB_FILE)) {
        return fs.readJsonSync(DB_FILE);
    }
    return [
        {
            name: "Rahul Kumar",
            id: "STU2024001",
            course: "B.Tech (CSE)",
            photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
        }
    ];
};

// Function to save students to file
const saveStudentsToFile = (students) => {
    fs.writeJsonSync(DB_FILE, students, { spaces: 2 });
};

// API Endpoints
// 1. Get all students
app.get('/api/students', (req, res) => {
    const students = getStudentsFromFile();
    res.json(students);
});

// 2. Add student with photo upload
app.post('/api/students', upload.single('photo'), (req, res) => {
    try {
        const { name, id, course } = req.body;
        const photoPath = req.file ? `/uploads/${req.file.filename}` : '';

        const students = getStudentsFromFile();
        const newStudent = { name, id, course, photo: photoPath };
        
        students.push(newStudent);
        saveStudentsToFile(students);

        res.status(201).json({ message: "Student registered successfully!", student: newStudent });
    } catch (error) {
        res.status(500).json({ message: "Upload failed!", error: error.message });
    }
});

// 3. Delete student
app.delete('/api/students/:index', (req, res) => {
    const index = parseInt(req.params.index);
    let students = getStudentsFromFile();

    if (index >= 0 && index < students.length) {
        // Delete photo file if it's local
        const photoPath = students[index].photo;
        if (photoPath.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, photoPath);
            if (fs.existsSync(fullPath)) {
                fs.removeSync(fullPath);
            }
        }

        students.splice(index, 1);
        saveStudentsToFile(students);
        res.json({ message: "Student deleted successfully!" });
    } else {
        res.status(404).json({ message: "Student not found!" });
    }
});

// Serve frontend on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
