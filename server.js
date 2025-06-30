const express = require('express');
     const mongoose = require('mongoose');
     const cors = require('cors');
     const bcrypt = require('bcrypt');
     const jwt = require('jsonwebtoken');
     require('dotenv').config();
     const app = express();
     
     // Allow CORS for Live Server and GitHub Pages
     app.use(cors({
       origin: ['http://127.0.0.1:5500', 'https://eleiria.github.io'],
       methods: ['GET', 'POST', 'PUT', 'DELETE'],
       credentials: true
     }));
     app.use(express.json());
     
     mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
       .then(() => console.log('Connected to MongoDB'))
       .catch(err => console.log('MongoDB connection error:', err));
     
     const horseSchema = new mongoose.Schema({
       _id: String,
       prefix: { type: String, default: '' },
       name: String,
       sex: { type: String, enum: ['Stallion', 'Mare', 'Gelding', ''], default: '' },
       breed: { type: String, default: '' },
       color: { type: String, default: '' },
       notes: { type: String, default: '' },
       sire: { type: String, default: '' },
       dam: { type: String, default: '' },
       storyline: { type: String, default: '' },
       lifetimeEarnings: { type: String, default: '' },
       showPlacings: { type: String, default: '' },
       genotype: { type: String, default: '' },
       image: { type: String, default: '' },
       status: { type: String, enum: ['Active', 'Retired', 'Sold', ''], default: 'Active' }
     });
     const Horse = mongoose.model('Horse', horseSchema);
     
     const userSchema = new mongoose.Schema({
       username: String,
       password: String
     });
     const User = mongoose.model('User', userSchema);
     
     // Create admin user (run once)
     async function createAdminUser() {
       const existingUser = await User.findOne({ username: 'admin' });
       if (!existingUser) {
         const hashedPassword = await bcrypt.hash('MapleGirl123', 10); // Replace with your secret password
         await new User({ username: 'admin', password: hashedPassword }).save();
         console.log('Admin user created');
       }
     }
     createAdminUser();
     
     app.post('/api/login', async (req, res) => {
       const { username, password } = req.body;
       const user = await User.findOne({ username });
       if (user && await bcrypt.compare(password, user.password)) {
         const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
         res.json({ token });
       } else {
         res.status(401).json({ error: 'Invalid credentials' });
       }
     });
     
     const authMiddleware = (req, res, next) => {
       const token = req.headers.authorization?.split(' ')[1];
       if (!token) return res.status(401).json({ error: 'No token provided' });
       try {
         jwt.verify(token, process.env.JWT_SECRET);
         next();
       } catch (err) {
         res.status(401).json({ error: 'Invalid token' });
       }
     };
     
     app.get('/api/horses', async (req, res) => {
       const horses = await Horse.find();
       res.json(horses);
     });
     
     app.get('/api/horses/:id', async (req, res) => {
       const horse = await Horse.findById(req.params.id);
       res.json(horse || {});
     });
     
     app.get('/api/horses/filter', async (req, res) => {
       const { sex, breed, color, status } = req.query;
       const query = {};
       if (sex) query.sex = sex;
       if (breed) query.breed = breed;
       if (color) query.color = color;
       if (status) query.status = status;
       const horses = await Horse.find(query);
       res.json(horses);
     });
     
     app.get('/api/horses/relatives/:name', async (req, res) => {
       const horses = await Horse.find({ $or: [{ sire: req.params.name }, { dam: req.params.name }] });
       res.json(horses);
     });
     
     app.post('/api/horses', authMiddleware, async (req, res) => {
       const horse = new Horse(req.body);
       await horse.save();
       res.json(horse);
     });
     
     app.put('/api/horses/:id', authMiddleware, async (req, res) => {
       const horse = await Horse.findByIdAndUpdate(req.params.id, req.body, { new: true });
       res.json(horse);
     });
     
     app.delete('/api/horses/:id', authMiddleware, async (req, res) => {
       await Horse.findByIdAndDelete(req.params.id);
       res.json({ message: 'Horse deleted' });
     });
     
     app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
