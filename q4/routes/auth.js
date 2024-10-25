
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const router = express.Router();


router.post('/register', async (req, res) => {
  const { name, email, password, age, course } = req.body;
  try {
    const student = new Student({ name, email, password, age, course });
    await student.save();
    res.redirect('/login');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.render('login', { error: 'Invalid email or password' }); 
    }
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password' }); 
    }
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token).redirect('/students');
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: err.message });
  }
});
router.get('/register', (req, res) => {
  res.render('register'); 
});

router.get('/login', (req, res) => {
res.render('login', { error: null }); 
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
