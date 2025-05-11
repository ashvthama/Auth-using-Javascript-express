import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();

const isLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies.token;
      console.log(token);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing"
      });
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    req.user = decodedToken;
    next();
  }
  catch (err) {
    console.error("Auth error:", err.name, err.message);
    return res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
    });
  }
}

export { isLoggedIn }
