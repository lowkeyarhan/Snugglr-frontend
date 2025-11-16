// Import React hooks and API functions
import { useState } from "react";
import { loginUser, registerUser } from "../API/api";

type LoginMethod = "email" | "phone";

interface FormData {
  email: string;
  phoneNumber: string;
  password: string;
}

interface ErrorState {
  message: string;
  field?: string;
}

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Set loading state and clear any previous messages
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let result;

      if (isSignUp) {
        result = await registerUser({
          email: formData.email,
          password: formData.password,
        });
      } else {
        const loginPayload: any = {
          password: formData.password,
        };

        if (loginMethod === "email") {
          loginPayload.email = formData.email;
        } else {
          loginPayload.phoneNumber = formData.phoneNumber;
        }

        result = await loginUser(loginPayload);
      }

      if (result.data) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      setSuccess(true);

      setTimeout(() => {
        if (isSignUp) {
          window.location.href = "/onboarding";
        } else {
          window.location.href = "/home";
        }
      }, 1500);
    } catch (err: any) {
      setError({
        message: err.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSwitch = () => {
    setIsSignUp(true);
    setLoginMethod("email");

    setFormData({
      email: "",
      phoneNumber: "",
      password: "",
    });

    setError(null);
    setSuccess(false);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Background gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/20 dark:via-transparent dark:to-secondary/20 z-0">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary rounded-full opacity-20 dark:opacity-30 mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-secondary rounded-full opacity-20 dark:opacity-30 mix-blend-multiply filter blur-xl animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-primary-light rounded-full opacity-10 dark:opacity-20 mix-blend-multiply filter blur-xl animation-delay-4000"></div>
        </div>

        <main className="relative z-10 flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl w-full">
            {/* Phone Mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-[320px] h-[640px] bg-[#1e1e1e] rounded-[40px] border-[5px] border-black shadow-2xl shadow-primary/20">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[35px] bg-white dark:bg-gray-800">
                  <div className="h-full w-full bg-slate-100 dark:bg-slate-900 overflow-y-auto scrollbar-hide">
                    {/* Header */}
                    <div className="p-4 bg-white dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                      <h1 className="text-xl font-bold text-primary">
                        Snugglr
                      </h1>
                      <div className="flex items-center space-x-3">
                        <button className="text-slate-600 dark:text-slate-300">
                          <span className="material-symbols-outlined">
                            search
                          </span>
                        </button>
                        <button className="text-slate-600 dark:text-slate-300">
                          <span className="material-symbols-outlined">
                            notifications
                          </span>
                        </button>
                        <img
                          alt="User avatar"
                          className="w-8 h-8 rounded-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPMGdt6o-QsLZ1akZ2DyklYyu-JxAj_h8gZ9aCyeRpYrwg49jiJ5EwCt2giMNjBux_pjdpnED9t5UEARO5aDk9MmABcAcV1b4WVdouMikLFMwVuxZZrl7tVuVXQxdL19O6qC2iCiK89f7KbrGAhUQkzWiurApmb1OS75mKVjL5ozCtmmyXTwSgz9mRkQDY10h_1unZPxwuXhgxGpEJPVQJrL9qqp39bCc94YFJMoV9QhyCK_uXWql7qtK2ZWOOR3N8lOhFtxjGfkdn"
                        />
                      </div>
                    </div>

                    <div className="p-4 space-y-6">
                      {/* Find a Match Card */}
                      <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl p-4 text-white shadow-lg">
                        <h2 className="font-bold text-lg">Find a Match!</h2>
                        <p className="text-sm opacity-80 mb-3">
                          Guess who's behind the profile.
                        </p>
                        <div className="flex justify-center items-center space-x-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="relative">
                              <img
                                alt={`Mystery person ${i}`}
                                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                src={`https://lh3.googleusercontent.com/aida-public/AB6AXuDWNl3hI9dbRjkXG2aBSaXOHO9v00zKPIFk6P9wU_sXMvWCL32-Z0kJz5S1b9mi_VoiXqvAdVL7qTu0Z7z54AX2QBDG-esHzu-dOM6eqXmBWq3dKageotiyTs1lcCTFfrbkvdAvL86s1mFN--Wz0z2pKU_qMLm_SvlcM1G-R8ln9Tjlzwkrpjk_Hb8WJNSCqxjCl-ory_QCeFp7r6eDAUkXGzrOznYYi99k8I50ox1bhfKaAz-8t-aJ6lMk4bkUVhOC0Yl6XgmGuZMb`}
                              />
                              <div className="absolute inset-0 bg-primary/30 rounded-full flex items-center justify-center">
                                <span className="text-3xl font-bold">?</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suggested For You */}
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                          Suggested For You
                        </h3>
                        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4">
                          {[
                            {
                              label: "Chemistry Major",
                              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgPqr1-CwrYL6LDLvNPf8-896251RFd4jl-xxCif_hLBx9sqjZ7u4bg9xdsinaTKn62LraFduK2cjhh8AGNwpjvhl_jWo8zfAyRel_qtmfsPwxSrrSTsd55EVKljTyIXuErR62HBPe0KKBoLM4s2dFjF9bgpaFCYfdnvw662qQTxB65-snRA8F1zJjcS1kZjwgtZQ-mbysm2dYb1Xo0ObwP32JofR7raQQrtPN1hOgiBs-hrO_2ldB4BlC7_PJN7bkLG6q_I-WaX8U",
                            },
                            {
                              label: "Art History",
                              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEJUQmYlnmwrJEqrv-IQJ2lHwst1jQEjf1ykFgTY4H8pTEPi9E9WNBJ8sDZjS5QQrHhWmMa6pCbuU2-mHrPqAGUth_ZkpktEuKpAmO1K6AFi7bU09ONDJjef6gPz2iMD_XhhSrWBl6TEzZ2tCIoqF--ysoFxXJ3ZMxo36eMdk-IG2nFHsnXipN07UCRxpXkZACmEHG5D8-_qnwox5C2zRDsgUm0q404E8P0umhS7QGa5EpS8KkItZBJ2u_uJupIhOkigppuEaOvkhz",
                            },
                            {
                              label: "Basketball Team",
                              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJe40osoJ8QX3vNBRRSBC_fAdNQZJFPHozZFrAZm7nAYXUKR3WsF1XHXVXm_bHOqXHU-LSO3zQlnzYeZchcoT2nJNl_E-DzT2Lkhz3OaDhwnUk6UF3cCU6_WETqZNCpN6mjte7E4R4fdGbDmV1aBH-bUAF6mrXC5nhZTRvgoCDoBigQBnhnKJBcAbW9XeiwJwaqLZciQyvqkAtpgTSl1mRmPMh1oSINMnn2_wTZ2RqHO447xxJAatwmKuWsL5ZOSDw3xO2IwqIcScJ",
                            },
                            {
                              label: "CS Student",
                              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX0M1QmQJ0CE1oBfGk_h3B-Lqh6slCP9NdDCf-NO3CapY_ScBPJBelhhpJZl2Yq03yRFd3U3Twm9gBlzNDA5PfDfGyHYeNB7n7V7LziN2hn75_k-RwUK15LbTfHo9JsX1JmQdbyCvZbwPSRwR6N_pNcaraYMFc-8zPxhF2QptfPGTLHOsoebac02T0D7ZSUzq2B77lQMCaov0F8XmkxZABfxqqwdJzIxAOqh1TYIO7di6NkkEKjpw88BxykymSnLbqmz0Mxffsa9kg",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 w-20 text-center"
                            >
                              <img
                                alt={`Suggested match ${i + 1}`}
                                className="w-20 h-20 rounded-full object-cover shadow-md"
                                src={item.img}
                              />
                              <p className="text-xs mt-1 font-semibold text-slate-700 dark:text-slate-300">
                                {item.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Post */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 space-y-3">
                        <div className="flex items-center space-x-3">
                          <img
                            alt="User avatar"
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
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <button className="flex items-center space-x-1 text-xs">
                            <span className="material-symbols-outlined text-base">
                              favorite_border
                            </span>
                            <span>12</span>
                          </button>
                          <button className="flex items-center space-x-1 text-xs">
                            <span className="material-symbols-outlined text-base">
                              chat_bubble_outline
                            </span>
                            <span>3</span>
                          </button>
                          <button className="flex items-center space-x-1 text-xs">
                            <span className="material-symbols-outlined text-base">
                              repeat
                            </span>
                            <span>1</span>
                          </button>
                        </div>
                      </div>

                      {/* Chats */}
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
                              <p className="text-xs text-primary font-semibold truncate">
                                Typing...
                              </p>
                            </div>
                            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
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

            {/* Auth Form */}
            <div className="w-full max-w-md mx-auto">
              {/* Header */}
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

              {/* Auth Card */}
              <div
                className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-lg w-full space-y-6 animate-fadeIn"
                style={{ "--order": 1 } as React.CSSProperties}
              >
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      handleMethodSwitch();
                    }}
                    className={`flex-1 py-3 text-center font-bold transition-colors ${
                      isSignUp
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-light dark:text-muted-dark hover:text-primary"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      !isSignUp
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-light dark:text-muted-dark hover:text-primary"
                    }`}
                  >
                    Log In
                  </button>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {isSignUp && (
                    <p className="text-sm text-center text-muted-light dark:text-muted-dark">
                      Sign up with your university email to get verified.
                    </p>
                  )}

                  {/* Login Method Toggle - Only for Sign In */}
                  {!isSignUp && (
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod("email");
                          setFormData((prev) => ({ ...prev, phoneNumber: "" }));
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          loginMethod === "email"
                            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                            : "text-muted-light dark:text-muted-dark hover:text-primary"
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod("phone");
                          setFormData((prev) => ({ ...prev, email: "" }));
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          loginMethod === "phone"
                            ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                            : "text-muted-light dark:text-muted-dark hover:text-primary"
                        }`}
                      >
                        Phone Number
                      </button>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">
                        {error.message}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-600 dark:text-green-400 text-center">
                        {isSignUp
                          ? "Registration successful!"
                          : "Login successful!"}
                      </p>
                    </div>
                  )}

                  {/* Email Input - Show for Sign Up or when Email is selected for Sign In */}
                  {(isSignUp || loginMethod === "email") && (
                    <div className="relative">
                      <label className="sr-only" htmlFor="college-email">
                        College Email
                      </label>
                      <input
                        autoComplete="email"
                        className="form-input block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary h-14 pl-4 pr-12 text-base text-text-light dark:text-text-dark placeholder-muted-light dark:placeholder-muted-dark"
                        id="college-email"
                        name="email"
                        placeholder="your.name@college.edu"
                        required
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-light dark:text-muted-dark">
                        <span className="material-symbols-outlined">
                          school
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Phone Number Input - Show only for Sign In when Phone is selected */}
                  {!isSignUp && loginMethod === "phone" && (
                    <div className="relative">
                      <label className="sr-only" htmlFor="phone-number">
                        Phone Number
                      </label>
                      <input
                        autoComplete="tel"
                        className="form-input block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary h-14 pl-4 pr-12 text-base text-text-light dark:text-text-dark placeholder-muted-light dark:placeholder-muted-dark"
                        id="phone-number"
                        name="phoneNumber"
                        placeholder="+1 (555) 123-4567"
                        required
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-light dark:text-muted-dark">
                        <span className="material-symbols-outlined">phone</span>
                      </div>
                    </div>
                  )}

                  {/* Password Input */}
                  <div className="relative">
                    <label className="sr-only" htmlFor="password">
                      Password
                    </label>
                    <input
                      autoComplete="current-password"
                      className="form-input block w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary h-14 pl-4 pr-12 text-base text-text-light dark:text-text-dark placeholder-muted-light dark:placeholder-muted-dark"
                      id="password"
                      name="password"
                      placeholder={
                        isSignUp ? "Create a password" : "Enter your password"
                      }
                      required
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-light dark:text-muted-dark">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  {!isSignUp && (
                    <div className="flex items-center justify-end">
                      <div className="text-sm">
                        <button
                          type="button"
                          className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div>
                    <button
                      className="group relative flex w-full justify-center items-center gap-2 rounded-lg border border-transparent bg-primary py-3 px-4 text-base font-bold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark transition-all duration-300 ease-in-out shadow-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
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
                      ) : (
                        <>
                          {isSignUp ? "Continue to Profile Setup" : "Sign In"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Terms */}
              <p
                className="text-center text-xs text-muted-light dark:text-muted-dark mt-6 animate-fadeIn"
                style={{ "--order": 2 } as React.CSSProperties}
              >
                By continuing, you agree to our{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline cursor-pointer"
                  onClick={(e) => e.preventDefault()}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline cursor-pointer"
                  onClick={(e) => e.preventDefault()}
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
