import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 1. Declare a brand new, unconflicted custom property on the Request object
declare global {
    namespace Express {
        interface Request {
            tokenData?: {
                userId: number;
                email: string;
            };
        }
    }
}

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    let token;
    
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; email: string };
            
            // 2. Attach the payload data to our custom unconflicted key
            req.tokenData = {
                userId: decoded.userId,
                email: decoded.email
            };

            return next();
        } catch (error) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};
