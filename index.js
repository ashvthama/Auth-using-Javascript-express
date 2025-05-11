import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import db from "./utils/db.js"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Fixed: cookieParser needs to be called as a function

// CORS configuration
app.use(cors({
    origin: process.env.BASE_URL, // allows requests only from this address
    methods: ['GET', 'PUT', 'DELETE', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/api/v1/user", userRoutes);

// Connect to database first, then start server
db().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}).catch(err => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
