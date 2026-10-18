
import { useEffect, useState } from 'react';

const API = 'http://localhost:8080';

const initialProfile = { name: '', email: '', role: '' };

export default function Settings({ token, email, role }) {
  const [section, setSection] = useState('profile');

  const [profile, setProfile] = useState({
    ...initialProfile,
    email: email || '',
    role: role || '',
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('erp-dark-mode') === 'true'
  );

  const [compact, setCompact] = useState(
    () => localStorage.getItem('erp-compact-layout') === 'true'
  );

  function showMessage(text, error = false) {
    setMessage(text);
    setIsError(error);
  }

  // Apply appearance settings to the entire application.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('erp-dark-mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact-layout', compact);
    localStorage.setItem('erp-compact-layout', String(compact));
  }, [compact]);

  // Load the authenticated user's profile from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);

      try {
        const response = await fetch(`${API}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Could not load profile.');
        }

        if (!cancelled) {
          setProfile(data);
        }
      } catch (error) {
        if (!cancelled) {
          showMessage(error.message || 'Could not load profile.', true);
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    if (token) {
      loadProfile();
    } else {
      setProfileLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSaveProfile(event) {
    event.preventDefault();
    showMessage('');

    const name = profile.name.trim();

    if (!name || name.length > 100) {
      showMessage('Name must contain 1–100 characters.', true);
      return;
    }

    setProfileSaving(true);

    try {
      const response = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not update profile.');
      }

      setProfile((previous) => ({ ...previous, ...data }));
      showMessage(data.message || 'Profile updated successfully.');
    } catch (error) {
      showMessage(error.message || 'Could not update profile.', true);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    showMessage('');

    if (newPassword.length < 8) {
      showMessage('New password must contain at least 8 characters.', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match.', true);
      return;
    }

    if (currentPassword === newPassword) {
      showMessage('New password must differ from current password.', true);
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Unable to change password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage(data.message || 'Password changed successfully.');
    } catch (error) {
      showMessage(error.message || 'Unable to change password.', true);
    } finally {
      setPasswordSaving(false);
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
  ];

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  const labelClass = 'text-sm font-medium text-slate-700';

  return (
    <div className="erp-settings space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, security and workspace preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="h-fit space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSection(tab.id);
                showMessage('');
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                section === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {section === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Profile Settings
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update your account name and view account details.
                </p>
              </div>

              {profileLoading ? (
                <p className="text-sm text-slate-500">Loading profile...</p>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                      {(profile.name || profile.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {profile.name || 'User'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {profile.role || role || 'User'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div>
                      <label className={labelClass}>Full name</label>
                      <input
                        className={inputClass}
                        value={profile.name || ''}
                        maxLength={100}
                        required
                        onChange={(event) =>
                          setProfile((previous) => ({
                            ...previous,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Email address</label>
                      <input
                        className={inputClass}
                        type="email"
                        value={profile.email || email || ''}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Account role</label>
                      <input
                        className={inputClass}
                        value={profile.role || role || 'User'}
                        readOnly
                      />
                    </div>

                    {message && (
                      <p
                        role="status"
                        className={`rounded-xl p-3 text-sm ${
                          isError
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {profileSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {section === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Security Settings
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Change your password securely.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className={labelClass}>Current password</label>
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className={labelClass}>New password</label>
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm new password</label>
                  <input
                    className={inputClass}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>

                {message && (
                  <p
                    role="status"
                    className={`rounded-xl p-3 text-sm ${
                      isError
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {section === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Appearance
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Customize your workspace appearance.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-800">Dark mode</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Apply a dark theme across the application.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle dark mode"
                  aria-checked={darkMode}
                  onClick={() => setDarkMode((value) => !value)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    darkMode ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      darkMode ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-800">Compact layout</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Reduce spacing in the workspace.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-label="Toggle compact layout"
                  aria-checked={compact}
                  onClick={() => setCompact((value) => !value)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    compact ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      compact ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                These preferences are saved in this browser.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
