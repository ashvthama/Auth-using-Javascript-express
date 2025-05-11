import express from "express"
import { registerUser, verifyUser, loginUser, getMe, logOut,resetPassword } from "../controller/user.controller.js";
import {isLoggedIn} from "../middleware/auth.middleware.js"
const router = express.Router();

router.post("/register", registerUser)
router.get('/verify/:token', verifyUser)
router.post('/login', loginUser);
router.get('/me', isLoggedIn, getMe);
router.get('/logout', isLoggedIn, logOut);
router.post('/resetPassword', resetPassword);
export default router;
    