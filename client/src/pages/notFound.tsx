import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../api/user/auth";

export default function NotFound() {
  const navigate = useNavigate();
  const userIsAuthenticated = isAuthenticated();

  const handleButtonClick = () => {
    navigate(userIsAuthenticated ? "/home" : "/auth");
  };

  return (
    <div className="bg-[#fdfcff] dark:bg-[#161022] font-display">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
        {/* Animated Bubbles */}
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>

        <div className="z-10 flex flex-col items-center">
          {/* Header */}
          <header className="absolute top-0 w-full py-6 px-8">
            <div className="mx-auto max-w-7xl text-center">
              <h1
                className="text-4xl font-extrabold tracking-tighter text-[#2E294E] dark:text-white"
                style={{ fontFamily: "'Pacifico', cursive" }}
              >
                Snugglr
              </h1>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center gap-6">
              {/* Sad Face Icon */}
              <div className="text-[#D90368]" style={{ fontSize: "100px" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "inherit" }}
                >
                  sentiment_very_dissatisfied
                </span>
              </div>

              {/* Text Content */}
              <div className="flex max-w-lg flex-col items-center gap-2">
                <h2 className="text-[#2E294E] dark:text-white text-4xl font-bold leading-tight tracking-tight">
                  Oopsie! You got a little lost.
                </h2>
                <p className="text-[#2E294E]/80 dark:text-white/80 text-base font-normal leading-normal">
                  Looks like the page you're looking for doesn't exist or has
                  moved. Let's get you back on track.
                </p>
              </div>

              {/* Dynamic Button */}
              <button
                onClick={handleButtonClick}
                className="flex min-w-[120px] max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-black text-white text-base font-bold shadow-black/30 leading-normal tracking-wide shadow-lg transition-transform duration-200"
              >
                <span className="truncate">Go back</span>
              </button>
            </div>
          </main>

          {/* Footer */}
          <footer className="absolute bottom-0 w-full py-6">
            <p className="text-[#2E294E]/60 dark:text-white/60 text-sm font-normal leading-normal text-center underline cursor-pointer hover:text-[#D90368] transition-colors">
              Need help? Contact Support
            </p>
          </footer>
        </div>
      </div>

      {/* Bubble Animation Styles */}
      <style>{`
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 212, 229, 0.5) 0%, rgba(217, 3, 104, 0.5) 100%);
          animation: float 20s infinite ease-in-out;
        }

        .bubble:nth-child(1) {
          width: 100px;
          height: 100px;
          top: 10%;
          left: 15%;
          animation-duration: 25s;
        }

        .bubble:nth-child(2) {
          width: 50px;
          height: 50px;
          top: 20%;
          right: 10%;
          animation-duration: 18s;
          animation-delay: 2s;
        }

        .bubble:nth-child(3) {
          width: 150px;
          height: 150px;
          bottom: 10%;
          left: 25%;
          animation-duration: 22s;
        }

        .bubble:nth-child(4) {
          width: 80px;
          height: 80px;
          bottom: 20%;
          right: 20%;
          animation-duration: 28s;
          animation-delay: 4s;
        }

        .bubble:nth-child(5) {
          width: 60px;
          height: 60px;
          top: 60%;
          left: 5%;
          animation-duration: 15s;
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
          }
          50% {
            transform: translateY(-50px) translateX(20px) scale(1.1);
          }
          100% {
            transform: translateY(0) translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
