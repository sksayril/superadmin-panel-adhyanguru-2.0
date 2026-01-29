import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Palette, Moon, Sun, Droplet } from 'lucide-react';
import { useToast } from '../components/ToastContainer';

export default function Settings() {
  const { theme, colors, setTheme } = useTheme();
  const { showToast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const themes = [
    { id: 'light' as const, name: 'Light', icon: Sun, description: 'Clean and bright' },
    { id: 'dark' as const, name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'blue' as const, name: 'Blue', icon: Droplet, description: 'Professional blue' },
    { id: 'green' as const, name: 'Green', icon: Droplet, description: 'Natural green' },
    { id: 'purple' as const, name: 'Purple', icon: Droplet, description: 'Creative purple' },
    { id: 'orange' as const, name: 'Orange', icon: Droplet, description: 'Energetic orange' },
  ];

  const handleThemeChange = (newTheme: typeof theme) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    showToast(`Theme changed to ${themes.find(t => t.id === newTheme)?.name}`, 'success');
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your application appearance and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-3 rounded-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Theme Customization</h2>
            <p className="text-sm text-gray-600">Choose a color theme for your application</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = selectedTheme === themeOption.id;
            const themeColors = {
              light: { bg: '#ffffff', border: '#e2e8f0', text: '#1e293b' },
              dark: { bg: '#1e293b', border: '#334155', text: '#f1f5f9' },
              blue: { bg: '#1e3a8a', border: '#3b82f6', text: '#dbeafe' },
              green: { bg: '#065f46', border: '#10b981', text: '#d1fae5' },
              purple: { bg: '#5b21b6', border: '#8b5cf6', text: '#e9d5ff' },
              orange: { bg: '#92400e', border: '#f59e0b', text: '#fef3c7' },
            }[themeOption.id];

            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                  isSelected
                    ? 'border-sky-500 shadow-md ring-2 ring-sky-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundColor: themeColors.bg,
                  borderColor: isSelected ? themeColors.border : undefined,
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-sky-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: themeColors.bg === '#ffffff' ? '#f1f5f9' : themeColors.bg,
                    }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: themeColors.text }}
                    />
                  </div>
                  <div className="text-center">
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: themeColors.text }}
                    >
                      {themeOption.name}
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: themeColors.text, opacity: 0.7 }}
                    >
                      {themeOption.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Theme Preview</h2>
            <p className="text-sm text-gray-600">See how your selected theme looks</p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h3
              className="font-semibold mb-2"
              style={{ color: colors.text }}
            >
              Sample Card
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: colors.textSecondary }}
            >
              This is how text appears in your selected theme. The colors adapt automatically to provide the best reading experience.
            </p>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: colors.primary,
                color: '#ffffff',
              }}
            >
              Primary Button
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <p className="text-sm font-medium">Primary Color</p>
              <p className="text-xs mt-1 opacity-90">{colors.primary}</p>
            </div>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: colors.secondary, color: '#ffffff' }}
            >
              <p className="text-sm font-medium">Secondary Color</p>
              <p className="text-xs mt-1 opacity-90">{colors.secondary}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <SettingsIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-1">Theme Information</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Your theme preference is saved automatically</li>
              <li>Theme changes apply immediately across all pages</li>
              <li>Sidebar, pages, and components adapt to your selected theme</li>
              <li>Dark mode reduces eye strain in low-light conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
