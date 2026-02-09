import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { PhoneMockup } from "../components/user/PhoneMockup";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [form, setForm] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [status, setStatus] = useState({
    error: null as string | null,
    success: false,
  });

  const { login, register, loading } = useAuth();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (status.error) setStatus((p) => ({ ...p, error: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ error: null, success: false });

    try {
      if (isSignUp) {
        await register({ email: form.email, password: form.password });
      } else {
        await login({
          password: form.password,
          ...(method === "email"
            ? { email: form.email }
            : { phoneNumber: form.phoneNumber }),
        });
      }

      setStatus({ error: null, success: true });
      setTimeout(
        () => (window.location.href = isSignUp ? "/onboarding" : "/home"),
        1500
      );
    } catch (err: any) {
      setStatus({
        error: err.message || "An error occurred.",
        success: false,
      });
    }
  };

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setMethod("email");
    setForm({ email: "", phoneNumber: "", password: "" });
    setStatus({ error: null, success: false });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:via-transparent dark:to-secondary/20 z-0">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary rounded-full opacity-20 dark:opacity-30 mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-secondary rounded-full opacity-20 dark:opacity-30 mix-blend-multiply filter blur-xl animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-primary-light rounded-full opacity-10 dark:opacity-20 mix-blend-multiply filter blur-xl animation-delay-4000"></div>
        </div>

        <main className="relative z-10 flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl w-full">
            <PhoneMockup />

            <div className="w-full max-w-md mx-auto">
              <div
                className="text-center animate-fadeIn mb-8"
                style={{ "--order": 0 } as React.CSSProperties}
              >
                <div className="flex items-center justify-center gap-3 text-slate-800 dark:text-white mb-4">
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter font-pacifico text-text-light dark:text-text-dark">
                    Snugglr
                  </h1>
                </div>
                <p className="mt-8 text-lg text-muted-light dark:text-muted-dark">
                  Find your snuggle partner on campus. Anonymously.
                </p>
              </div>

              <div
                className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-lg w-full space-y-6 animate-fadeIn"
                style={{ "--order": 1 } as React.CSSProperties}
              >
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {["Sign Up", "Log In"].map((label, idx) => {
                    const isSignBtn = idx === 0;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => switchMode(isSignBtn)}
                        className={`flex-1 py-3 text-center ${isSignUp === isSignBtn
                            ? "font-bold text-black border-b-2 border-black"
                            : "font-medium text-muted-light dark:text-muted-dark hover:text-black"
                          } transition-colors`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {isSignUp && (
                    <p className="text-sm text-center text-muted-light dark:text-muted-dark">
                      Sign up with your university email to get verified.
                    </p>
                  )}

                  {!isSignUp && (
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {["email", "phone"].map((m: any) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMethod(m);
                            setForm((p) => ({
                              ...p,
                              [m === "email" ? "phoneNumber" : "email"]: "",
                            }));
                          }}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${method === m
                              ? "bg-black dark:bg-gray-700 text-white shadow-sm"
                              : "text-muted-light dark:text-muted-dark"
                            }`}
                        >
                          {m === "email" ? "Email" : "Phone Number"}
                        </button>
                      ))}
                    </div>
                  )}

                  {(status.error || status.success) && (
                    <div
                      className={`p-3 rounded-lg border text-center text-sm ${status.error
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-green-50 border-green-200 text-green-600"
                        }`}
                    >
                      {status.error ||
                        (isSignUp
                          ? "Registration successful!"
                          : "Login successful!")}
                    </div>
                  )}

                  {(isSignUp || method === "email") && (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.name@college.edu"
                      icon="school"
                      value={form.email}
                      onChange={handleInput}
                      required={isSignUp || method === "email"}
                    />
                  )}

                  {!isSignUp && method === "phone" && (
                    <Input
                      id="phone"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      icon="phone"
                      value={form.phoneNumber}
                      onChange={handleInput}
                      required={!isSignUp && method === "phone"}
                    />
                  )}

                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={
                      isSignUp ? "Create a password" : "Enter your password"
                    }
                    icon="lock"
                    value={form.password}
                    onChange={handleInput}
                    required
                  />

                  {!isSignUp && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-sm font-medium text-red-500 hover:text-gray-800 dark:hover:text-gray-200"
                        onClick={(e) => e.preventDefault()}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={loading}
                    fullWidth
                    variant="primary"
                  >
                    {isSignUp ? "Continue to Profile Setup" : "Sign In"}
                  </Button>
                </form>
              </div>

              <p
                className="text-center text-xs text-muted-light dark:text-muted-dark mt-6 animate-fadeIn"
                style={{ "--order": 2 } as React.CSSProperties}
              >
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
