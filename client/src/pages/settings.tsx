import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { clearAuth } from "../API/auth";
import { getCurrentUser, updateUserSettings, changePassword } from "../API/api";

export default function Settings() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [hideDP, setHideDP] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Change password expandable section state
  const [showChangePasswordSection, setShowChangePasswordSection] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await getCurrentUser(token);
        const user = res.data?.user as any;
        if (user) {
          setUserEmail(user.email || "");
          setPushNotifications(!!user?.settings?.pushNotifications);
          setEmailNotifications(!!user?.settings?.emailNotifications);
          setShowActiveStatus(!!user?.privacy?.showActiveStatus);
          setHideDP(!!user?.privacy?.hideDisplayPicture);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Optimistically update localStorage user object
  const updateUserInStorage = (path: string[], value: any) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      let cursor = user;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        cursor[key] = cursor[key] ?? {};
        cursor = cursor[key];
      }
      cursor[path[path.length - 1]] = value;
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  // Generic toggle handler
  const handleToggle = async (
    key:
      | "pushNotifications"
      | "emailNotifications"
      | "showActiveStatus"
      | "hideDisplayPicture",
    checked: boolean,
    setter: (v: boolean) => void,
    storagePath: string[]
  ) => {
    const prev = !checked;
    setter(checked);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await updateUserSettings({ [key]: checked } as any, token);
      updateUserInStorage(storagePath, checked);
    } catch (e) {
      // revert on error
      setter(prev);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/auth";
  };

  // Validation functions
  const validateCurrentPassword = () => {
    return currentPassword.length > 0;
  };

  const validateNewPassword = () => {
    return newPassword.length >= 6;
  };

  const validateConfirmPassword = () => {
    return confirmPassword.length > 0 && newPassword === confirmPassword;
  };

  const validateAllFields = () => {
    return (
      validateCurrentPassword() &&
      validateNewPassword() &&
      validateConfirmPassword() &&
      currentPassword !== newPassword
    );
  };

  const getFieldBorderClass = (isValid: boolean) => {
    if (!isValid) return "border-slate-300 dark:border-slate-600";
    return "border-green-500 dark:border-green-400";
  };

  const handlePasswordFieldChange = (field: string, value: string) => {
    setPasswordError("");
    setHasUnsavedChanges(true);

    switch (field) {
      case "current":
        setCurrentPassword(value);
        break;
      case "new":
        setNewPassword(value);
        break;
      case "confirm":
        setConfirmPassword(value);
        break;
    }
  };

  const handleSaveAllChanges = async () => {
    setPasswordError("");

    // Validate password fields if they have content
    if (currentPassword || newPassword || confirmPassword) {
      if (!validateAllFields()) {
        if (!currentPassword) setPasswordError("Current password is required");
        else if (!validateNewPassword())
          setPasswordError("New password must be at least 6 characters long");
        else if (!validateConfirmPassword())
          setPasswordError("New passwords do not match");
        else if (currentPassword === newPassword)
          setPasswordError(
            "New password must be different from current password"
          );
        return;
      }
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPasswordError("Authentication required");
        return;
      }

      // Save password if fields are filled
      if (currentPassword && newPassword && confirmPassword) {
        await changePassword(
          {
            currentPassword,
            newPassword,
          },
          token
        );

        // Reset password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePasswordSection(false);
      }

      // Save other settings
      await updateUserSettings(
        {
          pushNotifications,
          emailNotifications,
          showActiveStatus,
          hideDisplayPicture: hideDP,
        },
        token
      );

      setSaveSuccess(true);
      setSaveError(false);

      // Reset success state and hide button after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setHasUnsavedChanges(false);
      }, 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to save changes");
      setSaveError(true);
      setSaveSuccess(false);

      // Reset error state after 3 seconds
      setTimeout(() => {
        setSaveError(false);
      }, 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleChangePasswordSection = () => {
    setShowChangePasswordSection(!showChangePasswordSection);
    if (showChangePasswordSection) {
      // Reset fields when closing
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen">
          <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4 w-full">
            <div className="w-full max-w-3xl mx-auto">
              <div className="space-y-8">
                {/* Header with Profile */}
                <div className="flex flex-col items-center gap-4 pb-4">
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Settings
                  </h1>
                </div>

                <div className="space-y-5">
                  {/* Account Settings */}
                  <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          account_circle
                        </span>
                        <h2 className="text-xl font-bold">Account Settings</h2>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              Email
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {userEmail || ""}
                            </p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                      <button
                        onClick={toggleChangePasswordSection}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Change Password
                          </p>
                        </div>
                        <span
                          className={`material-symbols-outlined text-slate-400 group-hover:text-primary transition-all ${
                            showChangePasswordSection ? "rotate-90" : ""
                          }`}
                        >
                          chevron_right
                        </span>
                      </button>

                      {/* Expandable Password Change Section */}
                      {showChangePasswordSection && (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                          {passwordError && (
                            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                              <p className="text-red-600 dark:text-red-400 text-sm">
                                {passwordError}
                              </p>
                            </div>
                          )}

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Current Password
                              </label>
                              <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                  handlePasswordFieldChange(
                                    "current",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors ${getFieldBorderClass(
                                  validateCurrentPassword()
                                )}`}
                                placeholder="Enter current password"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) =>
                                  handlePasswordFieldChange(
                                    "new",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors ${getFieldBorderClass(
                                  validateNewPassword()
                                )}`}
                                placeholder="Enter new password (min 6 characters)"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                  handlePasswordFieldChange(
                                    "confirm",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors ${getFieldBorderClass(
                                  validateConfirmPassword()
                                )}`}
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Linked College Accounts
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </section>

                  {/* Privacy & Safety */}
                  <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          shield
                        </span>
                        <h2 className="text-xl font-bold">Privacy & Safety</h2>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              Show Active Status
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Let others see when you're online
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showActiveStatus}
                            disabled={loading}
                            onChange={(e) =>
                              handleToggle(
                                "showActiveStatus",
                                e.target.checked,
                                setShowActiveStatus,
                                ["privacy", "showActiveStatus"]
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              Hide Display Picture
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Keep your profile photo private
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hideDP}
                            disabled={loading}
                            onChange={(e) =>
                              handleToggle(
                                "hideDisplayPicture",
                                e.target.checked,
                                setHideDP,
                                ["privacy", "hideDisplayPicture"]
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Blocked & Reported Users
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Data Sharing
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </section>

                  {/* App Preferences */}
                  <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          tune
                        </span>
                        <h2 className="text-xl font-bold">App Preferences</h2>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              Push Notifications
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Get notified about messages and matches
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pushNotifications}
                            disabled={loading}
                            onChange={(e) =>
                              handleToggle(
                                "pushNotifications",
                                e.target.checked,
                                setPushNotifications,
                                ["settings", "pushNotifications"]
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              Email Notifications
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Receive weekly digest emails
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            disabled={loading}
                            onChange={(e) =>
                              handleToggle(
                                "emailNotifications",
                                e.target.checked,
                                setEmailNotifications,
                                ["settings", "emailNotifications"]
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </label>
                      </div>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Theme Preferences
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Sound Settings
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </section>

                  {/* Support & Help */}
                  <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">
                          help
                        </span>
                        <h2 className="text-xl font-bold">Support & Help</h2>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            FAQs
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Contact Support
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Terms of Service
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                      <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Privacy Policy
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </section>

                  {/* Save Changes Button */}
                  <div className="flex justify-center gap-6 ">
                    {(hasUnsavedChanges || saveSuccess || saveError) && (
                      <section className="flex justify-center">
                        <button
                          onClick={handleSaveAllChanges}
                          disabled={passwordLoading || saveSuccess || saveError}
                          className={`h-full w-full px-8 rounded-full text-white font-semibold shadow-soft hover:shadow-lifted transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 group disabled:cursor-not-allowed ${
                            saveSuccess
                              ? "bg-green-500 shadow-green-500/40 scale-105"
                              : saveError
                              ? "bg-red-500 shadow-red-500/40 scale-105"
                              : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-primary/40 dark:shadow-glow active:scale-95 focus:ring-primary disabled:opacity-50 disabled:transform-none"
                          }`}
                        >
                          {passwordLoading ? (
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
                          ) : saveSuccess ? (
                            <>
                              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                                check_circle
                              </span>
                              <span>Saved</span>
                            </>
                          ) : saveError ? (
                            <>
                              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                                error
                              </span>
                              <span>Error</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                                save
                              </span>
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </section>
                    )}

                    {/* Logout Button */}
                    <section className="flex justify-center">
                      <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-soft hover:shadow-lifted transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2 group"
                      >
                        <span className="material-symbols-outlined text-xl transition-transform">
                          logout
                        </span>
                        <span>Logout</span>
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
