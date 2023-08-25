const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const FileWorker = require('./workers/FileWorker');



const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const validate = [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

app.post('/register', validate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;

        const existingUser = await FileWorker.userLogin(username);
        if (existingUser.length > 0) {
            res.status(409).json({ message: 'Username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await FileWorker.userRegister(username, hashedPassword);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// User Login API

app.post('/login',validate,  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { username, password } = req.body;
        const results = await FileWorker.userLogin(username);
        if (results.length === 0) {
            res.status(401).json({ message: 'User not found' });
            return; // Return early to avoid further execution
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Verify JWT Middleware
function verifyToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    jwt.verify(token, 'your_secret_key', (error, decoded) => {
        if (error) {
            console.error(error);
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.userId = decoded.userId;
        next();
    });
}

// Protected Route
app.get('/movielist', verifyToken, async (req, res) => {
    try {
        const pageNumber = parseInt(req.query.page);
        const defaultPageNumber = 1;
        const movieList = await FileWorker.getMovieList(pageNumber || defaultPageNumber);
        if (movieList.length === 0) {
            res.status(404).json({ message: 'No movies found' });
        } else {
            res.status(200).json(movieList);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching movie list' });
    }
});

app.get('/movieRatings', async (req, res) => {
    try {
        const pageNumber = parseInt(req.query.page);
        const defaultPageNumber = 1;
        const movieList = await FileWorker.getMovieRatings(pageNumber || defaultPageNumber);
        if (movieList.length === 0) {
            res.status(404).json({ message: 'No Ratings found' });
        } else {
            res.status(200).json(movieList);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching movie Ratings' });
    }
});


const validateUpdateRating = [
    body('movieId').isInt().withMessage('Movie ID must be an integer'),
    body('rating').isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
];
app.post('/update-rating', verifyToken,validateUpdateRating, async (req, res) => {
    try {
        const { movieId, rating } = req.body;
        const results = await FileWorker.getMovieRating(movieId);
        if (results.length === 0) {
            return res.status(404).json({ message: 'No movie found with this id' });
        }
        const currentRating = results[0].vote_average;
        const currentVoteCount = results[0].vote_count;
        const newVoteAverage = ((currentRating * currentVoteCount) + rating) / (currentVoteCount + 1);
        const newVoteCount = currentVoteCount + 1;

        await FileWorker.updateMovieRating(movieId, newVoteAverage.toFixed(3), newVoteCount);
        res.status(200).json({ message: 'Rating updated successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating  rating' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
