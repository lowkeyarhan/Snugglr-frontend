import jwt from "jsonwebtoken";

const JWT_EXPIRY = process.env.JWT_EXPIRY || "21d";
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

export const generateToken = ({ userId, role, institution }) => {
  return jwt.sign({ userId, role, institution }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  } as jwt.SignOptions);
};
