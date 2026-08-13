import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "real-estate-api-skeleton", phase: 1 });
});

app.listen(PORT, () => {
  console.log(`API Skeleton server running on port ${PORT}`);
});
