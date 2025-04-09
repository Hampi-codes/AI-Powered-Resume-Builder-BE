import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/users";
import authRouter from "./routes/auth";
import resumeRouter from "./routes/resumes";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", authRouter);
app.use("/api", resumeRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
