const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');
const router = express.Router();

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.redirect('/login');
    req.user = user;
    next();
  });
}

router.get('/students', authenticateToken, async (req, res) => {
  const students = await Student.find();
  res.render('students', { students });
});

router.post('/students/:id/edit', authenticateToken, async (req, res) => {
  const { name, age, course } = req.body;
  await Student.findByIdAndUpdate(req.params.id, { name, age, course });
  res.redirect('/students');
});

router.post('/students/:id/delete', authenticateToken, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect('/students');
});

router.get('/students/:id/edit', authenticateToken, async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).send('Student not found');
      res.render('editStudent', { student }); 
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
module.exports = router;
