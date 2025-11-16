import { useState } from "react";
import { updateUserProfile } from "../API/api";

export default function Onboarding() {
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    dob: "",
    gender: "",
    pronouns: "",
    interests: "",
    topSong: "",
    topMovie: "",
    memeVibe: "",
    hint: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      const submitData: any = {};

      if (formData.name) submitData.name = formData.name;
      if (formData.university) submitData.community = formData.university;
      if (formData.dob) submitData.birthday = formData.dob;
      if (formData.gender) submitData.gender = formData.gender.toLowerCase();
      if (formData.pronouns) submitData.pronouns = formData.pronouns;
      if (formData.hint) submitData.hint = formData.hint;
      if (formData.topSong) submitData.musicPreferences = formData.topSong;
      if (formData.topMovie) submitData.favoriteShows = formData.topMovie;
      if (formData.memeVibe) submitData.memeVibe = formData.memeVibe;
      if (formData.interests) {
        const interestsArray = formData.interests
          .split(",")
          .map((interest) => interest.trim())
          .filter((interest) => interest.length > 0);
        submitData.interests = interestsArray;
      }
      const result = await updateUserProfile(submitData, token);

      if (result.data?.user) {
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
              Almost there...
            </h1>
            <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
              Craft your persona. Be unique, be real, be fun, be mysterious.
            </p>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Info Card */}
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-lg dark:shadow-glow/50 border border-gray-200 dark:border-primary/20 p-6 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Personal Info
              </h3>
              <div className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow space-y-6">
                  {/* Name */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      id="name"
                      placeholder="What should we call you?"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* University */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="university"
                    >
                      University
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      id="university"
                      placeholder="Where do you go to school?"
                      type="text"
                      value={formData.university}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="dob"
                    >
                      When's your birthday?
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary text-gray-500"
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Gender and Pronouns */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                        htmlFor="gender"
                      >
                        What's your gender?
                      </label>
                      <select
                        className="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary"
                        id="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                        htmlFor="pronouns"
                      >
                        Pronouns
                      </label>
                      <select
                        className="form-select w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary"
                        id="pronouns"
                        value={formData.pronouns}
                        onChange={handleInputChange}
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
                </div>
              </div>
            </div>

            {/* Your World, Your Vibe Card */}
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-lg dark:shadow-glow/50 border border-gray-200 dark:border-primary/20 p-6 flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Your Vibe
              </h3>
              <div className="space-y-6 flex-grow flex flex-col">
                <div className="flex-grow space-y-6">
                  {/* Interests */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="interests"
                    >
                      Interests
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      id="interests"
                      placeholder="e.g., Coding, Flirting, Reading etc."
                      type="text"
                      value={formData.interests}
                      onChange={handleInputChange}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Separate interests with commas.
                    </p>
                  </div>

                  {/* Your Anthem */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="topSong"
                    >
                      What do you listen to?
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      id="topSong"
                      placeholder="e.g., Drake, Lana Del Rey, Kishore Kumar etc."
                      type="text"
                      value={formData.topSong}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Favorite Movie/Show */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="topMovie"
                    >
                      What's your favorite shows?
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      id="topMovie"
                      placeholder="e.g., My Fault, Friends, Saiyaara etc."
                      type="text"
                      value={formData.topMovie}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Meme Vibe */}
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                      htmlFor="memeVibe"
                    >
                      Meme Vibe
                    </label>
                    <input
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      id="memeVibe"
                      placeholder="Describe your sense of humor."
                      type="text"
                      value={formData.memeVibe}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The Mystery Section */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-lg dark:shadow-glow/50 border border-gray-200 dark:border-primary/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Avatar Placeholder */}
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="flex h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-primary/50 items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">
                    person
                  </span>
                </div>
                <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                  Avatar upload coming soon!
                </p>
              </div>

              {/* Hint */}
              <div className="md:col-span-2">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2 tracking-tight">
                    The Mystery
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Turn up the heat. Let them guess who you are. (Optional)
                  </p>
                </div>
                <label
                  className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2"
                  htmlFor="hint"
                >
                  Hint
                </label>
                <textarea
                  className="w-full rounded-[10px] border-gray-300 dark:border-gray-600 bg-background-light dark:bg-gray-800/50 resize-none focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500 text-base"
                  id="hint"
                  placeholder="Something quirky like “You'll always find me in the library” or “I'm a bit of a nerd”"
                  rows={4}
                  value={formData.hint}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 max-w-md mx-auto">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 max-w-md mx-auto">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                Profile updated successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              className="w-full max-w-md mx-auto flex items-center justify-center rounded-full h-16 px-8 bg-primary text-white text-xl font-bold hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/40 dark:shadow-glow transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white mr-2"
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
              ) : (
                <>
                  <span>Save &amp; Continue</span>
                  <span className="material-symbols-outlined ml-2">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
