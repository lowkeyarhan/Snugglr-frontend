import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AllowedDomain from "../models/AllowedDomain.js";
import generateToken from "../config/token.js";
import { generateUniqueUsername } from "../utils/usernameGenerator.js";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      password,
      birthday,
      gender,
      pronouns,
      interests,
      musicPreferences,
      favoriteShows,
      memeVibe,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Use default for name if not provided (will be filled in onboarding)
    const userName = name || "User";

    // Verify email domain is allowed
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const allowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (!allowedDomain) {
      return res.status(403).json({
        success: false,
        message:
          "Email domain is not authorized. Please use a valid college/institution email.",
        emailDomain,
      });
    }

    // Automatically set community based on email domain
    const userCommunity = allowedDomain.institutionName;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a unique catchy username for anonymity
    const username = await generateUniqueUsername(User);

    // Calculate age from birthday if birthday is provided
    let age = null;
    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
    }

    // Create new user
    const user = await User.create({
      name: userName,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      community: userCommunity,
      birthday,
      gender,
      pronouns,
      age,
      interests,
      musicPreferences,
      favoriteShows,
      memeVibe,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (exclude password)
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          image: user.image,
          settings: user.settings,
          privacy: user.privacy,
        },
        token,
      },
    });
  } catch (error) {
    console.error(`Error registering user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Validate input
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number and password",
      });
    }

    // Find user by email or phone number
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (exclude password)
    res.status(200).json({
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
          age: user.age,
          hint: user.hint,
          interests: user.interests,
          image: user.image,
          settings: user.settings,
          privacy: user.privacy,
        },
        token,
      },
    });
  } catch (error) {
    console.error(`Error logging in: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          age: user.age,
          birthday: user.birthday,
          pronouns: user.pronouns,
          hint: user.hint,
          interests: user.interests,
          musicPreferences: user.musicPreferences,
          favoriteShows: user.favoriteShows,
          memeVibe: user.memeVibe,
          image: user.image,
          community: user.community,
          favoriteSpot: user.favoriteSpot,
          loveLanguage: user.loveLanguage,
          quirkyFact: user.quirkyFact,
          fantasies: user.fantasies,
          idealDate: user.idealDate,
          hint: user.hint,
          settings: user.settings,
          privacy: user.privacy,
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching user profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find user with password field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(`Error changing password: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};
