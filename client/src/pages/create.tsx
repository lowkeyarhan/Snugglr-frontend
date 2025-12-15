import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { createConfession } from "../userAPI/confessions";

export default function Create() {
  const navigate = useNavigate();
  const [confessionText, setConfessionText] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("Crush");
  const [isPosting, setIsPosting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  const vibes = ["Crush", "Funny", "Vent", "Question", "Shoutout"];

  const handlePost = async () => {
    if (!confessionText.trim()) return;

    setIsPosting(true);
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Call the API to create confession
      const response = await createConfession(confessionText.trim(), token);

      if (response.success) {
        // Set posted state to show "Posted" button
        setIsPosted(true);

        // Reset form after a short delay
        setTimeout(() => {
          setConfessionText("");
          setSelectedVibe("Crush");
          setIsPosted(false);
          navigate("/home");
        }, 1500);
      }
    } catch (error) {
      console.error("Error posting confession:", error);
      // You might want to show an error message to the user here
      alert(
        error instanceof Error ? error.message : "Failed to post confession"
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="w-full max-w-[960px] mx-auto px-4 sm:px-10 md:px-20 lg:px-40 py-5 relative">
            {/* Cute background bubbles */}
            <div
              className="pointer-events-none select-none absolute -top-20 -left-20 w-48 h-48 rounded-full opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 212, 229, 0.5) 0%, rgba(217, 3, 104, 0.5) 100%)",
              }}
            />
            <div
              className="pointer-events-none select-none absolute -bottom-20 -right-20 w-64 h-64 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 212, 229, 0.5) 0%, rgba(217, 3, 104, 0.5) 100%)",
              }}
            />
            <div
              className="pointer-events-none select-none absolute top-1/4 right-[5%] w-24 h-24 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 212, 229, 0.2) 0%, rgba(217, 3, 104, 0.2) 100%)",
              }}
            />
            <div
              className="pointer-events-none select-none absolute bottom-1/3 left-[10%] w-32 h-32 rounded-full"
              style={{ backgroundColor: "rgba(255,105,180,0.2)" }}
            />
            {/* Hero */}
            <div className="relative z-10 flex flex-col items-center text-center mt-8 mb-6">
              <img
                alt="Playful heart character"
                className="w-24 h-24 mb-4 rounded-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxA2hTgXMYGkAFOWKaC12t7g-tmAXanzqtEM0lzkL7EneEsFWLtjj2nivmBSVduLK1BNB_S8QhvftU-CGOhAb9EZj1Yw5Er-5T7Lbkyys5x5x2znWrdk9JU_i-YKMQbI5Y7KA3SDDRTyEA7DbxH5W3ayf2cQli4fn6aqbWsEWSZ2UvYw5nT7gSP2tYMY1la1pW-NredN7QzWH0BsjztZMdOVimE6tTAJg4fLvkBH8UqgB7QmgirMk7UOIMbTP-sml-qzwHBPkzEB08"
              />
              <p
                className="text-4xl font-black leading-tight tracking-[-0.033em]"
                style={{ color: "#333333" }}
              >
                Spill the Beans!
              </p>
              <p
                className="text-lg mt-2"
                style={{ color: "rgba(51,51,51,0.7)" }}
              >
                Your identity is our little secret.
              </p>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 px-4 py-4 sm:px-4 sm:py-6">
              <div className="flex flex-col gap-6">
                {/* Confession Input - bubbly */}
                <div className="relative">
                  <textarea
                    className="form-input w-full min-h-60 resize-none overflow-hidden focus:outline-0 focus:ring-4 bg-white/80 backdrop-blur-md rounded-[1.5rem] text-lg font-medium leading-normal p-6"
                    style={{
                      borderWidth: 2,
                      borderColor: "#FFC0CB",
                      color: "#333333",
                      boxShadow:
                        "0 8px 16px rgba(255, 105, 180, 0.2), 0 4px 6px rgba(255, 105, 180, 0.1)",
                    }}
                    maxLength={280}
                    placeholder="Type your confession here..."
                    value={confessionText}
                    onChange={(e) => setConfessionText(e.target.value)}
                  />
                  <div
                    className="absolute bottom-4 right-4 text-sm font-semibold"
                    style={{ color: "#FF69B4" }}
                  >
                    {confessionText.length}/280
                  </div>
                </div>

                {/* Vibe Selection */}
                <div>
                  <h3
                    className="px-4 pb-3 pt-2 text-xl font-bold leading-tight"
                    style={{ color: "#333333" }}
                  >
                    Add a Vibe
                  </h3>
                  <div className="flex gap-3 p-3 flex-wrap justify-center">
                    {vibes.map((vibe) => (
                      <button
                        key={vibe}
                        onClick={() => setSelectedVibe(vibe)}
                        className={`flex h-12 cursor-pointer shrink-0 items-center justify-center gap-x-2 rounded-full transition-colors px-6 ${
                          selectedVibe === vibe
                            ? "text-white"
                            : "backdrop-blur-sm border-2 text-[color:#333333]"
                        }`}
                        style={
                          selectedVibe === vibe
                            ? {
                                backgroundColor: "#FF69B4",
                                boxShadow:
                                  "0 8px 16px rgba(255, 105, 180, 0.2), 0 4px 6px rgba(255, 105, 180, 0.1)",
                              }
                            : {
                                backgroundColor: "rgba(255, 212, 229, 0.5)",
                                border: "none",
                              }
                        }
                      >
                        <span className="text-base font-medium leading-normal">
                          {vibe}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Post Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handlePost}
                    disabled={!confessionText.trim() || isPosting || isPosted}
                    className="flex flex-row rounded-lg bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30 transition-colors font-bold items-center justify-center gap-2 w-auto overflow-hidden h-16 px-10 text-xl leading-normal tracking-wide transform active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPosting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </>
                    ) : isPosted ? (
                      <>
                        <span className="material-symbols-outlined">check</span>
                        <span>Posted</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        <span>Post Confession</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
