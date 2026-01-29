import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { FolderTree, Plus, Edit, Trash2, Eye, Search, X, Image as ImageIcon, CreditCard } from 'lucide-react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

interface MainCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdBy?: {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SubCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  mainCategory: {
    _id: string;
    name: string;
    description?: string;
    image?: string;
  };
  isActive: boolean;
  createdBy?: {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

type TabType = 'main' | 'sub';

export default function Categories() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [loading, setLoading] = useState(false);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  
  // Modals
  const [showCreateMain, setShowCreateMain] = useState(false);
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [showEditMain, setShowEditMain] = useState(false);
  const [showEditSub, setShowEditSub] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Selected items
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'main' | 'sub'; id: string; name: string } | null>(null);
  const [showSubCategoriesModal, setShowSubCategoriesModal] = useState(false);
  const [selectedMainForSubs, setSelectedMainForSubs] = useState<MainCategory | null>(null);
  const [subCategoriesForMain, setSubCategoriesForMain] = useState<SubCategory[]>([]);
  
  // Plan Modals
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateMultiplePlans, setShowCreateMultiplePlans] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [showDeletePlanConfirm, setShowDeletePlanConfirm] = useState(false);
  const [selectedSubCategoryForPlans, setSelectedSubCategoryForPlans] = useState<SubCategory | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [deletePlanTarget, setDeletePlanTarget] = useState<{ id: string; duration: string } | null>(null);
  
  // Plan Forms
  const [planForm, setPlanForm] = useState({
    duration: '1_MONTH' as '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR',
    amount: 0,
    description: '',
    isActive: true,
  });
  
  const [multiplePlansForm, setMultiplePlansForm] = useState({
    plans: [
      { duration: '1_MONTH' as const, amount: 0, description: '' },
      { duration: '3_MONTHS' as const, amount: 0, description: '' },
      { duration: '6_MONTHS' as const, amount: 0, description: '' },
      { duration: '1_YEAR' as const, amount: 0, description: '' },
    ],
  });
  
  // Forms
  const [mainCategoryForm, setMainCategoryForm] = useState({
    name: '',
    description: '',
    image: null as File | null,
    isActive: true,
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    description: '',
    mainCategoryId: '',
    image: null as File | null,
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      fetchMainCategories();
      fetchSubCategories();
    }
  }, [token, filterActive]);

  const fetchMainCategories = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllMainCategories(token, filterActive);
      if (response.success) {
        setMainCategories(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch main categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllSubCategories(token, undefined, filterActive);
      if (response.success) {
        setSubCategories(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch sub categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMainCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.createMainCategory(
        token,
        mainCategoryForm.name,
        mainCategoryForm.description || undefined,
        mainCategoryForm.image || undefined
      );
      if (response.success) {
        showToast('Main category created successfully!', 'success');
        setShowCreateMain(false);
        resetMainCategoryForm();
        fetchMainCategories();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create main category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!subCategoryForm.mainCategoryId) {
      showToast('Please select a main category', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await api.createSubCategory(
        token,
        subCategoryForm.name,
        subCategoryForm.mainCategoryId,
        subCategoryForm.description || undefined,
        subCategoryForm.image || undefined
      );
      if (response.success) {
        showToast('Sub category created successfully!', 'success');
        setShowCreateSub(false);
        resetSubCategoryForm();
        fetchSubCategories();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create sub category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMainCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedMainCategory) return;
    setLoading(true);
    try {
      const response = await api.updateMainCategory(
        token,
        selectedMainCategory._id,
        mainCategoryForm.name || undefined,
        mainCategoryForm.description !== undefined ? mainCategoryForm.description : undefined,
        mainCategoryForm.isActive,
        mainCategoryForm.image || undefined
      );
      if (response.success) {
        showToast('Main category updated successfully!', 'success');
        setShowEditMain(false);
        resetMainCategoryForm();
        setSelectedMainCategory(null);
        fetchMainCategories();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update main category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedSubCategory) return;
    setLoading(true);
    try {
      const response = await api.updateSubCategory(
        token,
        selectedSubCategory._id,
        subCategoryForm.name || undefined,
        subCategoryForm.description !== undefined ? subCategoryForm.description : undefined,
        subCategoryForm.mainCategoryId || undefined,
        subCategoryForm.isActive,
        subCategoryForm.image || undefined
      );
      if (response.success) {
        showToast('Sub category updated successfully!', 'success');
        setShowEditSub(false);
        resetSubCategoryForm();
        setSelectedSubCategory(null);
        fetchSubCategories();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update sub category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setLoading(true);
    try {
      if (deleteTarget.type === 'main') {
        await api.deleteMainCategory(token, deleteTarget.id);
        showToast('Main category deleted successfully!', 'success');
        fetchMainCategories();
      } else {
        await api.deleteSubCategory(token, deleteTarget.id);
        showToast('Sub category deleted successfully!', 'success');
        fetchSubCategories();
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error: any) {
      showToast(error.message || 'Failed to delete category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMain = (category: MainCategory) => {
    setSelectedMainCategory(category);
    setMainCategoryForm({
      name: category.name,
      description: category.description || '',
      image: null,
      isActive: category.isActive,
    });
    setShowEditMain(true);
  };

  const handleEditSub = (category: SubCategory) => {
    setSelectedSubCategory(category);
    setSubCategoryForm({
      name: category.name,
      description: category.description || '',
      mainCategoryId: category.mainCategory._id,
      image: null,
      isActive: category.isActive,
    });
    setShowEditSub(true);
  };

  const handleViewDetails = async (type: 'main' | 'sub', id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      if (type === 'main') {
        const response = await api.getMainCategoryById(token, id);
        if (response.success) {
          setSelectedMainCategory(response.data);
          setShowDetails(true);
        }
      } else {
        const response = await api.getSubCategoryById(token, id);
        if (response.success) {
          setSelectedSubCategory(response.data);
          setShowDetails(true);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch category details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubCategories = async (mainCategory: MainCategory) => {
    if (!token) return;
    setSelectedMainForSubs(mainCategory);
    setLoading(true);
    try {
      const response = await api.getAllSubCategories(token, mainCategory._id);
      if (response.success) {
        setSubCategoriesForMain(response.data);
        setShowSubCategoriesModal(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch sub categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlans = async (subCategory: SubCategory) => {
    if (!token) return;
    setSelectedSubCategoryForPlans(subCategory);
    setLoading(true);
    try {
      const response = await api.getPlansBySubCategory(token, subCategory._id);
      if (response.success) {
        setPlans(response.data);
        setShowPlansModal(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedSubCategoryForPlans) return;
    setLoading(true);
    try {
      const response = await api.createPlan(
        token,
        selectedSubCategoryForPlans._id,
        planForm.duration,
        planForm.amount,
        planForm.description || undefined
      );
      if (response.success) {
        showToast('Plan created successfully!', 'success');
        setShowCreatePlan(false);
        resetPlanForm();
        if (selectedSubCategoryForPlans) {
          handleViewPlans(selectedSubCategoryForPlans);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultiplePlans = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedSubCategoryForPlans) return;
    setLoading(true);
    try {
      const response = await api.createMultiplePlans(
        token,
        selectedSubCategoryForPlans._id,
        multiplePlansForm.plans
      );
      if (response.success) {
        showToast(`Successfully created ${response.count} plan(s)!`, 'success');
        setShowCreateMultiplePlans(false);
        resetMultiplePlansForm();
        if (selectedSubCategoryForPlans) {
          handleViewPlans(selectedSubCategoryForPlans);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPlan) return;
    setLoading(true);
    try {
      const response = await api.updatePlan(
        token,
        selectedPlan._id,
        planForm.duration,
        planForm.amount,
        planForm.description !== undefined ? planForm.description : undefined,
        planForm.isActive
      );
      if (response.success) {
        showToast('Plan updated successfully!', 'success');
        setShowEditPlan(false);
        resetPlanForm();
        setSelectedPlan(null);
        if (selectedSubCategoryForPlans) {
          handleViewPlans(selectedSubCategoryForPlans);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!token || !deletePlanTarget) return;
    setLoading(true);
    try {
      await api.deletePlan(token, deletePlanTarget.id);
      showToast('Plan deleted successfully!', 'success');
      setShowDeletePlanConfirm(false);
      setDeletePlanTarget(null);
      if (selectedSubCategoryForPlans) {
        handleViewPlans(selectedSubCategoryForPlans);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to delete plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPlanForm({
      duration: plan.duration as '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR',
      amount: plan.amount,
      description: plan.description || '',
      isActive: plan.isActive,
    });
    setShowEditPlan(true);
  };

  const resetPlanForm = () => {
    setPlanForm({
      duration: '1_MONTH',
      amount: 0,
      description: '',
      isActive: true,
    });
  };

  const resetMultiplePlansForm = () => {
    setMultiplePlansForm({
      plans: [
        { duration: '1_MONTH', amount: 0, description: '' },
        { duration: '3_MONTHS', amount: 0, description: '' },
        { duration: '6_MONTHS', amount: 0, description: '' },
        { duration: '1_YEAR', amount: 0, description: '' },
      ],
    });
  };

  const getDurationLabel = (duration: string) => {
    const labels: { [key: string]: string } = {
      '1_MONTH': '1 Month',
      '3_MONTHS': '3 Months',
      '6_MONTHS': '6 Months',
      '1_YEAR': '1 Year',
    };
    return labels[duration] || duration;
  };

  // Handle ESC key to close sub categories modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSubCategoriesModal) {
        setShowSubCategoriesModal(false);
        setSelectedMainForSubs(null);
        setSubCategoriesForMain([]);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showSubCategoriesModal]);

  const resetMainCategoryForm = () => {
    setMainCategoryForm({
      name: '',
      description: '',
      image: null,
      isActive: true,
    });
  };

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: '',
      description: '',
      mainCategoryId: '',
      image: null,
      isActive: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast('Please upload a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      if (isMain) {
        setMainCategoryForm({ ...mainCategoryForm, image: file });
      } else {
        setSubCategoryForm({ ...subCategoryForm, image: file });
      }
      showToast('Image selected successfully', 'success');
    }
  };

  const filteredMainCategories = mainCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSubCategories = subCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cat.mainCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Categories Management</h1>
          <p className="text-gray-600">Manage main categories and sub categories</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'main' ? (
            <button
              onClick={() => {
                resetMainCategoryForm();
                setShowCreateMain(true);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Create Main Category
            </button>
          ) : (
            <button
              onClick={() => {
                resetSubCategoryForm();
                setShowCreateSub(true);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              Create Sub Category
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('main')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'main'
                ? 'bg-sky-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Main Categories
          </button>
          <button
            onClick={() => setActiveTab('sub')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sub'
                ? 'bg-sky-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sub Categories
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'main' ? 'main' : 'sub'} categories...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterActive === undefined ? 'all' : filterActive.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActive(value === 'all' ? undefined : value === 'true');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Categories List */}
      {activeTab === 'main' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredMainCategories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No main categories found
            </div>
          ) : (
            filteredMainCategories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {category.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        category.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                  )}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewSubCategories(category)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      <FolderTree className="w-4 h-4" />
                      View Sub Categories
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails('main', category._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditMain(category)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget({ type: 'main', id: category._id, name: category.name });
                          setShowDeleteConfirm(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub Categories List */}
      {activeTab === 'sub' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-sky-400 to-sky-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Image</th>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Main Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Description</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-6 py-4">
                        <Skeleton variant="rectangular" width={60} height={60} className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton variant="text" width={150} height={20} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton variant="text" width={120} height={20} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton variant="text" width={200} height={20} />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredSubCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No sub categories found
                    </td>
                  </tr>
                ) : (
                  filteredSubCategories.map((category) => (
                    <tr key={category._id} className="border-b border-gray-100 hover:bg-sky-50 transition">
                      <td className="px-6 py-4">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{category.name}</td>
                      <td className="px-6 py-4 text-gray-600">{category.mainCategory.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            category.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewPlans(category)}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                            title="View Plans"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewDetails('sub', category._id)}
                            className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSub(category)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'sub', id: category._id, name: category.name });
                              setShowDeleteConfirm(true);
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Main Category Modal */}
      {showCreateMain && (
        <CategoryModal
          title="Create Main Category"
          form={mainCategoryForm}
          setForm={setMainCategoryForm}
          onSubmit={handleCreateMainCategory}
          onClose={() => {
            setShowCreateMain(false);
            resetMainCategoryForm();
          }}
          loading={loading}
          onFileChange={(e) => handleFileChange(e, true)}
          isMain={true}
        />
      )}

      {/* Edit Main Category Modal */}
      {showEditMain && selectedMainCategory && (
        <CategoryModal
          title="Edit Main Category"
          form={mainCategoryForm}
          setForm={setMainCategoryForm}
          onSubmit={handleUpdateMainCategory}
          onClose={() => {
            setShowEditMain(false);
            resetMainCategoryForm();
            setSelectedMainCategory(null);
          }}
          loading={loading}
          onFileChange={(e) => handleFileChange(e, true)}
          isMain={true}
          existingImage={selectedMainCategory.image}
        />
      )}

      {/* Create Sub Category Modal */}
      {showCreateSub && (
        <CategoryModal
          title="Create Sub Category"
          form={subCategoryForm}
          setForm={setSubCategoryForm}
          onSubmit={handleCreateSubCategory}
          onClose={() => {
            setShowCreateSub(false);
            resetSubCategoryForm();
          }}
          loading={loading}
          onFileChange={(e) => handleFileChange(e, false)}
          isMain={false}
          mainCategories={mainCategories}
        />
      )}

      {/* Edit Sub Category Modal */}
      {showEditSub && selectedSubCategory && (
        <CategoryModal
          title="Edit Sub Category"
          form={subCategoryForm}
          setForm={setSubCategoryForm}
          onSubmit={handleUpdateSubCategory}
          onClose={() => {
            setShowEditSub(false);
            resetSubCategoryForm();
            setSelectedSubCategory(null);
          }}
          loading={loading}
          onFileChange={(e) => handleFileChange(e, false)}
          isMain={false}
          mainCategories={mainCategories}
          existingImage={selectedSubCategory.image}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'main' ? 'Main' : 'Sub'} Category`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
      />

      {/* Details Modal */}
      {(showDetails && (selectedMainCategory || selectedSubCategory)) && (
        <CategoryDetailsModal
          mainCategory={selectedMainCategory}
          subCategory={selectedSubCategory}
          onClose={() => {
            setShowDetails(false);
            setSelectedMainCategory(null);
            setSelectedSubCategory(null);
          }}
        />
      )}

      {/* Plans Modal */}
      {showPlansModal && selectedSubCategoryForPlans && (
        <PlansModal
          subCategory={selectedSubCategoryForPlans}
          plans={plans}
          loading={loading}
          onClose={() => {
            setShowPlansModal(false);
            setSelectedSubCategoryForPlans(null);
            setPlans([]);
          }}
          onCreatePlan={() => {
            resetPlanForm();
            setShowCreatePlan(true);
          }}
          onCreateMultiplePlans={() => {
            resetMultiplePlansForm();
            setShowCreateMultiplePlans(true);
          }}
          onEditPlan={handleEditPlan}
          onDeletePlan={(plan) => {
            setDeletePlanTarget({ id: plan._id, duration: plan.duration });
            setShowDeletePlanConfirm(true);
          }}
          getDurationLabel={getDurationLabel}
        />
      )}

      {/* Create Plan Modal */}
      {showCreatePlan && selectedSubCategoryForPlans && (
        <PlanModal
          title="Create Plan"
          form={planForm}
          setForm={setPlanForm}
          onSubmit={handleCreatePlan}
          onClose={() => {
            setShowCreatePlan(false);
            resetPlanForm();
          }}
          loading={loading}
        />
      )}

      {/* Create Multiple Plans Modal */}
      {showCreateMultiplePlans && selectedSubCategoryForPlans && (
        <MultiplePlansModal
          form={multiplePlansForm}
          setForm={setMultiplePlansForm}
          onSubmit={handleCreateMultiplePlans}
          onClose={() => {
            setShowCreateMultiplePlans(false);
            resetMultiplePlansForm();
          }}
          loading={loading}
        />
      )}

      {/* Edit Plan Modal */}
      {showEditPlan && selectedPlan && (
        <PlanModal
          title="Edit Plan"
          form={planForm}
          setForm={setPlanForm}
          onSubmit={handleUpdatePlan}
          onClose={() => {
            setShowEditPlan(false);
            resetPlanForm();
            setSelectedPlan(null);
          }}
          loading={loading}
        />
      )}

      {/* Delete Plan Confirmation */}
      <ConfirmDialog
        isOpen={showDeletePlanConfirm}
        title="Delete Plan"
        message={`Are you sure you want to delete the ${deletePlanTarget ? getDurationLabel(deletePlanTarget.duration) : ''} plan? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeletePlan}
        onCancel={() => {
          setShowDeletePlanConfirm(false);
          setDeletePlanTarget(null);
        }}
      />

      {/* Sub Categories Modal */}
      {showSubCategoriesModal && selectedMainForSubs && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSubCategoriesModal(false);
              setSelectedMainForSubs(null);
              setSubCategoriesForMain([]);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Sub Categories under "{selectedMainForSubs.name}"
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {subCategoriesForMain.length} sub categor{subCategoriesForMain.length === 1 ? 'y' : 'ies'} found
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSubCategoriesModal(false);
                  setSelectedMainForSubs(null);
                  setSubCategoriesForMain([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : subCategoriesForMain.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No sub categories found</p>
                  <p className="text-sm mt-2">This main category doesn't have any sub categories yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subCategoriesForMain.map((subCategory) => (
                    <div
                      key={subCategory._id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {subCategory.image && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                              src={subCategory.image}
                              alt={subCategory.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {subCategory.name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${
                                subCategory.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {subCategory.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {subCategory.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {subCategory.description}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setShowSubCategoriesModal(false);
                                handleViewDetails('sub', subCategory._id);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setShowSubCategoriesModal(false);
                                handleEditSub(subCategory);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Category Modal Component
interface CategoryModalProps {
  title: string;
  form: {
    name: string;
    description: string;
    image: File | null;
    isActive: boolean;
    mainCategoryId?: string;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMain: boolean;
  mainCategories?: MainCategory[];
  existingImage?: string;
}

function CategoryModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  onFileChange,
  isMain,
  mainCategories = [],
  existingImage,
}: CategoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter category description..."
              />
            </div>
            {!isMain && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Category *</label>
                <select
                  required
                  value={form.mainCategoryId}
                  onChange={(e) => setForm({ ...form, mainCategoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>
              {existingImage && !form.image && (
                <div className="mb-2">
                  <img
                    src={existingImage}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={onFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700"
              />
              <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, or WebP. Max 5MB</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Plans Modal Component
interface PlansModalProps {
  subCategory: SubCategory;
  plans: any[];
  loading: boolean;
  onClose: () => void;
  onCreatePlan: () => void;
  onCreateMultiplePlans: () => void;
  onEditPlan: (plan: any) => void;
  onDeletePlan: (plan: any) => void;
  getDurationLabel: (duration: string) => string;
}

function PlansModal({
  subCategory,
  plans,
  loading,
  onClose,
  onCreatePlan,
  onCreateMultiplePlans,
  onEditPlan,
  onDeletePlan,
  getDurationLabel,
}: PlansModalProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Plans for "{subCategory.name}"
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {plans.length} plan{plans.length === 1 ? '' : 's'} found
            </p>
          </div>
          <div className="flex gap-2">
            {plans.length === 0 && (
              <>
                <button
                  onClick={onCreateMultiplePlans}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create All Plans
                </button>
                <button
                  onClick={onCreatePlan}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Plan
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No plans found</p>
              <p className="text-sm mt-2">This sub category doesn't have any plans yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded text-sm font-semibold">
                          {getDurationLabel(plan.duration)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            plan.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-gray-800">₹{plan.amount.toLocaleString()}</span>
                      </div>
                      {plan.description && (
                        <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditPlan(plan)}
                      className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDeletePlan(plan)}
                      className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Plan Modal Component
interface PlanModalProps {
  title: string;
  form: {
    duration: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR';
    amount: number;
    description: string;
    isActive: boolean;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
}

function PlanModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
}: PlanModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="1_MONTH">1 Month</option>
                <option value="3_MONTHS">3 Months</option>
                <option value="6_MONTHS">6 Months</option>
                <option value="1_YEAR">1 Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter plan description..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Multiple Plans Modal Component
interface MultiplePlansModalProps {
  form: {
    plans: Array<{
      duration: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR';
      amount: number;
      description: string;
    }>;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
}

function MultiplePlansModal({
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
}: MultiplePlansModalProps) {
  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...form.plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setForm({ ...form, plans: newPlans });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Create Multiple Plans</h2>
              <p className="text-gray-600 text-sm mt-1">Create all 4 plans (1 Month, 3 Months, 6 Months, 1 Year) at once</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-6">
            {form.plans.map((plan, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded text-sm font-semibold">
                    {plan.duration === '1_MONTH' ? '1 Month' :
                     plan.duration === '3_MONTHS' ? '3 Months' :
                     plan.duration === '6_MONTHS' ? '6 Months' : '1 Year'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={plan.amount}
                      onChange={(e) => updatePlan(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={plan.description}
                      onChange={(e) => updatePlan(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      placeholder="Plan description..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create All Plans'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Category Details Modal
interface CategoryDetailsModalProps {
  mainCategory: MainCategory | null;
  subCategory: SubCategory | null;
  onClose: () => void;
}

function CategoryDetailsModal({ mainCategory, subCategory, onClose }: CategoryDetailsModalProps) {
  const category = mainCategory || subCategory;
  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Category Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {(category as any).image && (
              <div className="flex justify-center">
                <img
                  src={(category as any).image}
                  alt={category.name}
                  className="w-48 h-48 object-cover rounded-lg border-4 border-sky-200"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-800 font-semibold">{category.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    category.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {category.description && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-800">{category.description}</p>
                </div>
              )}
              {subCategory && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Main Category</label>
                  <p className="text-gray-800 font-semibold">{subCategory.mainCategory.name}</p>
                </div>
              )}
              {category.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                  <p className="text-gray-800">
                    {category.createdBy.firstName} {category.createdBy.lastName}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-800">{new Date(category.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                <p className="text-gray-800">{new Date(category.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

