import UserModel from "../models/profile/User";
import AllowedCollegeModel from "../models/admin/AllowedCollege";
import bcrypt from "bcrypt";
import { generateToken } from "../configs/jwt";
import { generateUniqueAnonymousUsername } from "../utils/usernameGenerator";

// register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, gender, birthday, pronouns } = req.body;

    // check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // check if email already exists
    const existingEmail = await UserModel.exists({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // verify email domain is allowed
    const domain = normalizedEmail.split("@")[1];
    const allowedCollege = await AllowedCollegeModel.findOne({
      domain: domain,
    });
    if (!allowedCollege || !allowedCollege.isActive) {
      return res.status(400).json({
        success: false,
        message: "Email domain not authorized",
      });
    }

    // If the college is allowed, extract the institution name and add it as collegeName
    const collegeName = allowedCollege.institutionName;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate a unique anonymous username
    const username = await generateUniqueAnonymousUsername(UserModel);

    // create new user
    const newUser = await UserModel.create({
      name,
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      gender,
      birthday,
      pronouns,
      collegeName: allowedCollege.institutionName,
      institution: allowedCollege._id,
    });

    // generate token
    const token = generateToken({
      userId: newUser._id,
      role: "user",
      institution: allowedCollege._id,
    });

    // return user and token
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: normalizedEmail,
        collegeName: allowedCollege.institutionName,
        institution: allowedCollege._id,
        role: "user",
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number and password",
      });
    }

    const orConditions = [];

    if (email && email.trim()) {
      orConditions.push({ email: email.toLowerCase().trim() });
    }

    if (phoneNumber && phoneNumber.trim()) {
      orConditions.push({ phoneNumber: phoneNumber.trim() });
    }

    if (orConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    const user = await UserModel.findOne({
      $or: orConditions,
      isActive: true,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      institution: user.institution,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          collegeName: user.collegeName,
          institution: user.institution,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};
