import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ConfessionModal from "../components/ConfessionModal";
import {
  getConfessions,
  likeConfession,
  createConfession,
} from "../userAPI/confessions";

// Dummy Stories
const dummyStories = [
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
];

export default function Home() {
  // Confessions state
  const [confessions, setConfessions] = useState<any[]>([]);
  const [confessionsLoading, setConfessionsLoading] = useState(true);
  const [confessionsError, setConfessionsError] = useState<string | null>(null);
  const hasFetchedConfessions = useRef(false);
  const [newConfessionText, setNewConfessionText] = useState("");
  const [postingConfession, setPostingConfession] = useState(false);
  const [selectedConfession, setSelectedConfession] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConfessions = async () => {
    try {
      setConfessionsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setConfessionsError("Please login first");
        return;
      }

      const response = await getConfessions(token);

      if (response.success && response.data) {
        setConfessions(response.data.confessions || []);
        setConfessionsError(null);
      } else {
        setConfessionsError("Failed to load confessions");
      }
    } catch (error) {
      console.error("Error fetching confessions:", error);
      setConfessionsError("Something went wrong");
    } finally {
      setConfessionsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedConfessions.current) return;
    fetchConfessions();
    hasFetchedConfessions.current = true;
  }, []);

  const toggleConfessionLike = async (confessionId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setConfessionsError("Please login first");
        return;
      }

      const response = await likeConfession(confessionId, token);

      if (response.success) {
        setConfessions((prev) =>
          prev.map((confession) => {
            if (confession._id === confessionId) {
              const newLiked = response.liked;
              const currentLikesCount = confession.likesCount || 0;

              return {
                ...confession,
                isLikedByMe: newLiked,
                likesCount: newLiked
                  ? currentLikesCount + 1
                  : Math.max(0, currentLikesCount - 1),
              };
            }
            return confession;
          })
        );
      }
    } catch (error) {
      console.error("Error liking confession:", error);
    }
  };

  const handlePostConfession = async () => {
    if (!newConfessionText.trim()) return;

    try {
      setPostingConfession(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setConfessionsError("Please login first");
        return;
      }

      const response = await createConfession(newConfessionText, token);

      if (response.success) {
        // Refresh confessions to get full user data
        setNewConfessionText("");
        await fetchConfessions();
      }
    } catch (error) {
      console.error("Error posting confession:", error);
    } finally {
      setPostingConfession(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-white h-screen overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Pattern Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-doodle-pattern opacity-100"></div>

      <div className="relative z-10 flex h-full w-full max-w-[1920px] mx-auto">
        {/* LEFT COLUMN: Navigation */}
        <Sidebar />

        {/* MIDDLE COLUMN: Content Feed */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-32">
            {/* Stories Carousel */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Campus Vibes
                </h2>
                <a
                  className="text-primary text-xs font-bold hover:underline"
                  href="#"
                >
                  View All
                </a>
              </div>
              <div className="w-full overflow-x-auto no-scrollbar pb-2">
                <div className="flex gap-4 min-w-min">
                  {/* Add Story */}
                  <div className="flex flex-col gap-2 items-center cursor-pointer group w-[88px] shrink-0">
                    <div className="relative w-[88px] h-[88px] rounded-full border-[3px] border-dashed border-gray-300 flex items-center justify-center bg-white dark:bg-surface-dark group-hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-primary text-3xl">
                        add
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white text-center">
                      Your Story
                    </span>
                  </div>

                  {/* Story Items */}
                  {dummyStories.map((story) => (
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
                            className="w-full h-full bg-cover bg-center transition-transform hover:scale-110 duration-500"
                            style={{ backgroundImage: `url('${story.image}')` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium text-center ${
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
              </div>
            </section>

            {/* Match Pool Card */}
            <section>
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none bg-white dark:bg-surface-dark group">
                <div className="absolute top-0 right-0 p-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
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
                  <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center gap-4">
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
                      <button className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/20">
                        Join Pool
                      </button>
                      <div className="flex -space-x-3 overflow-hidden p-1">
                        <img
                          alt="user"
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcbhr6-mUfNxXyvss7SJf9REo5RjdjPuuWfx8R3vJ9hUqPw1Ne9FZrUJHdoQo4GfSKdBD0WnKyort4BI137D8A1W7PAlNsHToliF2oZ9JdDF5FRUugVC0Yc6GMGMhBfMqE4me74qzX7pBnhDaJY7Qx5V0Ck6WQjhOIkmhb3C5EPCF4I1IIqijMJziGfWWFZHbMPYSIlzWYT50XonRRA_K72P0OVFOzwH1CfAlKjYK8A3aSlgOgpxLa6f6yR-El0KzK89-BRjvnU-HM"
                        />
                        <img
                          alt="user"
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcApau9rQ7Yr7H2_AmBzE_jeKJB7MBnH9QtkbjdAxdXD5xxQRV65HoGuq0QgHUfx09cTXv1jT7ZvltT1diEPBd-1eZLeyZKEodyN8loNCi_Yzrb0wRw4mVb3H4Zs-tS3zbMOArXAznt8FeQIG7zhu94F93rjee8HRrkSp_s7oPyfPaU_K-9Eho-xBfff8aiOqCF6xmfw9weqk40Tz1AEcjDhevfa4y2TfeRTKUitkSboxUqDJ_OEuppPQI9NP1-nkpE571iyhNXCua"
                        />
                        <img
                          alt="user"
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqsNzbu8FWdPWlAYpsh46Pg2Hj_dyVH5gAEPoWhGTGVl8ZQIYFSQWJz-_28xyUY0-xR-eTmRiDCuNCfgUdeEpM0RR3DWIZKU_T62lBR2VL8Le0kYtKIP2sRko_Udgn5p2MT5EbM0ezOYZl_Tb51d4a2Fb_5MXGZiTEhqU6r1mVsV_WqHb1AeWN29_x_32eE4bJ52pw1P05MdAzQQFMyjxQKl9RiCwRtiagPyU28S3QmzkZIHOonmiBOkeTxUK35Nd8hNbjvfSkmejF"
                        />
                        <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +400
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors">
                  <span className="material-symbols-outlined text-[20px]">
                    edit_note
                  </span>
                  Post Anonymous
                </button>
              </div>

              {/* Input for New Confession */}
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
                    value={newConfessionText}
                    onChange={(e) => setNewConfessionText(e.target.value)}
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
                      onClick={handlePostConfession}
                      disabled={postingConfession || !newConfessionText.trim()}
                    >
                      {postingConfession ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed */}
              {confessionsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-gray-500">Loading confessions...</p>
                </div>
              ) : confessionsError ? (
                <div className="text-center py-12 text-red-500">
                  {confessionsError}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {confessions.map((confession, index) => {
                    // Check if liked - use isLikedByMe if available, otherwise check likes array
                    const isLiked =
                      confession.isLikedByMe !== undefined
                        ? confession.isLikedByMe
                        : confession.likes?.includes(
                            localStorage.getItem("userId")
                          ) || false;

                    // Extract username from user object
                    // User can be an object with username/name or just an ID string
                    let username = "Anonymous";
                    let userAvatar = null;

                    if (confession.user) {
                      if (typeof confession.user === "object") {
                        username =
                          confession.user.username ||
                          confession.user.name ||
                          `User ${confession.user._id?.slice(-4) || ""}`;
                        userAvatar = confession.user.profilePicture || null;
                      } else {
                        // If user is just an ID string, use anonymous
                        username = `Anonymous #${confession.user.slice(-3)}`;
                      }
                    }

                    // Use different avatars based on index to create variety
                    const defaultAvatars = [
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_YX25qZViEflCHgTYx35BCCxKSIcXoJXYfftwqTe5_2D99L_DNt-WzJmUW-Z_cKwT5-nFnHi4Y8qpitKSv3SeTEf5Jd1JedF7619n_w3FFhu_kbhOatj4a2SPQGjVhnXWIwS03lrfHRV7lWWhHL-MaLnaiDcWxBLFhj8WR3V700GCz0LmzEQMe_-q_JakJJRezZp4JBE5HMrIZ28VWLPpiJugZ3Vj34umg-vUo3XUnVASWsVcWxncacTycJ30OZ3-cqxODArUs-FF",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU-Eg2RAKTKdNmiCNzAi737Bvn0bDn1dXQAU3tb1-rp3Kx5I2jo768H7oYyysxPOFIg3dSmc5mHeafwii72nlr-dbA1Jvxak-cgvjgtLuiQDJoIVeKHa4yrqzVCXQGiL89OMRFEHOvvz5k2DXHWaJcxQIehhBDITdpa20i6C7g5iTslOt6Rfut6U9nNyLl7h01fvttmZu_Cw0fSHyE7d9aOZ5gzPelYSA4AXlyDKfrvy2RvIEBXdhXCEfnyGjUvSOr3tZt8fd5Gr-W",
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3_iPJIQrt9-mW5A2ydCh3Yxc4LvljOrKyoltkptN-cVP6DbgD5zAnr4dEs77kaw5Z8IqCaskYDyn_nJ-7e1EQD6Mb6OXgIyrvFZGK4vcEV_4flgPXBJhCJYP4RWJgmdloYhBZdEczYdkPD91Lbxip2szT9kOihSNg5cv4LAw4gFIEslHasQHpUQwZvWBs8cSEUqlKhDBI0KtNhHEcGz1lzukeOzUbX5Zg0W62uoUsmn7g8g5pIk7t8OIfrlI8EmzJYYxJH5A9BR92",
                    ];
                    const avatarUrl =
                      userAvatar ||
                      defaultAvatars[index % defaultAvatars.length];

                    // Get confession text - API returns 'confession' field, not 'content'
                    const confessionText =
                      confession.confession || confession.content || "";

                    return (
                      <div
                        key={confession._id}
                        className="flex flex-col rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-900/50"
                      >
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full bg-center bg-no-repeat bg-cover"
                              style={{
                                backgroundImage: `url("${avatarUrl}")`,
                              }}
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {username}
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatTimeAgo(confession.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-900 dark:text-white">
                            {confessionText}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-slate-500 dark:text-slate-400">
                            <button
                              className={`flex items-center gap-1.5 transition-colors ${
                                isLiked ? "text-primary" : "hover:text-pink-500"
                              }`}
                              onClick={() =>
                                toggleConfessionLike(confession._id)
                              }
                            >
                              <span
                                className={`material-symbols-outlined text-xl ${
                                  isLiked ? "fill-current" : ""
                                }`}
                              >
                                {isLiked ? "favorite" : "favorite_border"}
                              </span>
                              <span className="text-sm font-medium">
                                {confession.likesCount || 0}
                              </span>
                            </button>
                            <button
                              className="flex items-center gap-1.5 hover:text-primary transition-colors"
                              onClick={() => {
                                setSelectedConfession(confession);
                                setIsModalOpen(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-xl">
                                mode_comment
                              </span>
                              <span className="text-sm font-medium">
                                {confession.commentsCount || 0}
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

        {/* RIGHT COLUMN: Notifications & Live Activity */}
        <aside className="hidden xl:flex w-80 flex-col h-full bg-white/50 dark:bg-surface-dark/50 backdrop-blur-md border-l border-gray-100 dark:border-gray-800 p-6 shrink-0 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Live Activity
            </h3>
            <button className="text-gray-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>

          {/* New Match Alert */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Matches
            </h4>
            <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl relative">
                  👻
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-surface-dark">
                    NEW
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    It's a Match!
                  </span>
                  <span className="text-xs text-gray-500">
                    Someone liked your profile...
                  </span>
                </div>
              </div>
              <button className="mt-3 w-full text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 py-2 rounded-lg transition-colors">
                Reveal (24h left)
              </button>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Trending
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">
                      local_cafe
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      Starbucks
                    </span>
                    <span className="text-xs text-gray-500">
                      128 people here
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-sm">
                  chevron_right
                </span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">
                      school
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      Main Library
                    </span>
                    <span className="text-xs text-gray-500">
                      85 people here
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-sm">
                  chevron_right
                </span>
              </div>
            </div>
          </div>

          {/* Recent Interactions */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Notifications
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-900 dark:text-white leading-snug">
                    <span className="font-bold">Sarah M.</span> replied to your
                    confession.
                  </p>
                  <span className="text-xs text-gray-400">2 min ago</span>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <div className="mt-1 h-2 w-2 rounded-full bg-transparent shrink-0"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-900 dark:text-white leading-snug">
                    <span className="font-bold">GymCrush</span> viewed your
                    profile.
                  </p>
                  <span className="text-xs text-gray-400">45 min ago</span>
                </div>
              </div>
              <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <div className="mt-1 h-2 w-2 rounded-full bg-transparent shrink-0"></div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-900 dark:text-white leading-snug">
                    3 friends joined{" "}
                    <span className="font-bold text-primary">
                      Beta House Party
                    </span>
                    .
                  </p>
                  <span className="text-xs text-gray-400">1h ago</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Confession Modal */}
      {selectedConfession && (
        <ConfessionModal
          confession={selectedConfession}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedConfession(null);
          }}
          onConfessionLike={async () => {
            // Refresh confession data after like
            const token = localStorage.getItem("token");
            if (token) {
              const response = await getConfessions(token);
              if (response.success && response.data) {
                setConfessions(response.data.confessions || []);
                // Update selected confession
                const updated = response.data.confessions.find(
                  (c: any) => c._id === selectedConfession._id
                );
                if (updated) {
                  setSelectedConfession(updated);
                }
              }
            }
          }}
        />
      )}
    </div>
  );
}
