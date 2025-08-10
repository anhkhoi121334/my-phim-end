'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSave, FaUndo, FaCog, FaGlobe, FaDatabase, FaShieldAlt, FaBell, FaPalette, FaUpload, FaImage } from 'react-icons/fa';

interface Settings {
  site: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    language: string;
    timezone: string;
  };
  api: {
    phimapiUrl: string;
    tmdbApiKey: string;
    enableCaching: boolean;
    cacheDuration: number;
  };
  security: {
    enableRegistration: boolean;
    requireEmailVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    adminEmail: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    enableAnimations: boolean;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    site: {
      name: 'MyPhim',
      description: 'Website xem phim trực tuyến hàng đầu Việt Nam',
      logo: '/myphim-logo.svg',
      favicon: '/favicon.ico',
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh'
    },
    api: {
      phimapiUrl: 'https://phimapi.com',
      tmdbApiKey: '',
      enableCaching: true,
      cacheDuration: 3600
    },
    security: {
      enableRegistration: true,
      requireEmailVerification: false,
      maxLoginAttempts: 5,
      sessionTimeout: 24
    },
    notifications: {
      enableEmailNotifications: false,
      enablePushNotifications: true,
      adminEmail: 'admin@myphim.com'
    },
    appearance: {
      theme: 'dark',
      primaryColor: '#3b82f6',
      enableAnimations: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('site');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'site', name: 'Site Settings', icon: <FaGlobe /> },
    { id: 'api', name: 'API Configuration', icon: <FaDatabase /> },
    { id: 'security', name: 'Security', icon: <FaShieldAlt /> },
    { id: 'notifications', name: 'Notifications', icon: <FaBell /> },
    { id: 'appearance', name: 'Appearance', icon: <FaPalette /> }
  ];

  useEffect(() => {
    // Load settings from API
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (data.success) {
          setSettings(data.settings);
        } else {
          setError(data.error || 'Failed to load settings');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (data.success) {
          setSettings(data.settings);
          setError(null);
        } else {
          setError(data.error || 'Failed to reset settings');
        }
      } catch (err) {
        console.error('Error resetting settings:', err);
        setError('Failed to reset settings');
      }
    }
  };

  const updateSetting = (section: keyof Settings, key: string, value: any) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
      
      // Apply theme changes immediately
      if (section === 'appearance' && key === 'theme') {
        const html = document.documentElement;
        if (value === 'dark') {
          html.classList.add('dark');
          html.classList.remove('light');
        } else if (value === 'light') {
          html.classList.add('light');
          html.classList.remove('dark');
        } else if (value === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            html.classList.add('dark');
            html.classList.remove('light');
          } else {
            html.classList.add('light');
            html.classList.remove('dark');
          }
        }
      }
      
      // Apply primary color changes immediately
      if (section === 'appearance' && key === 'primaryColor') {
        document.documentElement.style.setProperty('--primary-color', value);
      }
      
      // Apply animation changes immediately
      if (section === 'appearance' && key === 'enableAnimations') {
        const html = document.documentElement;
        if (!value) {
          html.classList.add('no-animations');
        } else {
          html.classList.remove('no-animations');
        }
      }
      
      return newSettings;
    });
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingFavicon(true);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        updateSetting('site', type === 'logo' ? 'logo' : 'favicon', data.url);
        setError(null);
      } else {
        setError(data.error || `Failed to upload ${type}`);
      }
    } catch (err) {
      console.error(`Error uploading ${type}:`, err);
      setError(`Failed to upload ${type}`);
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingFavicon(false);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'logo');
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'favicon');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your application configuration</p>
      </div>

      {/* Success/Error messages */}
      {isSaved && (
        <div className="mb-6 p-4 bg-green-600 text-white rounded-lg flex items-center">
          <FaSave className="mr-2" />
          Settings saved successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-600 text-white rounded-lg flex items-center">
          <FaCog className="mr-2" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <FaSave className="mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <FaUndo className="mr-2" />
          Reset to Default
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-zinc-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-zinc-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-zinc-800 rounded-lg p-6">
        {activeTab === 'site' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Site Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site.name}
                  onChange={(e) => updateSetting('site', 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={settings.site.language}
                  onChange={(e) => updateSetting('site', 'language', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.site.description}
                  onChange={(e) => updateSetting('site', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Logo
                 </label>
                 <div className="flex items-center space-x-3">
                   <div className="flex-1">
                     <input
                       type="text"
                       value={settings.site.logo}
                       onChange={(e) => updateSetting('site', 'logo', e.target.value)}
                       className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                       placeholder="Logo URL"
                     />
                   </div>
                   <button
                     onClick={() => logoFileRef.current?.click()}
                     disabled={uploadingLogo}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center"
                   >
                     <FaUpload className="mr-2" />
                     {uploadingLogo ? 'Uploading...' : 'Upload'}
                   </button>
                   <input
                     ref={logoFileRef}
                     type="file"
                     accept="image/*"
                     onChange={handleLogoUpload}
                     className="hidden"
                   />
                 </div>
                 {settings.site.logo && (
                   <div className="mt-2 flex items-center space-x-2">
                     <FaImage className="text-gray-400" />
                     <img 
                       src={settings.site.logo} 
                       alt="Logo preview" 
                       className="w-8 h-8 object-contain border border-gray-600 rounded"
                     />
                   </div>
                 )}
               </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Favicon
                 </label>
                 <div className="flex items-center space-x-3">
                   <div className="flex-1">
                     <input
                       type="text"
                       value={settings.site.favicon}
                       onChange={(e) => updateSetting('site', 'favicon', e.target.value)}
                       className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                       placeholder="Favicon URL"
                     />
                   </div>
                   <button
                     onClick={() => faviconFileRef.current?.click()}
                     disabled={uploadingFavicon}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors flex items-center"
                   >
                     <FaUpload className="mr-2" />
                     {uploadingFavicon ? 'Uploading...' : 'Upload'}
                   </button>
                   <input
                     ref={faviconFileRef}
                     type="file"
                     accept="image/*"
                     onChange={handleFaviconUpload}
                     className="hidden"
                   />
                 </div>
                 {settings.site.favicon && (
                   <div className="mt-2 flex items-center space-x-2">
                     <FaImage className="text-gray-400" />
                     <img 
                       src={settings.site.favicon} 
                       alt="Favicon preview" 
                       className="w-6 h-6 object-contain border border-gray-600 rounded"
                     />
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">API Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PhimAPI URL
                </label>
                <input
                  type="url"
                  value={settings.api.phimapiUrl}
                  onChange={(e) => updateSetting('api', 'phimapiUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  TMDB API Key
                </label>
                <input
                  type="password"
                  value={settings.api.tmdbApiKey}
                  onChange={(e) => updateSetting('api', 'tmdbApiKey', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableCaching"
                  checked={settings.api.enableCaching}
                  onChange={(e) => updateSetting('api', 'enableCaching', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enableCaching" className="ml-2 text-sm text-gray-300">
                  Enable Caching
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cache Duration (seconds)
                </label>
                <input
                  type="number"
                  value={settings.api.cacheDuration}
                  onChange={(e) => updateSetting('api', 'cacheDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableRegistration"
                  checked={settings.security.enableRegistration}
                  onChange={(e) => updateSetting('security', 'enableRegistration', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enableRegistration" className="ml-2 text-sm text-gray-300">
                  Enable User Registration
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={settings.security.requireEmailVerification}
                  onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                />
                <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-300">
                  Require Email Verification
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableEmailNotifications"
                  checked={settings.notifications.enableEmailNotifications}
                  onChange={(e) => updateSetting('notifications', 'enableEmailNotifications', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enableEmailNotifications" className="ml-2 text-sm text-gray-300">
                  Enable Email Notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enablePushNotifications"
                  checked={settings.notifications.enablePushNotifications}
                  onChange={(e) => updateSetting('notifications', 'enablePushNotifications', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enablePushNotifications" className="ml-2 text-sm text-gray-300">
                  Enable Push Notifications
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={settings.notifications.adminEmail}
                  onChange={(e) => updateSetting('notifications', 'adminEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Appearance Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   Theme
                 </label>
                 <div className="flex gap-2 mb-2">
                   <button
                     onClick={() => updateSetting('appearance', 'theme', 'light')}
                     className={`px-4 py-2 rounded-md border-2 transition-colors ${
                       settings.appearance.theme === 'light'
                         ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                         : 'border-gray-600 bg-zinc-700 text-gray-300 hover:border-gray-500'
                     }`}
                   >
                     Light
                   </button>
                   <button
                     onClick={() => updateSetting('appearance', 'theme', 'dark')}
                     className={`px-4 py-2 rounded-md border-2 transition-colors ${
                       settings.appearance.theme === 'dark'
                         ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                         : 'border-gray-600 bg-zinc-700 text-gray-300 hover:border-gray-500'
                     }`}
                   >
                     Dark
                   </button>
                   <button
                     onClick={() => updateSetting('appearance', 'theme', 'auto')}
                     className={`px-4 py-2 rounded-md border-2 transition-colors ${
                       settings.appearance.theme === 'auto'
                         ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                         : 'border-gray-600 bg-zinc-700 text-gray-300 hover:border-gray-500'
                     }`}
                   >
                     Auto
                   </button>
                 </div>
                 <p className="text-xs text-gray-400">
                   Current theme: {settings.appearance.theme === 'auto' 
                     ? `Auto (${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'})`
                     : settings.appearance.theme
                   }
                 </p>
               </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={settings.appearance.primaryColor}
                  onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableAnimations"
                  checked={settings.appearance.enableAnimations}
                  onChange={(e) => updateSetting('appearance', 'enableAnimations', e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enableAnimations" className="ml-2 text-sm text-gray-300">
                  Enable Animations
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 