import User from "../model/user.model.js"
import crypto from "crypto"
import dotenv from "dotenv";
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
dotenv.config();


const registerUser = async (req, res) => {
    try {
        //fetch data
        const { name, email, password, role} = req.body;

        //validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "need all the fields"
            });
        }
        //check if user exists 
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({
                success: false,
                message:"user already exists"
            });
        }

        //create a new user
        const newUser = await User.create({
            name,
            email,
            password,
            role,
        });
        console.log(newUser);

        //genreating token for verfication
        const token = crypto.randomBytes(32).toString("hex");
        newUser.verificationToken = token;
        await newUser.save();

        console.log(newUser);

        //sending email->token
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: parseInt(process.env.MAILTRAP_PORT), // Convert port to number
            secure: false, // use true for port 465
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOption = {
            from: process.env.MAILTRAP_SENDEREMAIL,
            to: newUser.email,
            subject: "Verify your email",
            text: `Please click on the following link to verify your email:\n${process.env.BASE_URL}/api/v1/user/verify/${token}`,
        };

        try {
            await transporter.sendMail(mailOption);
            console.log("Email sent successfully");
        }
        catch (err) {
            console.error("Error in sending the email:", err);
        }

        res.status(200).json({
            success: true,
            message:"created user successfully"
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            success: false,
            message:"issue: user.controller"
        });
    }
};

const verifyUser = async (req, res) => {
    try {
        //fetch the token from the url
        //validate the token
        //find the user based on the token
        //if not
        //set the isverified to true
        //remove verification token
        //save
        //return response


        const { token } = req.params
        if (!token) {
            return res.status(400).json({
                message:"could not find the token"
            })
        }
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                message:"invalid token"
            })
        }
        if (user) {
            user.isVerified = true,
            user.verificationToken=undefined,
            await user.save();
        }
        res.status(201).json({
            message:"successfully verified the user"
        })
    } catch (error) {
        return res.status(500).json({
            message:"not able to verify"
        })
    }
}
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                message:"all the fields are necessary"
            })
        }
        const loginUser = await User.findOne({ email });
        console.log(loginUser);
        if (!loginUser) {
            return res.status(400).json({
                message:"email not registred"
            })
        }
        // console.log(loginUser.password)
        // console.log(password)

        //password validation
        const match = await bcrypt.compare(password, loginUser.password);
        console.log(match);
        if (!match) {
            return res.status(400).json({
                message:"password does not matches"
            })
        }

        //creating a jwt token
        let payload = {
            id: loginUser._id,
            role:loginUser.role
        }
        let options = {
            expiresIn:"24h"
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, options)


        //saving token into cookie
        let cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 24*60*60*1000
        }
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            message: "login success",
            token
        })
    } catch (error) {
        console.error("error in login controller")
    }
}

const getMe = async (req, res) => {
    try {
        const id = req.user.id;
        const loggedInUser = await User.findById(id).select("-password  "); //dnt give password
        console.log(loggedInUser);
        if (!loggedInUser) {
            return res.status(401).json({
                success: "false",
                message:"could not reach the profile"
            })
        }

        res.status(201).json({
            success: true,
            message:'profile reached'
        })
    } catch (error) {
        return res.status(500).json({
            message: "unable to get into getMe"
            
        })
    }
}

const logOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(201).json({
            message:"successfully loggedout"
        })
    } catch (error) {
        console.error("error in the logout handler");
        return res.status(400).json({
            message:"error in logout handler"
        })
        
    }
}
const forgotPassword = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            })
            
        } catch (error) {
            console.error('error in resetPassword handler')
        }
        return res.status(201).json({
            message:"password reset success"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"cannot reset the password"
        })
    }
}
export {registerUser, verifyUser, loginUser, getMe, logOut, forgotPassword, resetPassword};        