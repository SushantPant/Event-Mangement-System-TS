import * as express from "express";
import * as jwt from "jsonwebtoken";

export const expressAuthentication = (
    request: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const authHeader = request.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return reject(new Error("No token provided"));
        }

        jwt.verify(
            token,
            process.env.JWT_SECRET || "SUPERSECRETKEY123@!",
            (err, decoded: any) => {
                if (err) {
                    return reject(new Error("Invalid token"));
                }
                if (securityName === "bearerAuth") {
                    if (scopes && scopes.length > 0) {
                        if (!scopes.includes(decoded.role)) {
                            return reject(new Error("Insufficient permissions"));
                        }
                    }
                }
                resolve(decoded);
            }
        );
    });
};
