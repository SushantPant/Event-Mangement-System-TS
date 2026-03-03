import bcrypt from "bcryptjs";
import db from "../db/db";
import jwt from "jsonwebtoken";
import { RegisterRequest, LoginRequest } from "../interfaces/auth.interface";
import { IResponse } from "../interfaces/response.interface";

export class AuthService {
  public generateToken(user: {
    id: number;
    username: string;
    email: string;
    role: string;
  }) {
    const secret = process.env.JWT_SECRET || "SuperSecretKey123!@";
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "15m" } as jwt.SignOptions,
    );
    const refreshToken = `${user.id}:${Math.random().toString(36).substring(2)}`;
    return { token, refreshToken };
  }

  public async register(
    requestBody: RegisterRequest,
  ): Promise<IResponse & { refreshToken?: string }> {
    const { username, email, password } = requestBody;
    if (!username || !email || !password) {
      return {
        success: false,
        message: "Validation Error: Missing required fields",
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        message: "Validation Error: Invalid email format",
      };
    }
    if (password.length < 6) {
      return {
        success: false,
        message:
          "Validation Error: Password must be at least 6 characters long",
      };
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [id, role] = await db("users").insert({
      username,
      email,
      password_hash,
    });
    const { token, refreshToken } = this.generateToken({
      id,
      username,
      email,
      role: "user",
    });
    const refreshTokenHashed = await bcrypt.hash(refreshToken, 10);
    await db("refresh_tokens").insert({
      user_id: id,
      token: refreshTokenHashed,
      expires_at: new Date(Date.now() + (parseInt(process.env.JWT_EXPIRES_IN ?? "7") * 24 * 60 * 60 * 1000)),
    });

    return {
      success: true,
      message: "User registered successfully",
      data: { token, user: { id, username, email, role: "user" } },
      refreshToken,
    };
  }

  public async login(
    requestBody: LoginRequest,
  ): Promise<IResponse & { refreshToken?: string }> {
    const { email, password } = requestBody;
    const user = await db("users").where({ email }).first();
    if (!user) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
    const { token, refreshToken } = this.generateToken(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await db("refresh_tokens").insert({
      user_id: user.id,
      token: hashedRefreshToken,
      expires_at: new Date(Date.now() + (parseInt(process.env.JWT_EXPIRES_IN ?? "7") * 24 * 60 * 60 * 1000)),
    });

    db("refresh_tokens")
      .where("expires_at", "<", db.fn.now())
      .delete();

    return {
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      refreshToken,
    };
  }

  public async refresh(
    refreshToken: string | undefined,
  ): Promise<IResponse & { refreshToken?: string }> {
    if (!refreshToken) {
      return { success: false, message: "No refresh token provided" };
    }
    const parts = refreshToken.split(":");
    if (parts.length !== 2) {
      return {
        success: false,
        message: "Invalid token format",
      };
    }
    const userId = parseInt(parts[0], 10);
    const user = await db("users")
      .where({
        id: userId,
      })
      .first();

    if (!user) {
      return {
        success: false,
        message: "Invalid refresh token",
      };
    }
    const tokens = await db("refresh_tokens").where({
      user_id: userId,
    });
    let isMatch = false;
    let matchedTokenId = null;

    for (const record of tokens) {
      const match = await bcrypt.compare(refreshToken, record.token);
      if (match) {
        isMatch = true;
        matchedTokenId = record.id;
        break;
      }
    }
    if (!isMatch) {
      return { success: false, message: "Refresh token mismatch" };
    }
    const { token, refreshToken: newRefreshToken } = this.generateToken(user);
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await db("refresh_tokens")
      .where({ id: matchedTokenId })
      .update({ token: hashedNewRefreshToken });

    return {
      success: true,
      message: "Token refreshed successfully",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      refreshToken: newRefreshToken,
    };
  }

  public async logout(refreshToken: string | undefined): Promise<IResponse> {
    if (refreshToken) {
      const parts = refreshToken.split(":");
      if (parts.length === 2) {
        const userId = parseInt(parts[0], 10);
        const tokens = await db("refresh_tokens").where({
          user_id: userId,
        });
        for (const record of tokens) {
          const match = await bcrypt.compare(refreshToken, record.token);
          if (match) {
            await db("refresh_tokens").where({ id: record.id }).del();
            break;
          }
        }
      }
    }
    return { success: true, message: "Logged out successfully" };
  }
}
