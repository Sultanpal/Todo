const mongoose = require("mongoose");
const zod = require("zod");
const bcrypt = require('bcrypt');
require("dotenv").config();

// MongoDB connection URI
const mongoURI = "mongodb+srv://sultanpal81:PlSoFuD05eC7jRwD@todo2.ndzyu.mongodb.net/Todo2";

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Zod schemas for validation
const userSchemaZod = zod.object({
    userfirstname: zod.string().min(1, "First name must be at least 1 character"),
    userlastname: zod.string().min(1, "Last name must be at least 1 character"),
    gmailId: zod.string().email({ message: "Invalid email format" }),
    password: zod.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const TodoSchemaZod = zod.object({
    title: zod.string().min(1, "Title cannot be blank"),
    description: zod.string().min(1, "Description cannot be blank")
});

// Mongoose schemas
const userSchemaMongoose = new mongoose.Schema({
    userfirstname: { type: String, required: true },
    userlastname: { type: String, required: true },
    gmailId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// const TodoSchemaMongoose = new mongoose.Schema({
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// });
const TodoSchemaMongoose = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User
  }, { timestamps: true });
  
  

// Models
const User = mongoose.model("User", userSchemaMongoose);
const Todo = mongoose.model("Todo", TodoSchemaMongoose);


// Functions
async function createUser(data) {
    try {
        const validatedData = userSchemaZod.parse(data);
        const existingUser = await User.findOne({ gmailId: validatedData.gmailId });
        if (existingUser) {
            return { success: false, message: "Account with this email already exists." };
        }
        
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const newUser = new User({ ...validatedData, password: hashedPassword });
        const savedUser = await newUser.save();
        return { success: true, user: savedUser };

    } catch (error) {
        if (error instanceof zod.ZodError) {
            return { success: false, message: "Validation errors", errors: error.errors };
        }
        return { success: false, message: "Database error" };
    }
}

async function loginUser(data) {
    const { gmailId, password } = data;

    try {
        console.log(gmailId);
        const user = await User.findOne({ gmailId });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { success: false, message: "Invalid email or password" };
        }
        return { success: true, user };
    } catch (error) {
        return { success: false, message: error };
    }
}

async function CreateTodo(data, userId) {
    try {
      // Validate request data with Zod schema
      const validatedTodoData = TodoSchemaZod.parse(data);
  
      // Create a new Todo and associate it with the userId
      const newTodo = new Todo({ ...validatedTodoData, userId });
      const savedTodo = await newTodo.save();
  
      return { success: true, todo: savedTodo }; // Return created Todo
    } catch (error) {
      console.error("Error during Todo creation:", error);
      return { success: false, message: error.message || "Database error" };
    }
  }
  



module.exports = { createUser, loginUser,CreateTodo ,User,Todo};
