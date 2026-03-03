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
  RegisterRequest,
  LoginRequest,
} from "../interfaces/auth.interface";
import { IResponse } from "../interfaces/response.interface";
import express from "express";
import { AuthService } from "../services/AuthService";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  private authService = new AuthService();
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
      maxAge: parseInt(process.env.JWT_EXPIRES_IN ?? "7") * 24 * 60 * 60 * 1000,
    });
  }
  @Post("register")
  @SuccessResponse("201", "Created")
  @Response<IResponse>("400", "Validation Error or User Already Exists")
  public async register(
    @Body() requestBody: RegisterRequest,
    @Request() req: express.Request,
  ): Promise<IResponse | void> {
    const response = await this.authService.register(requestBody);

    if (!response.success) {
      this.setStatus(400);
      return { success: false, message: response.message };
    }

    if (req.res && response.refreshToken) {
      this.refreshTokenCookie(req.res, response.refreshToken);
    }
    this.setStatus(201);
    const { refreshToken, ...rest } = response;
    return rest;
  }
  @Post("login")
  @Response<IResponse>("400", "Validation Error or Invalid Credentials")
  public async login(
    @Body() requestBody: LoginRequest,
    @Request() req: express.Request,
  ): Promise<IResponse | void> {
    const response = await this.authService.login(requestBody);

    if (!response.success) {
      this.setStatus(400);
      return { success: false, message: response.message };
    }

    if (req.res && response.refreshToken) {
      this.refreshTokenCookie(req.res, response.refreshToken);
    }
    const { refreshToken, ...rest } = response;
    return rest;
  }

  @Post("refresh")
  @Response<IResponse>(401, "Invalid or expired refresh token")
  public async refresh(
    @Request() req: express.Request,
  ): Promise<IResponse | void> {
    const refreshToken = req.cookies.refreshToken;
    const response = await this.authService.refresh(refreshToken);

    if (!response.success) {
      this.setStatus(401);
      return { success: false, message: response.message };
    }

    if (req.res && response.refreshToken) {
      this.refreshTokenCookie(req.res, response.refreshToken);
    }
    const { refreshToken: newRefreshToken, ...rest } = response;
    return rest;
  }

  @Post("logout")
  public async logout(
    @Request() req: express.Request,
  ): Promise<IResponse | void> {
    const refreshToken = req.cookies?.refreshToken;
    const response = await this.authService.logout(refreshToken);
    if (req.res) {
      this.refreshTokenCookie(req.res, null);
    }
    return response;
  }
}
