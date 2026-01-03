import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfessionModal from "./ConfessionModal";
import NotificationsPane from "./notificationsPane";
import {
  getMyMatchPool,
  joinMatchPool as joinMatchPoolApi,
  leaveMatchPool as leaveMatchPoolApi,
  tryMatch as tryMatchApi,
  type MatchPoolEntry,
} from "../../api/user/match";
import {
  createConfession,
  getConfessions,
  likeConfession,
} from "../../api/user/confessions";

// --- Static Data & Constants ---
const DUMMY_STORIES = [
  {
    id: 1,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCB_6rmObUhldwe4i9PCbzTRVkpb2MYEOvUihJGtikOXIT5UZLcjG2EAVclz_lDd8Dtan-awoGRxTVeVOsO807unYFuGqoAn84ZE0l-PVn4QZlEJIv_j_l0TvojlVyu9uKDTP-rD7V-nC1Y_ozEecC1jZyE1d4W1uzWKDMsuwV6HHBdUulLYiC_HaQrgsT2iUR-8crvErI_sdqcjni6rAIlBXY9gzB9JIRJFP6ixWKfX3HuAZ2IdD-Nv-TcqAOSs2yie_Gf5H4AIQ6_",
    label: "Library",
    active: true,
  },
  {
    id: 2,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZIIQvZW_-Noh-_ih2kB6sJo5bTpeWRPwP27Q3ruLUzxKuAOloGfTpemv-_MdRIQ5SxhX5TsA5h-hYOHwCMCei7xI-4PAnlqDeQkOIsyIxDEULh3abU23XO3fXYDXmpep4DRa-_V1TiP3mMlMlWd93TciOTR84Clm-2rOiY651takUYdfruFezzdC6XmiDCxshi0tkrsIUoqYnS7F9Zei7ecd2B1JeV5J0qQqaBxeR9Z7nAHFhHI05p22Et68UCKxMgRziIlwBWRxF",
    label: "Coffee Spot",
    active: true,
  },
  {
    id: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCm7I_7dKnyLVkMFkGR8iosBu5iG6yq3DYXYq8tbIzqZtA63jEJYOWmSKOMj5xmisliL-HpBatWZi1VxdT4a9tdbXsdyx_WJuAph9AJ6zDHZFpEpk78R6GegCIUwIasvdoBlVDuKyB_QWTNyDg1tvZP_olYp6cg1VZBRnl-_pUrW68BcCOF0rVRiO72YowbgSghdvndIWdf6VTwIVFusEhPoHZ8OIYjJxv9Do5sr4rHgL47-oW06D8zbjAIKcCIc4LIBkJSmmOPBiCb",
    label: "Game Day",
    active: false,
  },
  {
    id: 4,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEJG0tWOe1zoKgNEsa_z7-7kevf2mUQiVc7gS_FZF_nnYPkGkx7M0PTli7P1Wkm9aa7XK9FIqYrHE5qmt0lXr_23QZ7vsYsAGxWtukNNezdcmc4b-C1KxdfcIiLzl_wZCWCVYakwuvyhl2uRzuChAJhz1LPIlzkcY5PNTlVKuzw74PwXi7DMYrpWg9PJEgqz7oXqnv_JX9GWwgXlQ_BS8mAMn1-7QtIhwU2etUI-1znAmBppDNRPkudbCofAACon1WtRiXPMdcBkKw",
    label: "Arts",
    active: false,
  },
  {
    id: 5,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcbhr6-mUfNxXyvss7SJf9REo5RjdjPuuWfx8R3vJ9hUqPw1Ne9FZrUJHdoQo4GfSKdBD0WnKyort4BI137D8A1W7PAlNsHToliF2oZ9JdDF5FRUugVC0Yc6GMGMhBfMqE4me74qzX7pBnhDaJY7Qx5V0Ck6WQjhOIkmhb3C5EPCF4I1IIqijMJziGfWWFZHbMPYSIlzWYT50XonRRA_K72P0OVFOzwH1CfAlKjYK8A3aSlgOgpxLa6f6yR-El0KzK89-BRjvnU-HM",
    label: "Game Day",
    active: false,
  },
  {
    id: 6,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcApau9rQ7Yr7H2_AmBzE_jeKJB7MBnH9QtkbjdAxdXD5xxQRV65HoGuq0QgHUfx09cTXv1jT7ZvltT1diEPBd-1eZLeyZKEodyN8loNCi_Yzrb0wRw4mVb3H4Zs-tS3zbMOArXAznt8FeQIG7zhu94F93rjee8HRrkSp_s7oPyfPaU_K-9Eho-xBfff8aiOqCF6xmfw9weqk40Tz1AEcjDhevfa4y2TfeRTKUitkSboxUqDJ_OEuppPQI9NP1-nkpE571iyhNXCua",
    label: "Game Day",
    active: false,
  },
  {
    id: 7,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqsNzbu8FWdPWlAYpsh46Pg2Hj_dyVH5gAEPoWhGTGVl8ZQIYFSQWJz-_28xyUY0-xR-eTmRiDCuNCfgUdeEpM0RR3DWIZKU_T62lBR2VL8Le0kYtKIP2sRko_Udgn5p2MT5EbM0ezOYZl_Tb51d4a2Fb_5MXGZiTEhqU6r1mVsV_WqHb1AeWN29_x_32eE4bJ52pw1P05MdAzQQFMyjxQKl9RiCwRtiagPyU28S3QmzkZIHOonmiBOkeTxUK35Nd8hNbjvfSkmejF",
    label: "Game Day",
    active: false,
  },
];

