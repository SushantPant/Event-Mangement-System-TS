import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { AuthReponse, AuthTextMapping } from "../interface/auth.interface";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const [currentType, setCurrentType] = useState<string>("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authText: AuthTextMapping = {
    login: {
      title: "Welcome Back",
      submitButton: "Sign In",
      toggleText: "Don't have an account?",
      toggleCTA: "Sign up",
    },
    register: {
      title: "Create Account",
      submitButton: "Sign Up",
      toggleText: "Already have an account?",
      toggleCTA: "Sign in",
    },
  };
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };
  const text = isLogin ? authText.login : authText.register;
  const submitForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setIsSubmitting(true);
    if (isLogin) {
      const res: AuthReponse = await login(email, password);

      if (res.success) {
        toast.success("Login Successful");
      } else {
        toast.error(res.message);
      }
    } else {
      const username = formData.get("username") as string;
      const res: AuthReponse = await register(username, email, password);
      if (res.success) {
        toast.success("Registration Successful");
      } else {
        toast.error(res.message);
      }
    }
    setIsSubmitting(false);
  };

  const togglePassword = (): void => {
    if (currentType === "password") {
      setCurrentType("text");
    } else {
      setCurrentType("password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center  px-4 py-6 md:px-0">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-black mb-1">
            {text.title}
          </h1>
        </div>

        <form onSubmit={submitForm} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-slate-100"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-slate-100"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={currentType}
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-slate-100"
              />
              {currentType === "password" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
                  onClick={togglePassword}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500"
                  onClick={togglePassword}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-t-2 border-t-amber-600 border-gray-300 rounded-full animate-spin"></div>
            )}
            {text.submitButton}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {text.toggleText}{" "}
          <button
            onClick={toggleForm}
            className="text-amber-600 font-medium hover:underline"
          >
            {text.toggleCTA}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
