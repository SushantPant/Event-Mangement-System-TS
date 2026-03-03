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

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}


export {
  User,
  AuthData,
  RegisterRequest,
  LoginRequest,
};
