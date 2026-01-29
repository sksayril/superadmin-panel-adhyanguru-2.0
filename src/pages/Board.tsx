import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { GraduationCap, Plus, Edit, Trash2, Eye, Search, X } from 'lucide-react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

interface Board {
  _id: string;
  name: string;
  description?: string;
  code?: string;
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

export default function Board() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  
  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Selected items
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  
  // Form
  const [boardForm, setBoardForm] = useState({
    name: '',
    description: '',
    code: '',
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      fetchBoards();
    }
  }, [token, filterActive]);

  const fetchBoards = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getAllBoards(token, filterActive);
      if (response.success) {
        setBoards(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch boards', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.createBoard(
        token,
        boardForm.name,
        boardForm.description || undefined,
        boardForm.code || undefined
      );
      if (response.success) {
        showToast('Board created successfully!', 'success');
        setShowCreate(false);
        resetBoardForm();
        fetchBoards();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create board', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBoard) return;
    setLoading(true);
    try {
      const response = await api.updateBoard(
        token,
        selectedBoard._id,
        boardForm.name || undefined,
        boardForm.description !== undefined ? boardForm.description : undefined,
        boardForm.code !== undefined ? boardForm.code : undefined,
        boardForm.isActive
      );
      if (response.success) {
        showToast('Board updated successfully!', 'success');
        setShowEdit(false);
        resetBoardForm();
        setSelectedBoard(null);
        fetchBoards();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update board', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setLoading(true);
    try {
      await api.deleteBoard(token, deleteTarget.id);
      showToast('Board deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchBoards();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete board', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (board: Board) => {
    setSelectedBoard(board);
    setBoardForm({
      name: board.name,
      description: board.description || '',
      code: board.code || '',
      isActive: board.isActive,
    });
    setShowEdit(true);
  };

  const handleViewDetails = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getBoardById(token, id);
      if (response.success) {
        setSelectedBoard(response.data);
        setShowDetails(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch board details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetBoardForm = () => {
    setBoardForm({
      name: '',
      description: '',
      code: '',
      isActive: true,
    });
  };

  const filteredBoards = boards.filter(
    (board) =>
      board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (board.description && board.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (board.code && board.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Board Management</h1>
          <p className="text-gray-600">Manage educational boards (CBSE, ICSE, etc.)</p>
        </div>
        <button
          onClick={() => {
            resetBoardForm();
            setShowCreate(true);
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Create Board
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search boards..."
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

      {/* Boards List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-sky-400 to-sky-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Code</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Created By</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={150} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={100} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={200} height={20} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" width={120} height={20} />
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
              ) : filteredBoards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No boards found
                  </td>
                </tr>
              ) : (
                filteredBoards.map((board) => (
                  <tr key={board._id} className="border-b border-gray-100 hover:bg-sky-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">{board.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {board.code ? (
                        <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm font-medium">
                          {board.code}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {board.description ? (
                        <span className="line-clamp-1">{board.description}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          board.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {board.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {board.createdBy ? (
                        `${board.createdBy.firstName} ${board.createdBy.lastName}`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(board._id)}
                          className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(board)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget({ id: board._id, name: board.name });
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

      {/* Create Board Modal */}
      {showCreate && (
        <BoardModal
          title="Create Board"
          form={boardForm}
          setForm={setBoardForm}
          onSubmit={handleCreateBoard}
          onClose={() => {
            setShowCreate(false);
            resetBoardForm();
          }}
          loading={loading}
        />
      )}

      {/* Edit Board Modal */}
      {showEdit && selectedBoard && (
        <BoardModal
          title="Edit Board"
          form={boardForm}
          setForm={setBoardForm}
          onSubmit={handleUpdateBoard}
          onClose={() => {
            setShowEdit(false);
            resetBoardForm();
            setSelectedBoard(null);
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Board"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone. If this board is assigned to any subjects, you will need to remove the assignment first.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
      />

      {/* Details Modal */}
      {showDetails && selectedBoard && (
        <BoardDetailsModal
          board={selectedBoard}
          onClose={() => {
            setShowDetails(false);
            setSelectedBoard(null);
          }}
        />
      )}
    </div>
  );
}

// Board Modal Component
interface BoardModalProps {
  title: string;
  form: {
    name: string;
    description: string;
    code: string;
    isActive: boolean;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
}

function BoardModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
}: BoardModalProps) {
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
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., CBSE, ICSE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g., CBSE, ICSE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Unique identifier for the board</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter board description..."
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

// Board Details Modal
interface BoardDetailsModalProps {
  board: Board;
  onClose: () => void;
}

function BoardDetailsModal({ board, onClose }: BoardDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Board Details</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-800 font-semibold text-lg">{board.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    board.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {board.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {board.code && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Code</label>
                  <p className="text-gray-800 font-semibold">
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm">
                      {board.code}
                    </span>
                  </p>
                </div>
              )}
              {board.description && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-gray-800">{board.description}</p>
                </div>
              )}
              {board.createdBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                  <p className="text-gray-800">
                    {board.createdBy.firstName} {board.createdBy.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">({board.createdBy.userId})</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-800">{new Date(board.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                <p className="text-gray-800">{new Date(board.updatedAt).toLocaleString()}</p>
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