const MOOD_OPTIONS = [
  { value: "coffee", label: "Coffee Date", icon: "local_cafe", tag: "COFFEE" },
  { value: "study", label: "Study Break", icon: "menu_book", tag: "STUDY" },
  { value: "walk", label: "Campus Walk", icon: "directions_walk", tag: "WALK" },
  { value: "food", label: "Food Run", icon: "restaurant", tag: "FOOD" },
];

const DEFAULT_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_YX25qZViEflCHgTYx35BCCxKSIcXoJXYfftwqTe5_2D99L_DNt-WzJmUW-Z_cKwT5-nFnHi4Y8qpitKSv3SeTEf5Jd1JedF7619n_w3FFhu_kbhOatj4a2SPQGjVhnXWIwS03lrfHRV7lWWhHL-MaLnaiDcWxBLFhj8WR3V700GCz0LmzEQMe_-q_JakJJRezZp4JBE5HMrIZ28VWLPpiJugZ3Vj34umg-vUo3XUnVASWsVcWxncacTycJ30OZ3-cqxODArUs-FF",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAU-Eg2RAKTKdNmiCNzAi737Bvn0bDn1dXQAU3tb1-rp3Kx5I2jo768H7oYyysxPOFIg3dSmc5mHeafwii72nlr-dbA1Jvxak-cgvjgtLuiQDJoIVeKHa4yrqzVCXQGiL89OMRFEHOvvz5k2DXHWaJcxQIehhBDITdpa20i6C7g5iTslOt6Rfut6U9nNyLl7h01fvttmZu_Cw0fSHyE7d9aOZ5gzPelYSA4AXlyDKfrvy2RvIEBXdhXCEfnyGjUvSOr3tZt8fd5Gr-W",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB3_iPJIQrt9-mW5A2ydCh3Yxc4LvljOrKyoltkptN-cVP6DbgD5zAnr4dEs77kaw5Z8IqCaskYDyn_nJ-7e1EQD6Mb6OXgIyrvFZGK4vcEV_4flgPXBJhCJYP4RWJgmdloYhBZdEczYdkPD91Lbxip2szT9kOihSNg5cv4LAw4gFIEslHasQHpUQwZvWBs8cSEUqlKhDBI0KtNhHEcGz1lzukeOzUbX5Zg0W62uoUsmn7g8g5pIk7t8OIfrlI8EmzJYYxJH5A9BR92",
];

