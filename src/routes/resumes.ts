import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../../users.json");

// Multer setup (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helpers
const readUsers = (): any[] => {
  const data = fs.readFileSync(USERS_FILE, "utf-8");
  return JSON.parse(data);
};

const writeUsers = (users: any[]) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// ✅ GET Resumes by User ID
router.get("/resume/:userId", authenticateToken, (req: any, res: any) => {
  const { userId } = req.params;
  const users = readUsers();

  const user = users.find((u) => u.id == userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const resumeList = (user.resumes || []).map((resume: any) => ({
    id: resume.id,
    docName: resume.docName,
  }));

  res.status(200).json({ resumes: resumeList });
});

// 🧾 Upload resume with validation
router.post(
  "/resume/:userId",
  upload.single("file"),
  [
    body("docName")
      .notEmpty()
      .withMessage("docName is required")
      .isString()
      .withMessage("docName must be a string"),
  ],
  authenticateToken,
  (req: any, res: any) => {
    const errors = validationResult(req);
    const file = req.file;
    const { docName } = req.body;
    const { userId } = req.params;

    // Handle validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Additional manual file check
    if (!file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const users = readUsers();
    const user = users.find((u) => u.id == userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resume = {
      id: uuidv4(),
      docName,
      file: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer.toString("base64"),
      },
    };

    user.resumes.push(resume);
    writeUsers(users);

    res.status(201).json({ message: "Resume uploaded successfully", resume });
  }
);

router.get(
  "/resume/:userId/:resumeId/download",
  (req: any, res: any) => {
    const { userId, resumeId } = req.params;
    const users = readUsers();

    const user = users.find((u) => u.id == userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resume = user.resumes.find((r: any) => r.id === resumeId);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const fileBuffer = Buffer.from(resume.file.buffer, "base64");
    res.set({
      "Content-Disposition": `attachment; filename="${resume.file.originalname}"`,
      "Content-Type": resume.file.mimetype,
    });

    res.send(fileBuffer);
  }
);

export default router;
