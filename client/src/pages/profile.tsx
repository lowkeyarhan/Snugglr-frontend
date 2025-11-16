import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, updateUserProfile } from "../API/api";
import { clearAuth } from "../API/auth";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    community: "",
    birthday: "",
    phoneNumber: "",
    gender: "",
    pronouns: "",
    interests: "",
    memeVibe: "",
    musicPreferences: "",
    favoriteShows: "",
    favoriteSpot: "",
    quirkyFact: "",
    loveLanguage: "",
    fantasies: "",
    idealDate: "",
    hint: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      const result = await getCurrentUser(token);

      if (result.data?.user) {
        const user = result.data.user;
        setFormData({
          name: user.name || "",
          username: user.username || "",
          community: user.community || "",
          birthday: user.birthday
            ? new Date(user.birthday).toISOString().split("T")[0]
            : "",
          phoneNumber: user.phoneNumber || "",
          gender: user.gender || "",
          pronouns: user.pronouns || "",
          hint: user.hint || "",
          interests: Array.isArray(user.interests)
            ? user.interests.join(", ")
            : "",
          memeVibe: user.memeVibe || "",
          musicPreferences: user.musicPreferences || "",
          favoriteShows: user.favoriteShows || "",
          favoriteSpot: user.favoriteSpot || "",
          quirkyFact: user.quirkyFact || "",
          loveLanguage: user.loveLanguage || "",
          fantasies: user.fantasies || "",
          idealDate: user.idealDate || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        return;
      }

      // Prepare data for submission
      const submitData: any = {};

      if (formData.name) submitData.name = formData.name;
      if (formData.community) submitData.community = formData.community;
      if (formData.birthday) submitData.birthday = formData.birthday;
      if (formData.phoneNumber) submitData.phoneNumber = formData.phoneNumber;
      if (formData.gender) submitData.gender = formData.gender;
      if (formData.pronouns) submitData.pronouns = formData.pronouns;
      if (formData.memeVibe) submitData.memeVibe = formData.memeVibe;
      if (formData.musicPreferences)
        submitData.musicPreferences = formData.musicPreferences;
      if (formData.favoriteShows)
        submitData.favoriteShows = formData.favoriteShows;
      if (formData.interests) {
        const interestsArray = formData.interests
          .split(",")
          .map((interest) => interest.trim())
          .filter((interest) => interest.length > 0);
        submitData.interests = interestsArray;
      }
      if (formData.favoriteSpot)
        submitData.favoriteSpot = formData.favoriteSpot;
      if (formData.loveLanguage)
        submitData.loveLanguage = formData.loveLanguage;
      if (formData.quirkyFact) submitData.quirkyFact = formData.quirkyFact;
      if (formData.fantasies) submitData.fantasies = formData.fantasies;
      if (formData.idealDate) submitData.idealDate = formData.idealDate;
      if (formData.hint) submitData.hint = formData.hint;

      const result = await updateUserProfile(submitData, token);

      if (result.data?.user) {
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setIsSaving(false);
      setError(err.message || "Failed to update profile");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/auth";
  };

  if (isLoading) {
    return (
      <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
        <div className="flex h-full w-full">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading profile...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Hi {formData.username && `${formData.username}`}
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Keep your info fresh and find your perfect match!
              </p>
            </div>

            {/* Profile Picture - Placeholder for now */}
            <div className="relative flex flex-col items-center gap-6 mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-600">
                    person
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avatar upload coming soon!
              </p>
            </div>

            {/* Two Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Personal Information */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-glow/50 border border-slate-100 dark:border-primary/20 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    person
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Personal Info
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      name="community"
                      value={formData.community}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="Your University"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        Pronouns
                      </label>
                      <select
                        name="pronouns"
                        value={formData.pronouns}
                        onChange={handleInputChange}
                        className="form-select w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      >
                        <option value="">Select</option>
                        <option value="He/Him">He/Him</option>
                        <option value="She/Her">She/Her</option>
                        <option value="They/Them">They/Them</option>
                        <option value="He/They">He/They</option>
                        <option value="She/They">She/They</option>
                        <option value="Ze/Hir">Ze/Hir</option>
                        <option value="Ze/Zir">Ze/Zir</option>
                        <option value="Xe/Xem">Xe/Xem</option>
                        <option value="Ey/Em">Ey/Em</option>
                        <option value="Ve/Ver">Ve/Ver</option>
                        <option value="Fae/Faer">Fae/Faer</option>
                        <option value="Per/Per">Per/Per</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Your World, Your Vibe */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-glow/50 border border-slate-100 dark:border-primary/20 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    palette
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Vibe
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Your Interests
                    </label>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="e.g., Coding Club, Hiking, Psych 101"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Separate interests with commas
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Meme Vibe
                    </label>
                    <input
                      type="text"
                      name="memeVibe"
                      value={formData.memeVibe}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="e.g., Distracted Boyfriend"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Music Taste
                    </label>
                    <input
                      type="text"
                      name="musicPreferences"
                      value={formData.musicPreferences}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="e.g., Taylor Swift, Drake"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Movie/Show Taste
                    </label>
                    <input
                      type="text"
                      name="favoriteShows"
                      value={formData.favoriteShows}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="e.g., The Matrix, Parasite"
                    />
                  </div>
                </div>
              </div>

              {/* Campus Life */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-glow/50 border border-slate-100 dark:border-primary/20 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    school
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Campus Life
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Favorite Spot on Campus
                    </label>
                    <input
                      type="text"
                      name="favoriteSpot"
                      value={formData.favoriteSpot}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="Where do you spend most of your day?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Quirky Fact About You
                    </label>
                    <input
                      type="text"
                      name="quirkyFact"
                      value={formData.quirkyFact}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="Something unique about you"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Love Language
                    </label>
                    <input
                      type="text"
                      name="loveLanguage"
                      value={formData.loveLanguage}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="e.g., Quality Time, Physical Touch"
                    />
                  </div>
                </div>
              </div>

              {/* Dreams & Desires */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-glow/50 border border-slate-100 dark:border-primary/20 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    auto_awesome
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dreams & Desires
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Your Fantasies & Dreams
                    </label>
                    <textarea
                      name="fantasies"
                      value={formData.fantasies}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px] p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="What do you dream about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Ideal Date
                    </label>
                    <textarea
                      name="idealDate"
                      value={formData.idealDate}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px] p-3 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                      placeholder="Describe your perfect date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* The Mystery - Full Width */}
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-soft dark:shadow-glow/50 border border-slate-100 dark:border-primary/20 p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">
                  psychology
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  The Mystery
                </h2>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  A Hint About Your Identity
                </label>
                <textarea
                  name="hint"
                  value={formData.hint}
                  onChange={handleInputChange}
                  className="w-full min-h-[120px] p-4 rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/70 placeholder-gray-400 dark:placeholder-gray-500 transition-all resize-none outline-none focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-text-light dark:text-text-dark"
                  placeholder="Drop a subtle clue... Keep them guessing"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                  Tip: Make it intriguing but not too obvious. Let them earn the
                  reveal!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pb-8">
              <button
                onClick={handleSave}
                disabled={isSaving || success || !!error}
                className={`px-12 py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-3 disabled:cursor-not-allowed ${
                  success
                    ? "bg-green-500 shadow-green-500/40 scale-105"
                    : error
                    ? "bg-red-500 shadow-red-500/40 scale-105"
                    : "bg-primary hover:bg-primary/90 shadow-primary/40 dark:shadow-glow  active:scale-95 focus:ring-primary disabled:opacity-50 disabled:transform-none"
                }`}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6 text-white"
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
                    Saving...
                  </>
                ) : success ? (
                  <>
                    <span className="material-symbols-outlined text-2xl">
                      check_circle
                    </span>
                    Saved
                  </>
                ) : error ? (
                  <>
                    <span className="material-symbols-outlined text-2xl">
                      error
                    </span>
                    Error
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">
                      save
                    </span>
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="px-12 py-4 rounded-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold text-lg tracking-wide shadow-lg shadow-red-600/40 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-2xl">
                  logout
                </span>
                Logout
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
