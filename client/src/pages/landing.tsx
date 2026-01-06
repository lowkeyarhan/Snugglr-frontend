import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const ENTER_AT = 14;
    const EXIT_AT = 6;

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const y = window.scrollY;
      setIsScrolled((prev) => (prev ? y > EXIT_AT : y > ENTER_AT));
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="scroll-smooth bg-white font-display text-slate-900 antialiased selection:bg-primary/20 selection:text-primary"
      style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 bg-doodle-subtle pointer-events-none"></div>

      {/* Header */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled ? "pt-3" : "pt-0",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-auto transform-gpu will-change-[transform,width,height] transition-[width,height,transform,background-color,backdrop-filter,border-radius,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "bg-white/50 backdrop-blur-md",
            isScrolled
              ? "h-14 w-[min(100%-2rem,56rem)] rounded-full shadow-xl shadow-black/10 pl-6 pr-2 border border-white/60"
              : "h-20 w-full rounded-none shadow-none border border-transparent",
          ].join(" ")}
        >
          <div className="h-full flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-extrabold tracking-[-0.02em]"
                style={{ fontFamily: "'Pacifico', cursive" }}
              >
                Snugglr
              </span>
            </div>
            <nav className="hidden md:flex gap-8">
              <a
                className="text-sm font-display font-bold text-gray-500 hover:text-black transition-colors tracking-tight"
                href="#safety"
              >
                Safety
              </a>
              <a
                className="text-sm font-display font-bold text-gray-500 hover:text-black transition-colors tracking-tight"
                href="#flow"
              >
                Flow
              </a>
              <a
                className="text-sm font-display font-bold text-gray-500 hover:text-black transition-colors tracking-tight"
                href="#community"
              >
                Community
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-display font-extrabold transition-all transform hover:scale-105 tracking-tight"
              >
                Start Matching
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col gap-8 fade-in-up">
            <div className="inline-flex items-center gap-2 self-start bg-gray-100 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-primary text-xs">
                verified
              </span>
              <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-gray-600">
                Verified Students Only
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-gray-900 leading-[1.05]">
              Your Campus.
              <br />
              Your Mystery.
              <br />
              <span className="text-primary">Your Match.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-[1.7] max-w-lg font-medium">
              The premium anonymous dating experience designed exclusively for
              university students. Connect authentically, without the pressure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => navigate("/auth")}
                className="bg-black text-white px-8 py-4 rounded-lg text-base font-display font-extrabold transition-all hover:bg-gray-800 flex items-center justify-center gap-2 shadow-lg shadow-black/30 tracking-tight"
              >
                <span>Start Matching</span>
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("how-it-works");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 rounded-lg text-base font-display font-extrabold text-gray-900 border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center tracking-tight"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="relative h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl fade-in-up delay-200 group">
            <img
              alt="Students socializing"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkMDS5Evx1RgqXhP_CJVz1cD1w--n4xyWl1Aud4J0YNfYD29CVbEoUsRYof3AI5ZsYjvKPB0efnaRV4tJ83Z1p5rO0qNMuUEVVZuCckAzVxl51NZA9dOPpu8V4qJe1s1CFEMqBfWPZFdknY6nagLq2_D3dGof1xTxLi7_jWjQtjsDjAu0cc64Q94bcr2jh6ydJbluau1IkADeQjQbkWRBTueB-R0PtEf5dvYzrk5zuQxnOtul1lFs77QVWoiQ5mUmN5rL5wg4OIQEq"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                    <img
                      alt="User"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU-Eg2RAKTKdNmiCNzAi737Bvn0bDn1dXQAU3tb1-rp3Kx5I2jo768H7oYyysxPOFIg3dSmc5mHeafwii72nlr-dbA1Jvxak-cgvjgtLuiQDJoIVeKHa4yrqzVCXQGiL89OMRFEHOvvz5k2DXHWaJcxQIehhBDITdpa20i6C7g5iTslOt6Rfut6U9nNyLl7h01fvttmZu_Cw0fSHyE7d9aOZ5gzPelYSA4AXlyDKfrvy2RvIEBXdhXCEfnyGjUvSOr3tZt8fd5Gr-W"
                    />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-display font-bold">
                    +2k
                  </div>
                </div>
                <p className="font-semibold text-sm text-white/90">
                  Students active now
                </p>
              </div>
              <p className="text-lg font-display font-bold tracking-tight">
                Find your vibe at your university.
              </p>
            </div>
          </div>
        </section>

        {/* Why Snugglr Section */}
        <section
          className="bg-gray-50 py-24 border-y rounded-bubble border-gray-100"
          id="safety"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 fade-in-up">
              <h2 className="text-3xl lg:text-4xl font-display font-extrabold mb-4 tracking-tight">
                Why Snugglr?
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed font-body">
                We've reimagined campus dating to prioritize safety, mystery,
                and genuine connection.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow fade-in-up delay-100">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    verified_user
                  </span>
                </div>
                <h3 className="text-xl font-display font-extrabold mb-3 tracking-tight">
                  Verified Students Only
                </h3>
                <p className="text-gray-500 leading-[1.6] text-sm font-body font-medium">
                  Exclusive access. We verify every user via their .edu email to
                  ensure a safe, bot-free environment for real students.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow fade-in-up delay-200">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    visibility_off
                  </span>
                </div>
                <h3 className="text-xl font-display font-extrabold mb-3 tracking-tight">
                  Total Anonymity
                </h3>
                <p className="text-gray-500 leading-[1.6] text-sm font-body font-medium">
                  Express yourself freely. Your identity remains hidden until
                  you decide to reveal it. No pressure, just connection.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow fade-in-up delay-300">
                <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-3xl">
                    favorite
                  </span>
                </div>
                <h3 className="text-xl font-display font-extrabold mb-3 tracking-tight">
                  Personality First
                </h3>
                <p className="text-gray-500 leading-[1.6] text-sm font-body font-medium">
                  Go beyond the surface. Our matching algorithm connects you
                  based on shared interests, vibes, and campus bubbles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-24 overflow-hidden" id="flow">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 fade-in-up">
                <h2 className="text-4xl font-display font-extrabold mb-6 tracking-tight">
                  How it Works
                </h2>
                <p className="text-lg text-gray-500 mb-10 leading-relaxed font-body font-medium">
                  From signup to your first date, the Snugglr journey is
                  designed to be seamless, safe, and exciting.
                </p>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-display font-bold text-lg">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">
                        Sign up with .edu
                      </h4>
                      <p className="text-gray-500 mt-2 leading-relaxed font-body font-medium">
                        Join using your university email to verify your student
                        status instantly.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-display font-extrabold text-lg">
                      2
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">
                        Create your Persona
                      </h4>
                      <p className="text-gray-500 mt-2 leading-relaxed font-body font-medium">
                        Build an anonymous profile highlighting your interests,
                        major, and what you're looking for.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center font-display font-extrabold text-lg">
                      3
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-extrabold text-gray-900 tracking-tight">
                        Match & Chat
                      </h4>
                      <p className="text-gray-500 mt-2 leading-relaxed font-body font-medium">
                        Find matches nearby. Chat anonymously to see if there is
                        a spark before revealing who you are.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-primary font-display font-extrabold hover:text-primary-dark inline-flex items-center gap-1 group tracking-tight"
                  >
                    Start your journey
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
              <div className="lg:w-1/2 relative fade-in-up delay-200">
                <div className="relative z-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-sm mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <span className="material-symbols-outlined text-gray-400">
                      menu
                    </span>
                    <span className="font-pacifico text-lg tracking-tight">
                      Snugglr
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU-Eg2RAKTKdNmiCNzAi737Bvn0bDn1dXQAU3tb1-rp3Kx5I2jo768H7oYyysxPOFIg3dSmc5mHeafwii72nlr-dbA1Jvxak-cgvjgtLuiQDJoIVeKHa4yrqzVCXQGiL89OMRFEHOvvz5k2DXHWaJcxQIehhBDITdpa20i6C7g5iTslOt6Rfut6U9nNyLl7h01fvttmZu_Cw0fSHyE7d9aOZ5gzPelYSA4AXlyDKfrvy2RvIEBXdhXCEfnyGjUvSOr3tZt8fd5Gr-W"
                        alt="Profile"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-4 aspect-[4/5] relative overflow-hidden flex items-end">
                    <div className="absolute inset-0 bg-gray-200">
                      <img
                        className="w-full h-full object-cover opacity-80 mix-blend-overlay grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkMDS5Evx1RgqXhP_CJVz1cD1w--n4xyWl1Aud4J0YNfYD29CVbEoUsRYof3AI5ZsYjvKPB0efnaRV4tJ83Z1p5rO0qNMuUEVVZuCckAzVxl51NZA9dOPpu8V4qJe1s1CFEMqBfWPZFdknY6nagLq2_D3dGof1xTxLi7_jWjQtjsDjAu0cc64Q94bcr2jh6ydJbluau1IkADeQjQbkWRBTueB-R0PtEf5dvYzrk5zuQxnOtul1lFs77QVWoiQ5mUmN5rL5wg4OIQEq"
                        alt="Match"
                      />
                    </div>
                    <div className="relative z-10 w-full p-2">
                      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-display font-extrabold text-lg tracking-tight">
                            StellarWizard said hi👋
                          </h5>
                        </div>
                        <p className="text-xs text-gray-500 font-body">
                          Junior • he/him
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6">
                    <button className="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-3xl">
                        close
                      </span>
                    </button>
                    <button className="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:bg-primary-dark transition-colors">
                      <span className="material-symbols-outlined text-3xl">
                        favorite
                      </span>
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-blue-50 rounded-full blur-3xl opacity-50 z-0 transform scale-110"></div>
              </div>
            </div>
          </div>
        </section>

        {/* The Journey Section */}
        <section className="py-24 bg-white" id="community">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 fade-in-up">
              <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-6 tracking-[-0.02em]">
                The Journey
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed font-body font-medium">
                From mysterious stranger to campus crush in five simple steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Step 1 */}
              <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <h3 className="font-display font-extrabold text-lg mb-2 tracking-tight">
                  Sign Up
                </h3>
                <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                  Use your university email to verify your student status.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <h3 className="font-display font-extrabold text-lg mb-2 tracking-tight">
                  Build Profile
                </h3>
                <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                  Share your vibes and interests. Keep the mystery alive.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">
                    travel_explore
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-lg mb-2 tracking-tight">
                  Discover
                </h3>
                <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                  Find matches based on personality compatibility.
                </p>
              </div>

              {/* Step 4 */}
              <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">
                    chat_bubble_outline
                  </span>
                </div>
                <h3 className="font-display font-extrabold text-lg mb-2 tracking-tight">
                  Connect
                </h3>
                <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                  Chat privately and securely without revealing photos yet.
                </p>
              </div>

              {/* Step 5 */}
              <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-black flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors border border-accent/20">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <h3 className="font-display font-extrabold text-lg mb-2 tracking-tight">
                  Confess
                </h3>
                <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                  Share your identity when you're ready to meet up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-black aspect-[21/9] flex items-center justify-center group">
              <div className="absolute inset-0 opacity-60">
                <img
                  alt="Campus Life"
                  className="w-full h-full object-cover transition-transform duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkMDS5Evx1RgqXhP_CJVz1cD1w--n4xyWl1Aud4J0YNfYD29CVbEoUsRYof3AI5ZsYjvKPB0efnaRV4tJ83Z1p5rO0qNMuUEVVZuCckAzVxl51NZA9dOPpu8V4qJe1s1CFEMqBfWPZFdknY6nagLq2_D3dGof1xTxLi7_jWjQtjsDjAu0cc64Q94bcr2jh6ydJbluau1IkADeQjQbkWRBTueB-R0PtEf5dvYzrk5zuQxnOtul1lFs77QVWoiQ5mUmN5rL5wg4OIQEq"
                />
              </div>
              <div className="relative z-10 text-center max-w-xl px-6">
                <h2 className="text-white text-3xl md:text-5xl font-display font-extrabold mb-6 tracking-[-0.02em]">
                  Your Campus. Your Rules.
                </h2>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed font-body font-medium">
                  Join thousands of students finding meaningful connections
                  every day.
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-white text-black px-8 py-3 rounded-full font-display font-extrabold hover:bg-gray-100 transition-colors tracking-tight"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              <div className="flex flex-col gap-4 group">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">
                    verified_user
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold mb-2 tracking-tight">
                    Verified Community
                  </h3>
                  <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                    Exclusive access ensures you're only talking to real
                    students on your campus.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 group">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">
                    visibility_off
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold mb-2 tracking-tight">
                    Complete Anonymity
                  </h3>
                  <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                    Explore connections without prejudice. Your identity is
                    yours to keep.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 group">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">
                    favorite_border
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold mb-2 tracking-tight">
                    Meaningful Connections
                  </h3>
                  <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                    Our algorithm prioritizes personality and interests over
                    profile pictures.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 group">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">
                    lock
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold mb-2 tracking-tight">
                    Secure & Private
                  </h3>
                  <p className="text-sm text-gray-500 leading-[1.6] font-body font-medium">
                    End-to-end encryption keeps your conversations and data safe
                    at all times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white pt-20 pb-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-16 mb-16 border-b border-gray-800 pb-16">
              <div className="max-w-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl font-pacifico tracking-[-0.02em]">
                    Snugglr
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-[1.7] mb-8 font-body font-medium">
                  Reimagining college dating with mystery, authenticity, and
                  safety at the core.
                </p>
                <div className="flex gap-4">
                  <a
                    className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                    href="#"
                  >
                    <i
                      className="fa-brands fa-instagram text-base"
                      aria-hidden="true"
                    />
                  </a>
                  <a
                    className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                    href="#"
                  >
                    <i
                      className="fa-brands fa-twitter text-base"
                      aria-hidden="true"
                    />
                  </a>
                  <a
                    className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                    href="#"
                  >
                    <span className="text-xs font-display font-bold">TT</span>
                  </a>
                </div>
              </div>
              <div className="flex gap-16 flex-wrap">
                <div className="flex flex-col gap-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-widest text-gray-500">
                    Platform
                  </h4>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#how-it-works"
                  >
                    How it Works
                  </a>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#safety"
                  >
                    Safety
                  </a>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#"
                  >
                    User data
                  </a>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-widest text-gray-500">
                    Company
                  </h4>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#"
                  >
                    About
                  </a>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#"
                  >
                    Careers
                  </a>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#"
                  >
                    Blog
                  </a>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-widest text-gray-500">
                    Legal
                  </h4>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="text-sm text-gray-300 hover:text-white transition-colors font-body"
                    href="#"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600 font-body">
              <p>© 2026 Snugglr. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span>Made with ♥ by Arhan</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
