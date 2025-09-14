import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSettings } from '../../contexts/SettingsContext';
import axios from 'axios';

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    settings, 
    setSettings, 
    updateSetting, 
    updatePreference, 
    saveAllSettings, 
    loading 
  } = useSettings();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Settings are now managed by the SettingsContext
  // No need for duplicate fetching logic here

  const handleNotificationChange = async (type) => {
    try {
      setSaving(true);
      const newValue = !settings.notifications[type];
      
      const success = await updateSetting('notifications', type, newValue);
      
      if (success) {
        setSuccessMessage('Notification settings updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update notification settings');
        setTimeout(() => setError(null), 3000);
      }
      setSaving(false);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update notification settings');
      setTimeout(() => setError(null), 3000);
      setSaving(false);
    }
  };

  const handlePrivacyChange = async (type, value) => {
    try {
      setSaving(true);
      const newValue = value !== undefined ? value : !settings.privacy[type];
        
      const success = await updateSetting('privacy', type, newValue);
      
      if (success) {
        setSuccessMessage('Privacy settings updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update privacy settings');
        setTimeout(() => setError(null), 3000);
      }
      setSaving(false);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setError('Failed to update privacy settings');
      setTimeout(() => setError(null), 3000);
      setSaving(false);
    }
  };

  const handlePreferenceChange = async (type, value) => {
    try {
      setSaving(true);
      
      const success = await updatePreference(type, value);
      
      if (success) {
        setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} updated to ${value}!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update preferences');
        setTimeout(() => setError(null), 3000);
      }
      setSaving(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences');
      setTimeout(() => setError(null), 3000);
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const success = await saveAllSettings(settings);
      if (success) {
        setSuccessMessage('All settings saved successfully!');
        setError(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to save settings');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Error saving all settings:', error);
      setError('Failed to save settings');
      setTimeout(() => setError(null), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            Loading settings...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow relative overflow-y-auto">
        <div className="absolute inset-0 z-0">
          <Image
            src="/neon-back.jpg"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            quality={100}
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-6 shadow-lg max-w-4xl mx-auto border border-white border-opacity-30">
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-white p-4 rounded-lg mb-6 animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {successMessage}
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6 animate-fade-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                {error}
              </div>
            </div>
          )}

            {/* Notifications Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-white text-opacity-70">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4B003B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B003B]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Push Notifications</h3>
                    <p className="text-sm text-white text-opacity-70">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4B003B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B003B]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Marketing Emails</h3>
                    <p className="text-sm text-white text-opacity-70">Receive marketing and promotional emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.marketing}
                      onChange={() => handleNotificationChange('marketing')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4B003B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B003B]"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Privacy Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Privacy</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Profile Visibility</h3>
                    <p className="text-sm text-white text-opacity-70">Control who can see your profile</p>
                  </div>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="p-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-[#4B003B] focus:border-transparent text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Show Email</h3>
                    <p className="text-sm text-white text-opacity-70">Display your email on profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.privacy.showEmail}
                      onChange={() => handlePrivacyChange('showEmail')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4B003B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B003B]"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Preferences Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Language</h3>
                    <p className="text-sm text-white text-opacity-70">Select your preferred language</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="p-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-[#4B003B] focus:border-transparent text-white"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Currency</h3>
                    <p className="text-sm text-white text-opacity-70">Select your preferred currency</p>
                  </div>
                  <select
                    value={settings.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="p-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-[#4B003B] focus:border-transparent text-white"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-30">
                  <div>
                    <h3 className="font-medium text-white">Theme</h3>
                    <p className="text-sm text-white text-opacity-70">Choose your preferred theme</p>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    className="p-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-[#4B003B] focus:border-transparent text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                className={`px-6 py-2 rounded-lg transition-colors ${
                  saving 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-[#4B003B] hover:bg-[#9b0079]'
                } text-white`} 
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage; 