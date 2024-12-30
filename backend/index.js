const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { createUser, loginUser ,CreateTodo,User,Todo} = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

async function verifyToken({ tkn }, req, res, next) {
    const token = req.localStorage.token;
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, "HELLOMYBROTHER");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};

// Routes
app.post("/signup", async (req, res) => {
    try {
        const result = await createUser(req.body);
        if (!result.success) return res.status(400).json(result);
        res.status(201).json({ message: "User created successfully", user: result.user });
    } catch (error) {
        console.error("Errir in SignUp : ", error.messge);
        res.status(500).json({
            message: "internal server error"
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const result = await loginUser(req.body);
        if (!result.success) return res.status(400).json(result);
        const token = jwt.sign({ id: result.user._id }, "HELLOMYBROTHER", { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
});

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    try {
      const decoded = jwt.verify(token, "HELLOMYBROTHER");
      const user = await User.findById(decoded.id); 
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.user = user; 
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  
  app.post("/todo", authMiddleware, async (req, res) => {
    try {
      const result = await CreateTodo(req.body, req.user._id); 
      if (!result.success) return res.status(400).json(result);
  
      console.log("Todo created successfully.");
      res.status(200).json({ message: "Todo created successfully", todo: result.user });
    } catch (error) {
      console.error("Error in /todo route:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.get("/todos", authMiddleware, async (req, res) => {
    try {
      const userId = req.user._id;
      const todos = await Todo.find({ userId });
      res.status(200).json({ success: true, todos });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch todos",
        error,
      });
    }
  });
  app.delete("/todo/:id", authMiddleware, async (req, res) => {
    const todoId = req.params.id;
  
    try {
      const todo = await Todo.findOneAndDelete({ _id: todoId, userId: req.user._id });
  
      if (!todo) {
        return res.status(404).json({ message: "Todo not found or unauthorized" });
      }
  
      res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error("Error deleting todo:", error);
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });
  
app.listen(8080, () => {
    console.log("Server is running on http://localhost:8081");
});
