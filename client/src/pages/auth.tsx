import { useState } from "react";
import { loginUser, registerUser } from "../../api/user/auth";

// --- Reusable UI Components ---

const FormInput = ({ show, icon, ...props }: any) => {
  if (!show) return null;
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={props.id}>
        {props.placeholder}
      </label>
      <input
        className="form-input block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:z-10 focus:outline-none focus:ring-2 focus:ring-black focus:border-none h-14 pl-4 pr-12 text-base text-text-light dark:text-text-dark placeholder-muted-light dark:placeholder-muted-dark"
        {...props}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-light dark:text-muted-dark">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  );
};

// Static Phone UI
const PhoneMockup = () => (
  <div className="hidden lg:flex justify-center items-center">
    <div className="relative w-[320px] h-[640px] bg-[#1e1e1e] rounded-[40px] border-[5px] border-black shadow-2xl shadow-primary/20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[35px] bg-white dark:bg-gray-800">
        <div className="h-full w-full bg-slate-100 dark:bg-slate-900 overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="p-4 bg-white dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
            <h1
              className="text-2xl font-bold text-black"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              Snugglr
            </h1>
            <div className="flex items-center space-x-3">
              {["search", "notifications"].map((i) => (
                <button key={i} className="text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined">{i}</span>
                </button>
              ))}
              <img
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPMGdt6o-QsLZ1akZ2DyklYyu-JxAj_h8gZ9aCyeRpYrwg49jiJ5EwCt2giMNjBux_pjdpnED9t5UEARO5aDk9MmABcAcV1b4WVdouMikLFMwVuxZZrl7tVuVXQxdL19O6qC2iCiK89f7KbrGAhUQkzWiurApmb1OS75mKVjL5ozCtmmyXTwSgz9mRkQDY10h_1unZPxwuXhgxGpEJPVQJrL9qqp39bCc94YFJMoV9QhyCK_uXWql7qtK2ZWOOR3N8lOhFtxjGfkdn"
              />
            </div>
          </div>
          {/* Content */}
          <div className="p-2 space-y-6">
            {/* Find Match Card */}
            <div className="bg-gradient-to-br from-black to-gray-800 rounded-[20px] p-4 text-white shadow-lg">
              <h2 className="font-bold text-lg">Find a Match!</h2>
              <p className="text-sm opacity-80 mb-3">
                Guess who's behind the profile.
              </p>
              <div className="flex justify-center items-center space-x-4">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    alt="Mystery"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWNl3hI9dbRjkXG2aBSaXOHO9v00zKPIFk6P9wU_sXMvWCL32-Z0kJz5S1b9mi_VoiXqvAdVL7qTu0Z7z54AX2QBDG-esHzu-dOM6eqXmBWq3dKageotiyTs1lcCTFfrbkvdAvL86s1mFN--Wz0z2pKU_qMLm_SvlcM1G-R8ln9Tjlzwkrpjk_Hb8WJNSCqxjCl-ory_QCeFp7r6eDAUkXGzrOznYYi99k8I50ox1bhfKaAz-8t-aJ6lMk4bkUVhOC0Yl6XgmGuZMb"
                  />
                ))}
              </div>
            </div>
            {/* Suggested */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                Suggested For You
              </h3>
              <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
                {[
                  {
                    l: "Chemistry Major",
                    i: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgPqr1-CwrYL6LDLvNPf8-896251RFd4jl-xxCif_hLBx9sqjZ7u4bg9xdsinaTKn62LraFduK2cjhh8AGNwpjvhl_jWo8zfAyRel_qtmfsPwxSrrSTsd55EVKljTyIXuErR62HBPe0KKBoLM4s2dFjF9bgpaFCYfdnvw662qQTxB65-snRA8F1zJjcS1kZjwgtZQ-mbysm2dYb1Xo0ObwP32JofR7raQQrtPN1hOgiBs-hrO_2ldB4BlC7_PJN7bkLG6q_I-WaX8U",
                  },
                  {
                    l: "Art History",
                    i: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEJUQmYlnmwrJEqrv-IQJ2lHwst1jQEjf1ykFgTY4H8pTEPi9E9WNBJ8sDZjS5QQrHhWmMa6pCbuU2-mHrPqAGUth_ZkpktEuKpAmO1K6AFi7bU09ONDJjef6gPz2iMD_XhhSrWBl6TEzZ2tCIoqF--ysoFxXJ3ZMxo36eMdk-IG2nFHsnXipN07UCRxpXkZACmEHG5D8-_qnwox5C2zRDsgUm0q404E8P0umhS7QGa5EpS8KkItZBJ2u_uJupIhOkigppuEaOvkhz",
                  },
                  {
                    l: "Basketball Team",
                    i: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJe40osoJ8QX3vNBRRSBC_fAdNQZJFPHozZFrAZm7nAYXUKR3WsF1XHXVXm_bHOqXHU-LSO3zQlnzYeZchcoT2nJNl_E-DzT2Lkhz3OaDhwnUk6UF3cCU6_WETqZNCpN6mjte7E4R4fdGbDmV1aBH-bUAF6mrXC5nhZTRvgoCDoBigQBnhnKJBcAbW9XeiwJwaqLZciQyvqkAtpgTSl1mRmPMh1oSINMnn2_wTZ2RqHO447xxJAatwmKuWsL5ZOSDw3xO2IwqIcScJ",
                  },
                  {
                    l: "CS Student",
                    i: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX0M1QmQJ0CE1oBfGk_h3B-Lqh6slCP9NdDCf-NO3CapY_ScBPJBelhhpJZl2Yq03yRFd3U3Twm9gBlzNDA5PfDfGyHYeNB7n7V7LziN2hn75_k-RwUK15LbTfHo9JsX1JmQdbyCvZbwPSRwR6N_pNcaraYMFc-8zPxhF2QptfPGTLHOsoebac02T0D7ZSUzq2B77lQMCaov0F8XmkxZABfxqqwdJzIxAOqh1TYIO7di6NkkEKjpw88BxykymSnLbqmz0Mxffsa9kg",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex-shrink-0 w-16 text-center">
                    <img
                      alt={item.l}
                      className="w-16 h-16 rounded-full object-cover shadow-md"
                      src={`${item.i}`}
                    />
                    <p className="text-xs mt-1 font-semibold text-slate-700 dark:text-slate-300">
                      {item.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Social Post */}
            <div className="bg-white dark:bg-slate-800 rounded-[20px] shadow-sm p-3 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuMB9NiiYPub2vUBVD0nNmCNZUocfxH6Lxdg_SqgSOXBjE2oGOBIuAc5HH4x6z1foRJKqZV3EaVi5pq7yc8sCZbWbrXCEiOQ3_6G3Z-g90bbvbcb_zBtr7wm2N9uNX1AZQBoY-pgpx3mBmpgmYOqG7v2-t3Q3pM3nSSrhHhDjXyraa46RMOkORLbGvW1o5NQXnBZWp4RjIy8TXdVwOUxVttoarcNg8NUTruMzc4QiM85wBgvujH3Ei8bvrTdIfFq93t0VBESR9ASO8"
                />
                <div>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    Bio Major '25
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    2h ago
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Anyone else feel like this semester is flying by? 😅
              </p>
            </div>
            {/* Chats (Restored) */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                Chats
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 cursor-pointer">
                  <div className="relative">
                    <img
                      alt="Chat avatar 1"
                      className="w-12 h-12 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuABfCcWqddPxQTQp5guUnOs2cA3iUPgJRTGHg2bFU27deTLeAMKVjiU-PoxjTR8lwWL6SHWXpGopVqPBMR0bBSvnOg7lguAqDb-Ti1BPtF8FK4meuIS36u657IOGbj5BId_GPIsBOgJ_MT4TRPNrEusycaBYqfYVYZqqsRV51QjxN36i0xMuB6OyF7W6lr7f8Ge7uAx9ix9W6GwSnHa9gQttvOFzYIn4lGM0ByF_3pTdfvWnvYTQR35LmWp8p1L_1Mf9Ff9zbs3MvJC"
                    />
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"></span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      Mystery Match #1
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Hey! I think we have a class together.
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    2m
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 cursor-pointer">
                  <img
                    alt="Chat avatar 2"
                    className="w-12 h-12 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0HuF8ZIIgjLwS-0xsyoLr0CiLGgewlwKhwVTeCsmaZc3QiqsEO1cUpP5JwZkmIktCuR1Q0hNVvUHh_6jD6yfEp-Kx_4iRc3WT9adR-zWnRgMESvfjy9eXW6u4BR7E4B9X_BHbqYk_TXMFVHj7xJdG2Sbd0t8cGIzeoQ-9QHKLLYr1FDvhhHpZFr1eGfU6iW8tQLKrcgaV4N0295D_Ae1cRfO4gI4sN9VTptXCkIOgVeJDc7afLo-FzrDGAFbJLGuTN0fuweEKuKOC"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      CS Student
                    </p>
                    <p className="text-xs text-green-500 font-semibold truncate">
                      Typing...
                    </p>
                  </div>
                  <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Phone buttons */}
      <div className="absolute left-[-10px] top-24 w-1 h-10 bg-black rounded-l-sm"></div>
      <div className="absolute left-[-10px] top-40 w-1 h-10 bg-black rounded-l-sm"></div>
      <div className="absolute right-[-10px] top-32 w-1 h-16 bg-black rounded-r-sm"></div>
    </div>
  </div>
);

// --- Main Component ---

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [form, setForm] = useState({
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    error: null as string | null,
    success: false,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (status.error) setStatus((p) => ({ ...p, error: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });

    try {
      const payload = isSignUp
        ? { email: form.email, password: form.password }
        : {
            password: form.password,
            ...(method === "email"
              ? { email: form.email }
              : { phoneNumber: form.phoneNumber }),
          };
      const action = isSignUp ? registerUser : loginUser;
      const result = await action(payload);

      if (result.data) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      setStatus({ loading: false, error: null, success: true });
      setTimeout(
        () => (window.location.href = isSignUp ? "/onboarding" : "/home"),
        1500
      );
    } catch (err: any) {
      setStatus({
        loading: false,
        error: err.message || "An error occurred.",
        success: false,
      });
    }
  };

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setMethod("email");
    setForm({ email: "", phoneNumber: "", password: "" });
    setStatus({ loading: false, error: null, success: false });
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
                        className={`flex-1 py-3 text-center ${
                          isSignUp === isSignBtn
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
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            method === m
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
                      className={`p-3 rounded-lg border text-center text-sm ${
                        status.error
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

                  <FormInput
                    show={isSignUp || method === "email"}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.name@college.edu"
                    icon="school"
                    value={form.email}
                    onChange={handleInput}
                    required={isSignUp || method === "email"}
                  />
                  <FormInput
                    show={!isSignUp && method === "phone"}
                    id="phone"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    icon="phone"
                    value={form.phoneNumber}
                    onChange={handleInput}
                    required={!isSignUp && method === "phone"}
                  />
                  <FormInput
                    show={true}
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

                  <button
                    className="group relative flex w-full justify-center items-center gap-2 rounded-lg border border-transparent bg-gradient-to-r from-black to-gray-800 py-3 px-4 text-base font-bold text-white shadow-lg hover:shadow-glow disabled:opacity-50 transition-all duration-300"
                    type="submit"
                    disabled={status.loading}
                  >
                    {status.loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isSignUp ? "Creating account..." : "Signing in..."}
                      </>
                    ) : isSignUp ? (
                      "Continue to Profile Setup"
                    ) : (
                      "Sign In"
                    )}
                  </button>
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
