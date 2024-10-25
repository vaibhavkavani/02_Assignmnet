
  const express = require('express');
  const Student = require('../models/student');
  const router = express.Router();

  function isAuthenticated(req, res, next) {
    if (req.session && req.session.student) { 
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  }
  router.get('/students', isAuthenticated, async (req, res) => {
    try {
      const students = await Student.find();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  });
  
router.get('/students/:id', isAuthenticated, async (req, res) => {
  try {
      const student = await Student.findById(req.params.id);
      if (!student) {
          return res.status(404).json({ error: 'Student not found' });
      }
      res.json(student);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve student' });
  }
});

router.post('/students/:id/edit', isAuthenticated, async (req, res) => {
  try {
      const { name, email, age, course } = req.body;
      const student = await Student.findByIdAndUpdate(req.params.id, { name, email, age, course }, { new: true });

      if (!student) {
          return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ message: 'Student updated successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to update student' });
  }
});

  router.delete('/students/:id', isAuthenticated, async (req, res) => { 
    try {
      const student = await Student.findByIdAndDelete(req.params.id);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete student' });
    }
  });

  router.get('/fetch-students', async (req, res) => {
    try {

      const students = await Student.find();
      console.log('Fetched students:', students);
      res.json(students);
    } catch (err) {
      console.error('Error fetching students:', err);
      res.status(500).send('Server error');
    }
  });
  
  module.exports = router;
  