import AllowedDomain from "../models/AllowedDomain.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

export const getAllDomains = async (req, res) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const domains = await AllowedDomain.find(filter).sort({
      institutionName: 1,
    });

    res.status(200).json({
      success: true,
      count: domains.length,
      data: {
        domains,
      },
    });
  } catch (error) {
    console.error(`Error fetching allowed domains: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching allowed domains",
      error: error.message,
    });
  }
};

export const getDomainById = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await AllowedDomain.findById(id);

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        domain,
      },
    });
  } catch (error) {
    console.error(`Error fetching domain: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching domain",
      error: error.message,
    });
  }
};

export const addDomain = async (req, res) => {
  try {
    const { domain, institutionName, isActive } = req.body;

    if (!domain || !institutionName) {
      return res.status(400).json({
        success: false,
        message: "Please provide domain and institution name",
      });
    }

    const existingDomain = await AllowedDomain.findOne({
      domain: domain.toLowerCase(),
    });
    if (existingDomain) {
      return res.status(400).json({
        success: false,
        message: "This domain is already registered",
      });
    }

    const newDomain = await AllowedDomain.create({
      domain: domain.toLowerCase(),
      institutionName,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Domain added successfully",
      data: {
        domain: newDomain,
      },
    });
  } catch (error) {
    console.error(`Error adding domain: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error adding domain",
      error: error.message,
    });
  }
};

export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, institutionName, isActive } = req.body;

    const existingDomain = await AllowedDomain.findById(id);
    if (!existingDomain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    if (domain && domain.toLowerCase() !== existingDomain.domain) {
      const duplicateDomain = await AllowedDomain.findOne({
        domain: domain.toLowerCase(),
        _id: { $ne: id },
      });
      if (duplicateDomain) {
        return res.status(400).json({
          success: false,
          message: "This domain is already registered",
        });
      }
    }

    const updateData = {};
    if (domain) updateData.domain = domain.toLowerCase();
    if (institutionName) updateData.institutionName = institutionName;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedDomain = await AllowedDomain.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Domain updated successfully",
      data: {
        domain: updatedDomain,
      },
    });
  } catch (error) {
    console.error(`Error updating domain: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating domain",
      error: error.message,
    });
  }
};

export const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await AllowedDomain.findByIdAndDelete(id);

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Domain deleted successfully",
      data: {
        domain,
      },
    });
  } catch (error) {
    console.error(`Error deleting domain: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting domain",
      error: error.message,
    });
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as admin",
      });
    }

    const validRole = role === "superadmin" ? "superadmin" : "regular";

    const newAdmin = await Admin.create({
      email: email.toLowerCase(),
      role: validRole,
    });

    res.status(201).json({
      success: true,
      message: "Admin added successfully",
      data: {
        admin: newAdmin,
      },
    });
  } catch (error) {
    console.error(`Error adding admin: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error adding admin",
      error: error.message,
    });
  }
};

export const checkAdminStatus = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const admin = await Admin.findOne({
      email: userEmail.toLowerCase(),
    });

    if (!admin) {
      return res.status(200).json({
        success: true,
        isAdmin: false,
        data: {
          isAdmin: false,
          role: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      isAdmin: true,
      data: {
        isAdmin: true,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(`Error checking admin status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error checking admin status",
      error: error.message,
    });
  }
};

//get all users (for admin)
export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -guesses");

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error(`Error fetching all users: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching all users",
      error: error.message,
    });
  }
};

//get users by community (for admin)
export const getUsersByCommunity = async (req, res) => {
  try {
    const { community } = req.params;

    const users = await User.find({ community }).select("-password -guesses");

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error(`Error fetching users by community: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching users by community",
      error: error.message,
    });
  }
};

//delete user (for admin)
export const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting user: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};
