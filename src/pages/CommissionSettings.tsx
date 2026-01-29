import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { Percent, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';

interface CommissionSettings {
  _id: string;
  coordinatorPercentage: number;
  districtCoordinatorPercentage: number;
  teamLeaderPercentage: number;
  fieldEmployeePercentage: number;
  updatedBy?: {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
  updatedByModel?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionSettings() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    coordinatorPercentage: 40,
    districtCoordinatorPercentage: 10,
    teamLeaderPercentage: 10,
    fieldEmployeePercentage: 10,
  });

  const [errors, setErrors] = useState<{
    coordinatorPercentage?: string;
    districtCoordinatorPercentage?: string;
    teamLeaderPercentage?: string;
    fieldEmployeePercentage?: string;
  }>({});

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getCommissionSettings(token);
      if (response.success) {
        setSettings(response.data);
        setHasExistingSettings(true);
        setFormData({
          coordinatorPercentage: response.data.coordinatorPercentage,
          districtCoordinatorPercentage: response.data.districtCoordinatorPercentage,
          teamLeaderPercentage: response.data.teamLeaderPercentage,
          fieldEmployeePercentage: response.data.fieldEmployeePercentage,
        });
      }
    } catch (error: any) {
      // If settings don't exist, that's okay - we'll show the create form
      if (error.message && error.message.includes('404')) {
        setHasExistingSettings(false);
      } else {
        showToast(error.message || 'Failed to fetch commission settings', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (formData.coordinatorPercentage < 0 || formData.coordinatorPercentage > 100) {
      newErrors.coordinatorPercentage = 'Percentage must be between 0 and 100';
    }

    if (formData.districtCoordinatorPercentage < 0 || formData.districtCoordinatorPercentage > 100) {
      newErrors.districtCoordinatorPercentage = 'Percentage must be between 0 and 100';
    }

    if (formData.teamLeaderPercentage < 0 || formData.teamLeaderPercentage > 100) {
      newErrors.teamLeaderPercentage = 'Percentage must be between 0 and 100';
    }

    if (formData.fieldEmployeePercentage < 0 || formData.fieldEmployeePercentage > 100) {
      newErrors.fieldEmployeePercentage = 'Percentage must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!validateForm()) {
      showToast('Please fix validation errors', 'error');
      return;
    }

    setSaving(true);
    try {
      let response;
      if (hasExistingSettings) {
        // Update existing settings
        response = await api.updateCommissionSettings(
          token,
          formData.coordinatorPercentage,
          formData.districtCoordinatorPercentage,
          formData.teamLeaderPercentage,
          formData.fieldEmployeePercentage
        );
      } else {
        // Create new settings
        response = await api.createCommissionSettings(
          token,
          formData.coordinatorPercentage,
          formData.districtCoordinatorPercentage,
          formData.teamLeaderPercentage,
          formData.fieldEmployeePercentage
        );
      }

      if (response.success) {
        showToast(
          hasExistingSettings 
            ? 'Commission settings updated successfully!' 
            : 'Commission settings created successfully!',
          'success'
        );
        await fetchSettings();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to save commission settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: numValue,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Commission Settings</h1>
          <p className="text-gray-600">
            Configure commission percentages for the referral system
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {settings && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Current Active Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-700 font-medium">Coordinator</p>
                  <p className="text-2xl font-bold text-green-800">{settings.coordinatorPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">District Coordinator</p>
                  <p className="text-2xl font-bold text-green-800">{settings.districtCoordinatorPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Team Leader</p>
                  <p className="text-2xl font-bold text-green-800">{settings.teamLeaderPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Field Employee</p>
                  <p className="text-2xl font-bold text-green-800">{settings.fieldEmployeePercentage}%</p>
                </div>
              </div>
              {settings.updatedBy && (
                <p className="text-sm text-green-600">
                  Last updated by: {settings.updatedBy.firstName} {settings.updatedBy.lastName} ({settings.updatedBy.userId}) on{' '}
                  {new Date(settings.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-3 rounded-lg">
            <Percent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {hasExistingSettings ? 'Update Commission Settings' : 'Create Commission Settings'}
            </h2>
            <p className="text-sm text-gray-600">
              {hasExistingSettings 
                ? 'Update the commission percentages. Previous settings will be deactivated and new settings will be created.'
                : 'Set the initial commission percentages for each role in the referral system.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coordinator Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.coordinatorPercentage}
                  onChange={(e) => handleInputChange('coordinatorPercentage', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition ${
                    errors.coordinatorPercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              {errors.coordinatorPercentage && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.coordinatorPercentage}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Commission percentage for Coordinators (0-100)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                District Coordinator Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.districtCoordinatorPercentage}
                  onChange={(e) => handleInputChange('districtCoordinatorPercentage', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition ${
                    errors.districtCoordinatorPercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              {errors.districtCoordinatorPercentage && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.districtCoordinatorPercentage}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Commission percentage for District Coordinators (0-100)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Team Leader Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.teamLeaderPercentage}
                  onChange={(e) => handleInputChange('teamLeaderPercentage', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition ${
                    errors.teamLeaderPercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              {errors.teamLeaderPercentage && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.teamLeaderPercentage}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Commission percentage for Team Leaders (0-100)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Field Employee Percentage <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.fieldEmployeePercentage}
                  onChange={(e) => handleInputChange('fieldEmployeePercentage', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition ${
                    errors.fieldEmployeePercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
              </div>
              {errors.fieldEmployeePercentage && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fieldEmployeePercentage}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Commission percentage for Field Employees (0-100)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading || saving}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {hasExistingSettings ? 'Update Settings' : 'Create Settings'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800 mb-1">Important Notes</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>All percentages must be between 0 and 100</li>
              <li>When updating settings, previous settings are deactivated and new settings are created (maintains history)</li>
              <li>Changes take effect immediately for new referrals</li>
              <li>Only Super Admins can modify commission settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
