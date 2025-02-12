import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      username:string;
      role: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const decodedPayload = decoded as JwtPayload;
    req.userId = decodedPayload.userId;
    req.username = decodedPayload.username;
    req.role = decodedPayload.role; // Attach role to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized ff" });
    return;
  }
};

export default verifyToken;
