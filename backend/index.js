const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for avatar uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Registration Route
app.post('/api/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, phone, avatar_url, cover_url',
            [email, hashedPassword, first_name, last_name || '']
        );
        const user = result.rows[0];
        res.status(201).json({
            user: {
                ...user,
                full_name: `${user.first_name} ${user.last_name}`.trim(),
                cover_url: user.cover_url || null
            },
            message: 'User registered successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error or user already exists' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match for ${email}: ${passwordMatch}`);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone || '',
                avatar_url: user.avatar_url || null,
                cover_url: user.cover_url || null,
                full_name: `${user.first_name} ${user.last_name}`.trim()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Route: Update Profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    const { first_name, last_name, phone, email } = req.body;
    const userId = req.user.id;

    try {
        // Check if email is already taken if it's being changed
        if (email && email !== req.user.email) {
            const checkEmail = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (checkEmail.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        const result = await db.query(
            'UPDATE users SET first_name = $1, last_name = $2, phone = $3, email = $4, updated_at = NOW() WHERE id = $5 RETURNING id, email, first_name, last_name, phone, avatar_url, cover_url',
            [first_name, last_name || '', phone || '', email || req.user.email, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                avatar_url: user.avatar_url,
                cover_url: user.cover_url,
                full_name: `${user.first_name} ${user.last_name}`.trim()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Route: Upload Avatar
app.post('/api/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        const avatarUrl = `/uploads/${req.file.filename}`;

        // Update user's avatar_url in the database
        await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);

        res.json({
            message: 'Avatar uploaded successfully',
            avatar_url: avatarUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Protected Route: Upload Cover
app.post('/api/upload-cover', authenticateToken, upload.single('cover'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        const coverUrl = `/uploads/${req.file.filename}`;

        // Update user's cover_url in the database
        await db.query('UPDATE users SET cover_url = $1 WHERE id = $2', [coverUrl, userId]);

        res.json({
            message: 'Cover updated successfully',
            cover_url: coverUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload cover' });
    }
});

// Route: Verify Token validity (used on app startup)
app.get('/api/verify-token', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, phone, avatar_url, cover_url FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        const user = result.rows[0];
        res.json({
            valid: true,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone || '',
                avatar_url: user.avatar_url || null,
                cover_url: user.cover_url || null,
                full_name: `${user.first_name} ${user.last_name}`.trim()
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Route: Get User Summary
app.get('/api/summary', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get total balance (mocking a base balance of 10000)
        const transactionsResult = await db.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
        const transactions = transactionsResult.rows;

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            const amount = parseFloat(t.amount);
            if (t.is_negative) {
                totalExpense += amount;
            } else {
                totalIncome += amount;
            }
        });

        // Calculate daily breakdown for the last 7 days
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            let dayIncome = 0;
            let dayExpense = 0;

            transactions.forEach(t => {
                const tDate = new Date(t.transaction_date).toISOString().split('T')[0];
                if (tDate === dateStr) {
                    const amt = parseFloat(t.amount);
                    if (t.is_negative) dayExpense += amt;
                    else dayIncome += amt;
                }
            });

            dailyData.push({ day: dayName, income: dayIncome, expense: dayExpense });
        }

        const balance = totalIncome - totalExpense;

        // Get savings progress
        const targetsResult = await db.query('SELECT * FROM targets WHERE user_id = $1', [userId]);
        const targets = targetsResult.rows;

        let totalCurrent = 0;
        let totalTarget = 0;

        targets.forEach(t => {
            totalCurrent += parseFloat(t.current);
            totalTarget += parseFloat(t.target);
        });

        const progress = totalTarget > 0 ? totalCurrent / totalTarget : 0.75;

        res.json({
            balance: balance.toFixed(2),
            expense: totalExpense.toFixed(2),
            income: totalIncome.toFixed(2),
            progress: progress,
            recentTransactions: transactions.slice(-10).reverse(),
            dailyData: dailyData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// Protected Route: Transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { title, category, amount, is_negative, icon, description, companions, currency, transaction_date } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO transactions (user_id, title, category, amount, is_negative, icon, description, companions, currency, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [req.user.id, title, category, amount, is_negative, icon, description, companions, currency || 'USD', transaction_date || new Date()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Protected Route: Targets
app.get('/api/targets', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM targets WHERE user_id = $1 ORDER BY created_at ASC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch targets' });
    }
});

app.post('/api/targets', authenticateToken, async (req, res) => {
    const { title, current, target, icon, color } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO targets (user_id, title, current, target, icon, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, title, current, target, icon, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create target' });
    }
});

// Protected Route: Get Spending by Category
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT category, SUM(amount) as total FROM transactions WHERE user_id = $1 AND is_negative = true GROUP BY category',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
