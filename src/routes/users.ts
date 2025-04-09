import express from "express";
import fs from "fs";
import path from "path";
import { body, validationResult } from "express-validator";
import { RegEx } from "../utils/regEx";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

const USERS_FILE = path.join(__dirname, "../../users.json");

// Helper to read users
const readUsers = (): any[] => {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
};

// Helper to write users
const writeUsers = (users: any[]) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// GET /users
router.get("/users", authenticateToken, (req, res) => {
  const users = readUsers();
  res.json(users);
});

// POST /users
router.post(
  "/signup",
  [
    body("userName")
      .notEmpty()
      .withMessage("Username is required")
      .isString()
      .withMessage("Username must be a string"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .matches(RegEx?.Email)
      .withMessage("Invalid email format"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .matches(RegEx?.Password)
      .withMessage(
        "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a digit, and a special character"
      ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const users = readUsers();
    const { userName, email, password } = req.body;

    // ✅ Check if email is already used
    const existingUser = users.find((user: any) => user?.email === email);
    if (existingUser) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Email already in use", path: "email" }] });
    }

    const newUser = {
      id: Date.now(),
      userName,
      email,
      password,
      resumes: [],
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json(newUser);
  }
);

export default router;
