interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface AuthData {
  token: string;
  user: User;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: AuthData;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: any;
}
interface ValidationErrorResponse {
  success: boolean;
  message: string;
}
export {
  User,
  AuthData,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ErrorResponse,
  ValidationErrorResponse,
};
