import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../../users.json");

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to read users
const readUsers = (): any[] => {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
};

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "5h",
    });

    res.json({ token });
  }
);

export default router;
