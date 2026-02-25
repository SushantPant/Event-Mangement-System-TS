import {
  Body,
  Controller,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Response,
  Request,
} from "tsoa";
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ErrorResponse,
  ValidationErrorResponse,
} from "../interfaces/auth.interface";
import express from "express";
import bcrypt from "bcryptjs";
import db from "../db/db";
import jwt from "jsonwebtoken";
@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  private generateToken(user: { id: number; username: string; email: string }) {
    const secret = process.env.JWT_SECRET || "SuperSecretKey123!@";
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      secret,
      { expiresIn: "15m" } as jwt.SignOptions,
    );
    const refreshToken = `${user.id}:${Math.random().toString(36).substring(2)}`;
    return { token, refreshToken };
  }

  private refreshTokenCookie(
    res: express.Response,
    refreshToken: string | null,
  ) {
    if (!refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      return;
    }
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  @Post("register")
  @SuccessResponse("201", "Created")
  @Response<ErrorResponse>("400", "Validation Error or User Already Exists")
  public async register(
    @Body() requestBody: RegisterRequest,
    @Request() req: express.Request,
  ): Promise<AuthResponse | void> {
    const { username, email, password } = requestBody;
    if (!username || !email || !password) {
      this.setStatus(400);
      return {
        success: false,
        message: "Validation Error: Missing required fields",
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.setStatus(400);
      return {
        success: false,
        message: "Validation Error: Invalid email format",
      };
    }
    if (password.length < 6) {
      this.setStatus(400);
      return {
        success: false,
        message:
          "Validation Error: Password must be at least 6 characters long",
      };
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [id] = await db("users").insert({ username, email, password_hash });
    const { token, refreshToken } = this.generateToken({
      id,
      username,
      email,
    });
    const refreshTokenHashed = await bcrypt.hash(refreshToken, 10);
    await db("refresh_tokens").insert({
      user_id: id,
      token: refreshTokenHashed,
    });
    if (req.res) {
      this.refreshTokenCookie(req.res, refreshToken);
    }
    this.setStatus(201);
    return {
      success: true,
      message: "User registered successfully",
      data: { token, user: { id, username, email } },
    };
  }
  @Post("login")
  @Response<ErrorResponse>("400", "Validation Error or Invalid Credentials")
  public async login(
    @Body() requestBody: LoginRequest,
    @Request() req: express.Request,
  ): Promise<AuthResponse | void> {
    const { email, password } = requestBody;
    const user = await db("users").where({ email }).first();
    if (!user) {
      this.setStatus(400);
      return {
        success: false,
        message: "Invalid credentials",
      };
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      this.setStatus(400);
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
    });
    if (req.res) {
      this.refreshTokenCookie(req.res, refreshToken);
      return {
        success: true,
        message: "Login successful",
        data: {
          token,
          user: { id: user.id, username: user.username, email: user.email },
        },
      };
    }
  }

  @Post("refresh")
  @Response<ErrorResponse>(401, "Invalid or expired refresh token")
  public async refresh(
    @Request() req: express.Request,
  ): Promise<AuthResponse | void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      this.setStatus(401);
      return { success: false, message: "No refresh token provided" };
    }
    const parts = refreshToken.split(":");
    if (parts.length !== 2) {
      this.setStatus(401);
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
      this.setStatus(401);
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
      this.setStatus(401);
      return { success: false, message: "Refresh token mismatch" } as any;
    }
    const { token, refreshToken: newRefreshToken } = this.generateToken(user);
    await db("refresh_tokens")
      .where({ id: matchedTokenId })
      .update({ token: newRefreshToken });
    if (req.res) {
      this.refreshTokenCookie(req.res, newRefreshToken);
    }
    return {
      success: true,
      message: "Token refreshed successfully",
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email },
      },
    };
  }

  @Post("logout")
  public async logout(
    @Request() req: express.Request,
  ): Promise<AuthResponse | void> {
    const refreshToken = req.cookies?.refreshToken;
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
    if (req.res) {
      this.refreshTokenCookie(req.res, null);
    }
    return { success: true, message: "Logged out successfully" };
  }
}
