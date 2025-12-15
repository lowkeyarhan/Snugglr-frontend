import User from "../../models/profile/User";

// appoint a new admin (superadmin only)
export const appointAdmin = async (req, res) => {
  const { userId } = req.body;

  // check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // check if user is already an admin
  if (user.role === "admin") {
    return res.status(400).json({ message: "Already admin" });
  }

  // check if user is a superadmin
  if (user.role === "superadmin") {
    return res.status(403).json({ message: "Cannot modify superadmin" });
  }

  // appoint the user as an admin
  user.role = "admin";
  await user.save();

  // return the success message
  res.json({ success: true, message: "Admin appointed" });
};

// remove an admin (superadmin only)
export const removeAdmin = async (req, res) => {
  const { userId } = req.params;

  // check if user is the same as the requester
  if (req.user._id.toString() === userId) {
    return res.status(400).json({ message: "You cannot remove yourself" });
  }

  // check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // check if user is an admin
  if (user.role !== "admin") {
    return res.status(400).json({ message: "User is not an admin" });
  }

  // remove the admin role
  user.role = "user";
  await user.save();

  // return the success message
  res.json({ success: true, message: "Admin removed" });
};
