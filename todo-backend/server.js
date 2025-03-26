const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Todo Model
const todoSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  highPriority: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Todo = mongoose.model('Todo', todoSchema);


// Routes
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  const newTodo = new Todo({
    text: req.body.text
  });

  try {
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (req.body.completed !== undefined) todo.completed = req.body.completed;
    if (req.body.highPriority !== undefined) todo.highPriority = req.body.highPriority;
    if (req.body.text) todo.text = req.body.text;
    
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});