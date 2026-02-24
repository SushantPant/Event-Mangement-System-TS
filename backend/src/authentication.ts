import * as express from "express";
import * as jwt from "jsonwebtoken";

const expressAuthentication = (request: express.Request): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authHeader = request.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return reject(new Error("No token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "SUPERSECRETKEY123@!",
      (err, decoded) => {
        if (err) {
          return reject(new Error("Invalid token"));
        }
        resolve(decoded);
      },
    );
  });
};
