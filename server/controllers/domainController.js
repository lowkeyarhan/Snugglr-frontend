import AllowedDomain from "../models/AllowedDomain.js";

export const verifyEmailDomain = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address",
      });
    }

    const emailDomain = email.split("@")[1]?.toLowerCase();

    if (!emailDomain) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        isAllowed: false,
      });
    }

    const allowedDomain = await AllowedDomain.findOne({
      domain: emailDomain,
      isActive: true,
    });

    if (!allowedDomain) {
      return res.status(200).json({
        success: true,
        isAllowed: false,
        message: "Email domain is not in the allowed list",
      });
    }

    res.status(200).json({
      success: true,
      isAllowed: true,
      message: "Email domain is allowed",
      data: {
        domain: allowedDomain.domain,
        institutionName: allowedDomain.institutionName,
      },
    });
  } catch (error) {
    console.error(`Error verifying email domain: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error verifying email domain",
      error: error.message,
    });
  }
};