const formatTimeAgo = (date: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function MainContent() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- State ---
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newConfession, setNewConfession] = useState("");
  const [posting, setPosting] = useState(false);
  const [selectedConfession, setSelectedConfession] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [poolEntry, setPoolEntry] = useState<MatchPoolEntry | null>(null);
  const [poolModalOpen, setPoolModalOpen] = useState(false);
  const [poolMood, setPoolMood] = useState<string>(MOOD_OPTIONS[0].value);
  const [poolNote, setPoolNote] = useState("");
  const [poolSubmitting, setPoolSubmitting] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchConfessions = async () => {
    if (!token) return setError("Please login first");
    setLoading(true);
    try {
      const res = await getConfessions(token);
      res.success
        ? setConfessions(res.data.confessions || [])
        : setError("Failed to load confessions");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, []);

  // --- Match Pool Logic ---
  useEffect(() => {
    if (!token) return;
    getMyMatchPool(token)
      .then((res) => {
        setPoolEntry(res.entry);
        if (res.entry) {
          setPoolMood(res.entry.mood);
          setPoolNote(res.entry.description || "");
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!poolEntry || !token) return;
    const interval = setInterval(async () => {
      try {
        const res = await tryMatchApi(token);
        if (res.matched && res.chatId) {
          setPoolEntry(null);
          navigate("/chat");
        }
      } catch (err: any) {
        if (
          err?.response?.status === 400 &&
          err?.response?.data?.message === "Not in pool"
        )
          setPoolEntry(null);
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [poolEntry, token, navigate]);

  const handlePoolAction = async (action: "join" | "leave") => {
    setPoolError(null);
    if (!token) return setPoolError("Please login first");

    try {
      if (action === "join") {
        setPoolSubmitting(true);
        await joinMatchPoolApi(poolMood, poolNote.trim() || undefined, token);
        const res = await getMyMatchPool(token);
        res.entry
          ? setPoolEntry(res.entry)
          : setPoolError("Failed to retrieve entry");
        setPoolModalOpen(false);
      } else {
        await leaveMatchPoolApi(token);
        setPoolEntry(null);
      }
    } catch (e: any) {
      setPoolError(e?.message || `Failed to ${action} pool`);
    } finally {
      setPoolSubmitting(false);
    }
  };

  // --- Confession Handlers ---
  const toggleLike = async (id: string) => {
    if (!token) return;
    const res = await likeConfession(id, token);
    if (res.success) {
      setConfessions((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
                ...c,
                isLikedByMe: res.liked,
                likesCount: res.liked
                  ? (c.likesCount || 0) + 1
                  : Math.max(0, (c.likesCount || 0) - 1),
              }
            : c
        )
      );
    }
  };

  const handlePost = async () => {
    if (!newConfession.trim() || !token) return;
    setPosting(true);
    try {
      const res = await createConfession(newConfession, token);
      if (res.success) {
        setNewConfession("");
        fetchConfessions();
      }
    } finally {
      setPosting(false);
    }
  };

  // --- Render Helpers ---
  const activeMood =
    MOOD_OPTIONS.find((m) => m.value === poolEntry?.mood) || MOOD_OPTIONS[0];

  return (
    <>
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-32">
          {/* Stories */}
          <section className="w-full overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-4 min-w-min">
              <div className="flex flex-col gap-2 items-center cursor-pointer group w-[88px] shrink-0">
                <div className="relative w-[88px] h-[88px] rounded-full border-[3px] border-dashed border-gray-300 flex items-center justify-center bg-white dark:bg-surface-dark group-hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    add
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  Your Story
                </span>
              </div>
              {DUMMY_STORIES.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col gap-2 items-center cursor-pointer w-[88px] shrink-0"
                >
                  <div
                    className={`p-[3px] rounded-full ${
                      story.active
                        ? "bg-gradient-to-tr from-yellow-400 to-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <div className="w-[82px] h-[82px] rounded-full border-[3px] border-white dark:border-background-dark overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center hover:scale-110 duration-500 transition-transform"
                        style={{ backgroundImage: `url('${story.image}')` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      story.active
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {story.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Match Pool Section */}
          <section>
            {poolEntry ? (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none bg-white dark:bg-surface-dark group border border-gray-100 dark:border-gray-800">
                <div className="absolute top-4 right-4 z-20">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-900 dark:text-white text-xs font-bold border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Waiting for Match...
                  </span>
                </div>
                <div className="flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-5/12 relative bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[220px] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-80 dark:opacity-60 grayscale transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGeVXNdWGX7KK0KH26kEFuJ67M89Nu5utrJXa7IitWLfxvPUnut4nMVHYYBCaGhaJFW5nPtAXRyvtI8pc6_EKut6PSAb5NPWz_DaTTks_9AKzVhpP8YMrSZpB7QQ3iDZ1eyxy2Q6kyiF1-EEQzBB8RZdMaJb2bKnK3cZv0PRdrwnOEtS71KD6ddKbl9hWuWHFsk7hLMxQYYE9SMJxA9ow6Sq3Iao7A03fy27RLQskhZjAl8uKK9zwddCHU2opcvWfr9zt5-ukMJZzM')",
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 to-transparent mix-blend-overlay"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-white dark:bg-surface-dark text-emerald-600 shadow-xl shadow-black/5 dark:shadow-black/50 flex items-center justify-center mb-3 transform -rotate-6 transition-transform group-hover:rotate-0 duration-300 border border-gray-100 dark:border-gray-700">
                        <span className="material-symbols-outlined text-3xl">
                          {activeMood.icon}
                        </span>
                      </div>
                      <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                          {activeMood.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-7/12 p-6 flex flex-col justify-center">
                    <div className="mb-5">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        You're in the Pool!
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sit tight. We're looking for someone who matches your
                        vibe perfectly.
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 mb-5 relative transition-colors hover:border-emerald-500/30">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">
                            format_quote
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5 tracking-wide">
                            Your Note
                          </p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic leading-snug">
                            {poolEntry.description
                              ? `"${poolEntry.description}"`
                              : "“No note yet — add one to stand out.”"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {poolError && (
                      <div className="mb-4 text-sm font-semibold text-red-500">
                        {poolError}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPoolMood(poolEntry.mood);
                          setPoolNote(poolEntry.description || "");
                          setPoolModalOpen(true);
                        }}
                        className="flex-1 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-gray-200/50 dark:shadow-none text-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          tune
                        </span>
                        View Details
                      </button>
                      <button
                        onClick={() => handlePoolAction("leave")}
                        className="px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                      >
                        Leave Pool
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none bg-white dark:bg-surface-dark group">
                <div className="absolute top-0 right-0 p-2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>{" "}
                    405 Online
                  </span>
                </div>
                <div className="flex flex-col md:flex-row">
                  <div
                    className="w-full md:w-2/5 h-48 md:h-auto bg-cover bg-center relative"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGeVXNdWGX7KK0KH26kEFuJ67M89Nu5utrJXa7IitWLfxvPUnut4nMVHYYBCaGhaJFW5nPtAXRyvtI8pc6_EKut6PSAb5NPWz_DaTTks_9AKzVhpP8YMrSZpB7QQ3iDZ1eyxy2Q6kyiF1-EEQzBB8RZdMaJb2bKnK3cZv0PRdrwnOEtS71KD6ddKbl9hWuWHFsk7hLMxQYYE9SMJxA9ow6Sq3Iao7A03fy27RLQskhZjAl8uKK9zwddCHU2opcvWfr9zt5-ukMJZzM')",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r"></div>
                  </div>
                  <div className="w-full md:w-3/5 px-6 pt-4 pb-6 md:p-8 flex flex-col justify-center gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        Join the Campus Match Pool
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        Dive into the live pool to find your connection.
                        Matching is anonymous until you both say yes.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <button
                        className="flex-1 bg-black hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/20"
                        onClick={() => setPoolModalOpen(true)}
                      >
                        Join Pool
                      </button>
                      <div className="flex -space-x-3 overflow-hidden p-1">
                        {[
                          "aida-public/AB6AXuDcbhr6-mUfNxXyvss7SJf9REo5RjdjPuuWfx8R3vJ9hUqPw1Ne9FZrUJHdoQo4GfSKdBD0WnKyort4BI137D8A1W7PAlNsHToliF2oZ9JdDF5FRUugVC0Yc6GMGMhBfMqE4me74qzX7pBnhDaJY7Qx5V0Ck6WQjhOIkmhb3C5EPCF4I1IIqijMJziGfWWFZHbMPYSIlzWYT50XonRRA_K72P0OVFOzwH1CfAlKjYK8A3aSlgOgpxLa6f6yR-El0KzK89-BRjvnU-HM",
                          "aida-public/AB6AXuBcApau9rQ7Yr7H2_AmBzE_jeKJB7MBnH9QtkbjdAxdXD5xxQRV65HoGuq0QgHUfx09cTXv1jT7ZvltT1diEPBd-1eZLeyZKEodyN8loNCi_Yzrb0wRw4mVb3H4Zs-tS3zbMOArXAznt8FeQIG7zhu94F93rjee8HRrkSp_s7oPyfPaU_K-9Eho-xBfff8aiOqCF6xmfw9weqk40Tz1AEcjDhevfa4y2TfeRTKUitkSboxUqDJ_OEuppPQI9NP1-nkpE571iyhNXCua",
                          "aida-public/AB6AXuDqsNzbu8FWdPWlAYpsh46Pg2Hj_dyVH5gAEPoWhGTGVl8ZQIYFSQWJz-_28xyUY0-xR-eTmRiDCuNCfgUdeEpM0RR3DWIZKU_T62lBR2VL8Le0kYtKIP2sRko_Udgn5p2MT5EbM0ezOYZl_Tb51d4a2Fb_5MXGZiTEhqU6r1mVsV_WqHb1AeWN29_x_32eE4bJ52pw1P05MdAzQQFMyjxQKl9RiCwRtiagPyU28S3QmzkZIHOonmiBOkeTxUK35Nd8hNbjvfSkmejF",
                        ].map((path, i) => (
                          <img
                            key={i}
                            alt="user"
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover"
                            src={`https://lh3.googleusercontent.com/${path}`}
                          />
                        ))}
                        <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +400
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Confessions Section */}
          <section>
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Anonymous Confessions
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Secrets, crushes, and campus gossip.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-xl">
                  person_off
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 resize-none h-12 py-2 text-base"
                  placeholder="Spill the tea... (Anonymous)"
                  value={newConfession}
                  onChange={(e) => setNewConfession(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-[20px]">
                        image
                      </span>
                    </button>
                    <button className="text-gray-400 hover:text-primary transition-colors p-1">
                      <span className="material-symbols-outlined text-[20px]">
                        tag
                      </span>
                    </button>
                  </div>
                  <button
                    className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
                    onClick={handlePost}
                    disabled={posting || !newConfession.trim()}
                  >
                    {posting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading confessions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confessions.map((c, i) => {
                  const isLiked =
                    c.isLikedByMe ??
                    c.likes?.includes(localStorage.getItem("userId") || "");
                  const user = c.user || {};
                  const username =
                    user.username ||
                    user.name ||
                    (user._id
                      ? `User ${user._id.slice(-4)}`
                      : `Anonymous #${(c.user || "").slice(-3)}`);
                  const avatar = user.profilePicture || DEFAULT_AVATARS[i % 3];

                  return (
                    <div
                      key={c._id}
                      className="flex flex-col rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-900/50"
                    >
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-center bg-no-repeat bg-cover"
                            style={{ backgroundImage: `url("${avatar}")` }}
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {username}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatTimeAgo(c.createdAt)}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-900 dark:text-white">
                          {c.confession || c.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-slate-500 dark:text-slate-400">
                          <button
                            className={`flex items-center gap-1.5 transition-colors ${
                              isLiked ? "text-primary" : "hover:text-pink-500"
                            }`}
                            onClick={() => toggleLike(c._id)}
                          >
                            <span
                              className={`material-symbols-outlined text-xl ${
                                isLiked ? "fill-current" : ""
                              }`}
                            >
                              {isLiked ? "favorite" : "favorite_border"}
                            </span>
                            <span className="text-sm font-medium">
                              {c.likesCount || 0}
                            </span>
                          </button>
                          <button
                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            onClick={() => {
                              setSelectedConfession(c);
                              setIsModalOpen(true);
                            }}
                          >
                            <span className="material-symbols-outlined text-xl">
                              mode_comment
                            </span>
                            <span className="text-sm font-medium">
                              {c.commentsCount || 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <NotificationsPane />

      {poolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setPoolModalOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Join Match Pool
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose a vibe and drop a short note (max 80 chars).
                </p>
              </div>
              <button
                onClick={() => setPoolModalOpen(false)}
                className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-gray-500">
                  close
                </span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPoolMood(m.value)}
                  className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                    poolMood === m.value
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/5 hover:bg-gray-100/60 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        poolMood === m.value
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {m.icon}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {m.tag}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {m.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Your note
                </label>
                <span className="text-xs text-gray-400">
                  {poolNote.length}/80
                </span>
              </div>
              <textarea
                value={poolNote}
                maxLength={80}
                onChange={(e) => setPoolNote(e.target.value)}
                className="w-full min-h-[110px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder='e.g. "Studying for finals. Need a 15min coffee break!"'
              />
              {poolError && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {poolError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPoolModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                disabled={poolSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handlePoolAction("join")}
                disabled={poolSubmitting || !poolMood}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black transition-colors disabled:opacity-60"
              >
                {poolSubmitting ? "Joining..." : "Join Pool"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedConfession && (
        <ConfessionModal
          confession={selectedConfession}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedConfession(null);
          }}
          onConfessionLike={async () => {
            // Re-fetching logic kept simple as per original, but could be optimized to local update
            fetchConfessions().then(() => {
              // Update selected ref if still open
              setConfessions((curr) => {
                const updated = curr.find(
                  (c) => c._id === selectedConfession._id
                );
                if (updated) setSelectedConfession(updated);
                return curr;
              });
            });
          }}
        />
      )}
    </>
  );
}
