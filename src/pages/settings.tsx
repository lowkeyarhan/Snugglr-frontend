import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { Toggle } from "../components/ui/Toggle";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { validatePassword } from "../utils/validation";

// Mock API calls (keeping existing logic)
const updateUserSettings = async (_data: any, _token: string) => {
  return { success: true };
};

const changePasswordApi = async (_data: any, _token: string) => {
  return { success: true };
};

export default function Settings() {
  const { user, logout } = useAuth();
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showActiveStatus, setShowActiveStatus] = useState(true);
  const [hideDP, setHideDP] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Change password state
  const [showChangePasswordSection, setShowChangePasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    if (user) {
      setPushNotifications(!!user?.settings?.pushNotifications);
      setEmailNotifications(!!user?.settings?.emailNotifications);
      setShowActiveStatus(!!user?.privacy?.showActiveStatus);
      setHideDP(!!user?.privacy?.hideDisplayPicture);
      setLoading(false);
    } else {
        // Fallback or wait for user load
        setLoading(false);
    }
  }, [user]);

  // Optimistically update localStorage user object
  const updateUserInStorage = (path: string[], value: any) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const userObj = JSON.parse(userStr);
      let cursor = userObj;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        cursor[key] = cursor[key] ?? {};
        cursor = cursor[key];
      }
      cursor[path[path.length - 1]] = value;
      localStorage.setItem("user", JSON.stringify(userObj));
    } catch {
      // ignore
    }
  };

  const handleToggle = async (
    key: string,
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
      setter(prev);
    }
  };

  const handleSaveAllChanges = async () => {
    setPasswordError("");

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        setPasswordError("Current password is required");
        return;
      }
      if (!validatePassword(newPassword)) {
        setPasswordError("New password must be at least 6 characters long");
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }
      if (currentPassword === newPassword) {
        setPasswordError("New password must be different from current password");
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

      if (currentPassword && newPassword && confirmPassword) {
        await changePasswordApi({ currentPassword, newPassword }, token);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePasswordSection(false);
      }

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
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to save changes");
      setSaveError(true);
      setSaveSuccess(false);
      setTimeout(() => setSaveError(false), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="flex h-full w-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto h-screen">
          <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-4 w-full">
            <div className="w-full max-w-3xl mx-auto space-y-8">
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
                    <div className="w-full flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          Email
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowChangePasswordSection(!showChangePasswordSection)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Change Password
                      </p>
                      <span
                        className={`material-symbols-outlined text-slate-400 group-hover:text-primary transition-all ${
                          showChangePasswordSection ? "rotate-90" : ""
                        }`}
                      >
                        chevron_right
                      </span>
                    </button>

                    {showChangePasswordSection && (
                      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        {passwordError && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                            {passwordError}
                          </div>
                        )}
                        <Input
                          type="password"
                          label="Current Password"
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Input
                          type="password"
                          label="New Password"
                          placeholder="Enter new password (min 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                          type="password"
                          label="Confirm Password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    )}
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
                    <Toggle
                      label="Show Active Status"
                      subLabel="Let others see when you're online"
                      checked={showActiveStatus}
                      onChange={(v) =>
                        handleToggle("showActiveStatus", v, setShowActiveStatus, ["privacy", "showActiveStatus"])
                      }
                      disabled={loading}
                    />
                    <Toggle
                      label="Hide Display Picture"
                      subLabel="Keep your profile photo private"
                      checked={hideDP}
                      onChange={(v) =>
                        handleToggle("hideDisplayPicture", v, setHideDP, ["privacy", "hideDisplayPicture"])
                      }
                      disabled={loading}
                    />
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
                    <Toggle
                      label="Push Notifications"
                      subLabel="Get notified about messages and matches"
                      checked={pushNotifications}
                      onChange={(v) =>
                        handleToggle("pushNotifications", v, setPushNotifications, ["settings", "pushNotifications"])
                      }
                      disabled={loading}
                    />
                    <Toggle
                      label="Email Notifications"
                      subLabel="Receive weekly digest emails"
                      checked={emailNotifications}
                      onChange={(v) =>
                        handleToggle("emailNotifications", v, setEmailNotifications, ["settings", "emailNotifications"])
                      }
                      disabled={loading}
                    />
                  </div>
                </section>

                <div className="flex justify-center gap-6 pb-8">
                  <Button
                    onClick={handleSaveAllChanges}
                    isLoading={passwordLoading}
                    disabled={saveSuccess || saveError}
                    variant={saveSuccess ? "primary" : saveError ? "danger" : "primary"}
                    className={saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}
                    icon={saveSuccess ? "check_circle" : saveError ? "error" : "save"}
                  >
                    {saveSuccess ? "Saved" : saveError ? "Error" : "Save Changes"}
                  </Button>

                  <Button
                    onClick={logout}
                    variant="danger"
                    icon="logout"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
