import { useState } from "react";
import { updateUserProfile } from "../../api/user/user";
import { useNavigate } from "react-router-dom";
import { Input, Textarea } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";

const NavButton = ({
  onClick,
  variant = "primary",
  icon,
  label,
  loading,
}: any) => (
  <Button
    onClick={onClick}
    disabled={loading}
    variant={variant === "finish" ? "danger" : variant === "secondary" ? "secondary" : "primary"}
    className="w-full sm:w-auto"
    isLoading={loading}
    icon={icon === "prev" ? "arrow_back" : icon === "next" ? "arrow_forward" : icon === "check" ? "check_circle" : undefined}
  >
    {loading ? "Saving..." : label}
  </Button>
);

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Personal, 1: Vibe, 2: Deep Dive
  const [status, setStatus] = useState({
    loading: false,
    error: null as string | null,
    success: false,
  });
  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    pronouns: "",
    contact: "",
    favArtists: "",
    favMovies: "",
    favAlbums: "",
    favSpot: "",
    loveLanguage: "",
    quirkyFact: "",
    idealDate: "",
    fantasies: "",
  });

  const handleChange = (e: any) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (status.error) setStatus((p) => ({ ...p, error: null }));
  };

  const handleSubmit = async () => {
    setStatus({ loading: true, error: null, success: false });
    const token = localStorage.getItem("token");
    if (!token)
      return setStatus({
        loading: false,
        error: "Please login first",
        success: false,
      });

    const toArray = (s: string) =>
      s && s.trim()
        ? s
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
        : undefined;

    // Normalize gender value to match backend enum
    const normalizeGender = (
      gender: string | undefined
    ): string | undefined => {
      if (!gender) return undefined;
      const genderMap: Record<string, string> = {
        Male: "male",
        Female: "female",
        "Non-binary": "non-binary",
        Other: "other",
        "Prefer not to say": "prefer-not-to-say",
      };
      return genderMap[gender] || gender.toLowerCase();
    };

    // Map form keys to API payload
    const payload: Record<string, any> = {};

    if (form.name?.trim()) payload.name = form.name.trim();
    if (form.dob) payload.birthday = form.dob;
    if (form.gender) payload.gender = normalizeGender(form.gender);
    if (form.pronouns?.trim()) payload.pronouns = form.pronouns.trim();
    if (form.contact?.trim()) payload.phoneNumber = form.contact.trim();

    const artists = toArray(form.favArtists);
    if (artists && artists.length > 0) payload.favArtists = artists;

    const movies = toArray(form.favMovies);
    if (movies && movies.length > 0) payload.favMovies = movies;

    const albums = toArray(form.favAlbums);
    if (albums && albums.length > 0) payload.favAlbums = albums;

    if (form.favSpot?.trim()) payload.favSpotOnCampus = form.favSpot.trim();
    if (form.loveLanguage?.trim())
      payload.loveLanguage = form.loveLanguage.trim();
    if (form.quirkyFact?.trim()) payload.quirkyFacts = form.quirkyFact.trim();
    if (form.idealDate?.trim()) payload.idealDate = form.idealDate.trim();
    if (form.fantasies?.trim()) payload.fantasies = form.fantasies.trim();

    try {
      const { data } = await updateUserProfile(payload, token);
      if (data) localStorage.setItem("user", JSON.stringify(data));
      setStatus({ loading: false, error: null, success: true });
      setTimeout(() => navigate("/home"), 1500);
    } catch (err: any) {
      setStatus({
        loading: false,
        error: err.message || "Failed to update profile",
        success: false,
      });
    }
  };

  const renderSlide = (
    index: number,
    title: string,
    subtitle: string,
    content: React.ReactNode,
    actions: React.ReactNode
  ) => (
    <div
      className={`slide-content absolute top-0 left-0 w-full h-full flex flex-col transition-opacity duration-300 ${step === index
          ? "opacity-100 pointer-events-auto z-10"
          : "opacity-0 pointer-events-none"
        }`}
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide p-8 sm:p-12 md:p-16">
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
            {title}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="space-y-6 pb-4">{content}</div>
        {(status.error || status.success) && index === 2 && (
          <div
            className={`mt-6 p-4 rounded-lg border text-center text-sm ${status.error
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-green-50 border-green-200 text-green-600"
              }`}
          >
            {status.error || "Profile updated successfully! Redirecting..."}
          </div>
        )}
      </div>
      <div
        className={`flex-none p-8 sm:p-12 md:p-16 pt-0 flex ${index === 0 ? "justify-end" : "justify-between gap-3"
          }`}
      >
        {actions}
      </div>
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] animate-float opacity-60"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[100px] animate-float opacity-60"
          style={{ animationDelay: "-3s" }}
        ></div>
      </div>

      <header className="flex-none flex items-center justify-between px-6 sm:px-10 py-5 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 text-primary bg-white dark:bg-card-dark rounded-full flex items-center justify-center shadow-lg ring-4 ring-primary/10">
            <span className="material-symbols-outlined text-3xl">favorite</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Snugglr
          </h2>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
          <span className="hidden sm:inline">Need Help?</span>
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative w-full max-w-6xl mx-auto h-full z-10">
        <div className="w-full max-w-4xl bg-card-light dark:bg-card-dark rounded-bubble shadow-2xl border border-gray-200 dark:border-primary/20 relative flex flex-col overflow-hidden h-[80vh] min-h-[650px]">
          <div className="slides-container flex-1 relative w-full h-full p-8 sm:p-12 md:p-16 overflow-hidden">
            {/* Slide 1 */}
            {renderSlide(
              0,
              "Who are you?",
              "Let's start with the basics. Keep it real!",
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Name / Alias"
                    name="name"
                    icon="badge"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  label="Date of Birth"
                  name="dob"
                  icon="cake"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                />
                <Select
                  label="Gender"
                  name="gender"
                  icon="face"
                  placeholder="Select Identity"
                  options={[
                    "Male",
                    "Female",
                    "Non-binary",
                    "Other",
                    "Prefer not to say",
                  ]}
                  value={form.gender}
                  onChange={handleChange}
                />
                <Select
                  label="Pronouns"
                  name="pronouns"
                  icon="record_voice_over"
                  placeholder="Select Pronouns"
                  options={[
                    "she/her",
                    "he/him",
                    "they/them",
                    "ze/hir",
                    "Just my name",
                  ]}
                  value={form.pronouns}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Contact Number"
                    name="contact"
                    icon="call"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.contact}
                    onChange={handleChange}
                  />
                </div>
              </div>,
              <NavButton
                label="Proceed"
                icon="next"
                onClick={() => setStep(1)}
              />
            )}

            {/* Slide 2 */}
            {renderSlide(
              1,
              "The Vibe Check",
              "Your taste in art and places says a lot.",
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Favorite Artists"
                    name="favArtists"
                    icon="queue_music"
                    placeholder="Who's topping your playlist? (separate with commas)"
                    value={form.favArtists}
                    onChange={handleChange}
                  />
                </div>
                <Input
                  label="Favorite Movies"
                  name="favMovies"
                  icon="movie"
                  placeholder="Comfort films? (separate with commas)"
                  value={form.favMovies}
                  onChange={handleChange}
                />
                <Input
                  label="Favorite Albums"
                  name="favAlbums"
                  icon="album"
                  placeholder="No-skip masterpieces (separate with commas)"
                  value={form.favAlbums}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Favorite Spot on Campus"
                    name="favSpot"
                    icon="location_on"
                    placeholder="Library 3rd floor..."
                    value={form.favSpot}
                    onChange={handleChange}
                  />
                </div>
              </div>,
              <>
                <NavButton
                  label="Previous"
                  icon="prev"
                  variant="secondary"
                  onClick={() => setStep(0)}
                />
                <NavButton
                  label="Proceed"
                  icon="next"
                  onClick={() => setStep(2)}
                />
              </>
            )}

            {/* Slide 3 */}
            {renderSlide(
              2,
              "Deep Dive",
              "Let's get real. What makes you, you?",
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Love Language"
                  name="loveLanguage"
                  icon="favorite_border"
                  placeholder="e.g., Words of Affirmation"
                  value={form.loveLanguage}
                  onChange={handleChange}
                />
                <Textarea
                  label="A Quirky Fact About You"
                  name="quirkyFact"
                  placeholder="I collect strangely shaped rocks..."
                  value={form.quirkyFact}
                  onChange={handleChange}
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Textarea
                    label="Ideal Date"
                    name="idealDate"
                    placeholder="Coffee and a long walk..."
                    value={form.idealDate}
                    onChange={handleChange}
                    className="h-32"
                  />
                  <Textarea
                    label="Fantasies"
                    name="fantasies"
                    placeholder="Traveling the world in a van..."
                    value={form.fantasies}
                    onChange={handleChange}
                    className="h-32"
                  />
                </div>
              </div>,
              <>
                <NavButton
                  label="Previous"
                  icon="prev"
                  variant="secondary"
                  onClick={() => setStep(1)}
                />
                <NavButton
                  label="Finish Setup"
                  icon="check"
                  variant="finish"
                  onClick={handleSubmit}
                  loading={status.loading}
                />
              </>
            )}
          </div>
        </div>
        <p className="mt-8 text-center text-gray-500 text-sm font-medium z-10">
          Snugglr © 2023. Anonymous. Safe. Fun.
        </p>
      </main>
    </div>
  );
}
