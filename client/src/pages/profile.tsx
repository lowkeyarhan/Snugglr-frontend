import { useState, useEffect, useRef } from "react";
import Sidebar from "../userComp/Sidebar";
import { getMyProfile, updateUserProfile } from "../../api/user/user";
import { logout } from "../../api/user/auth";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    gender: "",
    pronouns: "",
    phoneNumber: "",
    interests: [] as string[],
    memeVibe: "",
    musicPreferences: "",
    favoriteShows: "",
    favoriteSpot: "",
    hint: "",
  });

  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    birthday: "",
    gender: "",
    pronouns: "",
    phoneNumber: "",
    interests: [] as string[],
    memeVibe: "",
    musicPreferences: "",
    favoriteShows: "",
    favoriteSpot: "",
    hint: "",
  });

  const [interestInput, setInterestInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Check if form has been modified
  const hasChanges = () => {
    return (
      formData.name !== originalFormData.name ||
      formData.birthday !== originalFormData.birthday ||
      formData.gender !== originalFormData.gender ||
      formData.pronouns !== originalFormData.pronouns ||
      formData.phoneNumber !== originalFormData.phoneNumber ||
      JSON.stringify(formData.interests) !==
        JSON.stringify(originalFormData.interests) ||
      formData.memeVibe !== originalFormData.memeVibe ||
      formData.musicPreferences !== originalFormData.musicPreferences ||
      formData.favoriteShows !== originalFormData.favoriteShows ||
      formData.favoriteSpot !== originalFormData.favoriteSpot ||
      formData.hint !== originalFormData.hint
    );
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Please login first");
        return;
      }

      const result = await getMyProfile(token);

      if (result.data) {
        const user: any = result.data;
        const profileData = {
          name: user.name || "",
          birthday: user.birthday
            ? new Date(user.birthday).toISOString().split("T")[0]
            : "",
          gender: user.gender || "",
          pronouns: user.pronouns || "",
          phoneNumber: user.phoneNumber || "",
          interests: Array.isArray(user.interests) ? user.interests : [],
          memeVibe: user.memeVibe || "",
          musicPreferences:
            user.musicPreferences || user.favArtists?.join(", ") || "",
          favoriteShows: user.favoriteShows || user.favMovies?.join(", ") || "",
          favoriteSpot: user.favSpotOnCampus || user.favoriteSpot || "",
          hint: user.hint || user.quirkyFacts || "",
        };
        setFormData(profileData);
        setOriginalFormData(profileData);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load profile");
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
    if (saveStatus !== "idle") setSaveStatus("idle");
    if (errorMessage) setErrorMessage(null);
  };

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }));
      setInterestInput("");
      if (saveStatus !== "idle") setSaveStatus("idle");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
    if (saveStatus !== "idle") setSaveStatus("idle");
  };

  const handleInterestKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("idle");
      setErrorMessage(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Please login first");
        setSaveStatus("error");
        return;
      }

      // Prepare data for submission
      const submitData: any = {};

      if (formData.name) submitData.name = formData.name;
      if (formData.birthday) submitData.birthday = formData.birthday;
      if (formData.gender) submitData.gender = formData.gender.toLowerCase();
      if (formData.pronouns) submitData.pronouns = formData.pronouns;
      if (formData.phoneNumber) submitData.phoneNumber = formData.phoneNumber;
      if (formData.interests.length > 0)
        submitData.interests = formData.interests;
      if (formData.memeVibe) submitData.memeVibe = formData.memeVibe;

      // Music preferences - convert comma-separated to array
      if (formData.musicPreferences) {
        const musicArray = formData.musicPreferences
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        if (musicArray.length > 0) submitData.favArtists = musicArray;
      }

      // Movies/Shows - convert comma-separated to array
      if (formData.favoriteShows) {
        const moviesArray = formData.favoriteShows
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        if (moviesArray.length > 0) submitData.favMovies = moviesArray;
      }

      if (formData.favoriteSpot)
        submitData.favSpotOnCampus = formData.favoriteSpot;
      if (formData.hint) submitData.hint = formData.hint;

      const result = await updateUserProfile(submitData, token);

      if (result.data) {
        localStorage.setItem("user", JSON.stringify(result.data));
      }

      setIsSaving(false);
      setSaveStatus("success");
      setOriginalFormData(formData);
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || "Failed to update profile");
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleLogout = () => {
    logout();
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

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex-none flex items-center justify-between px-6 sm:px-10 py-5 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 border-b border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="size-9 text-primary">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_6_319)">
                    <path
                      d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                      fill="currentColor"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_319">
                      <rect fill="white" height="48" width="48"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Snugglr
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center size-10 rounded-full bg-white dark:bg-surface-dark shadow-sm hover:shadow-md text-gray-500 hover:text-primary transition-all">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="relative group cursor-pointer">
                <div
                  className="size-10 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-surface-dark shadow-md"
                  style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDA7QNRr1VYcTnK07mybJG95Zgb4qW8zp8tqSy6vtGDuDAWSMe9g_WexngZo1x5As8qc1fWL1zUygQHIt7VhL5OLnr_BSbPZWTBYQ7hNU_3SH0iP7RaSyxrpEOMLpCR_WbsZE2HzxwlfBoJ6Q1fpCCTJbvpyqhz_uKhoPnXF0JDm32UGHYAQx314xcmJPfKWm8iNtPNgqgip1jBmFD9puKHEn09r6h11JboW7hBCMP4sLXWyjlMF4l6u7j6_3WwRohtzVvAlZ8bU-O-")`,
                  }}
                ></div>
                <div className="absolute -bottom-1 -right-1 bg-green-400 size-3 rounded-full border-2 border-white dark:border-background-dark"></div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full h-full relative overflow-y-auto scroll-smooth">
            {/* Background Blobs */}
            <div className="fixed top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none"></div>
            <div className="fixed bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-32 space-y-8">
              {/* Personal Info Section */}
              <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-soft border border-white/50 dark:border-white/5 relative group">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-10">
                  <div className="relative group cursor-pointer mb-8">
                    <div
                      className="w-48 h-48 rounded-full bg-cover bg-center shadow-2xl ring-4 ring-white dark:ring-surface-dark"
                      style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBsp3vphLUGghOkvBEYWbre6Mr0vR35W3B9UO7-t5jHtIFz1tVyIVH0uugVFQH3vgMnJzYmT6YjklGUsY4Bi7GAe-1c-zPiWz7CRwrkpxWShIuAwD9hyhS7r3jnuAWXevlynxlahGDd4Wxd6JCYNoJ-ZBlDt9ua3sow5v5vvoZI6Imlr8Fn-7BQ-oEAg5-nKDrVK2qPnhF0mAyeh6IUwYyZSXalCfpWlc5Fo3RIX4GQ8FLDpuxTSXRcV9y3crjsFHhXMNRiW6lNLY_L")`,
                      }}
                    ></div>
                    <div className="absolute bottom-2 right-2 bg-primary text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">
                        photo_camera
                      </span>
                    </div>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 text-center">
                    Who's Snuggling?
                  </h2>
                  <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-8">
                    Let's get the basics down.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Display Name */}
                  <div className="bubble-input group">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Display Name
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all border border-transparent focus-within:bg-white dark:focus-within:bg-black/20">
                      <div className="p-3 text-primary">
                        <span className="material-symbols-outlined">
                          person
                        </span>
                      </div>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="Your Name"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Birthday and Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bubble-input">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                        Birthday
                      </label>
                      <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="p-3 text-primary">
                          <span className="material-symbols-outlined">
                            cake
                          </span>
                        </div>
                        <input
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium text-sm"
                          type="date"
                        />
                      </div>
                    </div>

                    <div className="bubble-input">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                        Gender
                      </label>
                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full bg-background-light dark:bg-background-dark border-none rounded-2xl p-4 pl-4 pr-10 focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white font-medium appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">
                            Prefer not to say
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                          <span className="material-symbols-outlined">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pronouns */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Pronouns
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                      <div className="p-3 text-primary">
                        <span className="material-symbols-outlined">
                          psychology
                        </span>
                      </div>
                      <input
                        name="pronouns"
                        value={formData.pronouns}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="e.g. they/them"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Contact Number
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                      <div className="p-3 text-primary">
                        <span className="material-symbols-outlined">call</span>
                      </div>
                      <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="(555) 000-0000"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Vibe Section */}
              <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-soft border border-white/50 dark:border-white/5 relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-2xl">
                      palette
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Your Vibe
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      What makes you, you?
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Interests */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Your Interests
                    </label>
                    <div className="bg-background-light dark:bg-background-dark rounded-2xl p-3 focus-within:ring-2 focus-within:ring-secondary/50 transition-all min-h-[5rem]">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-white dark:bg-surface-dark px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              className="hover:text-red-500 ml-1 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyPress={handleInterestKeyPress}
                        className="w-full bg-transparent border-none focus:ring-0 p-1 text-gray-900 dark:text-white text-sm placeholder-gray-400"
                        placeholder="Add interests (Clubs, Hobbies)..."
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Meme Vibe */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Meme Vibe
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                      <div className="p-3 text-secondary">
                        <span className="material-symbols-outlined">
                          sentiment_very_satisfied
                        </span>
                      </div>
                      <input
                        name="memeVibe"
                        value={formData.memeVibe}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="Describe your meme taste"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Music Taste */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Music Taste
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                      <div className="p-3 text-secondary">
                        <span className="material-symbols-outlined">
                          music_note
                        </span>
                      </div>
                      <input
                        name="musicPreferences"
                        value={formData.musicPreferences}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="Favorite artists..."
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Movie & Shows */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Movie & Shows
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-secondary/50 transition-all">
                      <div className="p-3 text-secondary">
                        <span className="material-symbols-outlined">movie</span>
                      </div>
                      <input
                        name="favoriteShows"
                        value={formData.favoriteShows}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="Favorite movies..."
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus & Dreams Section */}
              <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-soft border border-white/50 dark:border-white/5 relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-accent/10 text-accent">
                    <span className="material-symbols-outlined text-2xl">
                      school
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Campus & Dreams
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Spill the tea (and your dreams).
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Favorite Spot on Campus */}
                  <div className="bubble-input">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 ml-3">
                      Favorite Spot on Campus
                    </label>
                    <div className="flex items-center bg-background-light dark:bg-background-dark rounded-2xl p-1 pr-4 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                      <div className="p-3 text-accent">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                      </div>
                      <input
                        name="favoriteSpot"
                        value={formData.favoriteSpot}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400"
                        placeholder="e.g. The old library roof"
                        type="text"
                      />
                    </div>
                  </div>

                  {/* The Mystery */}
                  <div className="bubble-input">
                    <div className="flex items-center justify-between mb-1.5 ml-3 mr-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        The Mystery
                      </label>
                      <span className="text-xs text-accent font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          visibility_off
                        </span>
                        Anonymous Hint
                      </span>
                    </div>
                    <div className="bg-background-light dark:bg-background-dark rounded-3xl p-4 focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                      <textarea
                        name="hint"
                        value={formData.hint}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-none focus:ring-0 p-2 text-gray-900 dark:text-white font-medium placeholder-gray-400 resize-none"
                        placeholder="Share a fantasy, a dream, or a secret hint about who you are..."
                        rows={4}
                      ></textarea>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-3">
                      This helps your matches guess your identity later!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 pb-4 flex flex-col gap-4">
                {/* Logout Button - Always visible */}
                <button
                  onClick={handleLogout}
                  className="w-full py-5 rounded-3xl bg-red-500 hover:bg-red-600 text-white font-bold text-xl shadow-xl shadow-red-500/30 transition-all transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span>Logout</span>
                </button>

                {/* Save Button - Only show if there are changes */}
                {hasChanges() && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-5 rounded-3xl text-white font-bold text-xl shadow-xl transition-all transform flex items-center justify-center gap-3 disabled:cursor-not-allowed ${
                      saveStatus === "success"
                        ? "bg-green-500 shadow-green-500/30 hover:scale-[1.01] active:scale-[0.98]"
                        : saveStatus === "error"
                        ? "bg-red-500 shadow-red-500/30 hover:scale-[1.01] active:scale-[0.98]"
                        : isSaving
                        ? "bg-gray-400 shadow-gray-400/30 scale-100"
                        : "bg-gradient-to-r from-primary via-primary-hover to-secondary hover:brightness-110 shadow-primary/30 hover:scale-[1.01] active:scale-[0.98]"
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
                        <span>Saving...</span>
                      </>
                    ) : saveStatus === "success" ? (
                      <>
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        <span>Saved Successfully!</span>
                      </>
                    ) : saveStatus === "error" ? (
                      <>
                        <span className="material-symbols-outlined">error</span>
                        <span>{errorMessage || "Error Saving"}</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
