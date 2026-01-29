import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { api } from '../services/api';
import { FileText, Plus, Edit, Trash2, Eye, Search, X, Video, File, Sparkles, ArrowLeft } from 'lucide-react';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

interface CourseChapter {
  _id: string;
  title: string;
  description?: string;
  order: number;
  content: {
    text?: string;
    pdf?: string | {
      url: string;
      fileName: string;
    };
    video?: string | {
      url: string;
      fileName: string;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
}

export default function CourseChapters() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  
  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Selected items
  const [selectedChapter, setSelectedChapter] = useState<CourseChapter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  
  // Form
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    order: 0,
    textContent: '',
    pdf: null as File | null,
    video: null as File | null,
    isActive: true,
  });

  useEffect(() => {
    if (token && courseId) {
      fetchCourse();
      fetchChapters();
    }
  }, [token, courseId, filterActive]);

  const fetchCourse = async () => {
    if (!token || !courseId) return;
    try {
      const response = await api.getCourseById(token, courseId);
      if (response.success) {
        setCourse(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch course', 'error');
    }
  };

  const fetchChapters = async () => {
    if (!token || !courseId) return;
    setLoading(true);
    try {
      const response = await api.getCourseChapters(token, courseId, filterActive);
      if (response.success) {
        setChapters(response.data);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch course chapters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !courseId) return;
    setLoading(true);
    try {
      const response = await api.createCourseChapter(
        token,
        courseId,
        chapterForm.title,
        chapterForm.order,
        chapterForm.description || undefined,
        chapterForm.textContent || undefined,
        chapterForm.pdf || undefined,
        chapterForm.video || undefined
      );
      if (response.success) {
        showToast('Course chapter created successfully!', 'success');
        setShowCreate(false);
        resetChapterForm();
        fetchChapters();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create course chapter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedChapter) return;
    setLoading(true);
    try {
      const response = await api.updateCourseChapter(
        token,
        selectedChapter._id,
        chapterForm.title || undefined,
        chapterForm.description !== undefined ? chapterForm.description : undefined,
        chapterForm.order !== undefined ? chapterForm.order : undefined,
        chapterForm.textContent !== undefined ? chapterForm.textContent : undefined,
        chapterForm.isActive,
        chapterForm.pdf || undefined,
        chapterForm.video || undefined
      );
      if (response.success) {
        showToast('Course chapter updated successfully!', 'success');
        setShowEdit(false);
        resetChapterForm();
        setSelectedChapter(null);
        fetchChapters();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update course chapter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setLoading(true);
    try {
      await api.deleteCourseChapter(token, deleteTarget.id);
      showToast('Course chapter deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchChapters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete course chapter', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (chapter: CourseChapter) => {
    setSelectedChapter(chapter);
    setChapterForm({
      title: chapter.title,
      description: chapter.description || '',
      order: chapter.order,
      textContent: typeof chapter.content.text === 'string' ? chapter.content.text : '',
      pdf: null,
      video: null,
      isActive: chapter.isActive,
    });
    setShowEdit(true);
  };

  const handleViewDetails = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.getCourseChapterById(token, id);
      if (response.success) {
        setSelectedChapter(response.data);
        setShowDetails(true);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch course chapter details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetChapterForm = () => {
    setChapterForm({
      title: '',
      description: '',
      order: 0,
      textContent: '',
      pdf: null,
      video: null,
      isActive: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'video') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'pdf') {
        if (file.type !== 'application/pdf') {
          showToast('Please upload a valid PDF file', 'error');
          return;
        }
        if (file.size > 50 * 1024 * 1024) {
          showToast('File size must be less than 50MB', 'error');
          return;
        }
        setChapterForm({ ...chapterForm, pdf: file });
      } else if (type === 'video') {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          showToast('Please upload a valid video file (MP4, WebM, or OGG)', 'error');
          return;
        }
        if (file.size > 500 * 1024 * 1024) {
          showToast('File size must be less than 500MB', 'error');
          return;
        }
        setChapterForm({ ...chapterForm, video: file });
      }
      showToast('File selected successfully', 'success');
    }
  };

  const filteredChapters = chapters
    .filter(
      (chapter) =>
        chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chapter.description && chapter.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Courses"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Course Chapters Management
            </h1>
            {course && (
              <p className="text-gray-600">
                Managing chapters for: <span className="font-semibold">{course.title}</span>
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            resetChapterForm();
            setShowCreate(true);
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Create Chapter
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search chapters..."
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

      {/* Chapters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredChapters.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No chapters found</p>
            <p className="text-sm mt-2">This course doesn't have any chapters yet.</p>
          </div>
        ) : (
          filteredChapters.map((chapter) => (
            <div
              key={chapter._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-semibold">
                        #{chapter.order}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">{chapter.title}</h3>
                    </div>
                    {chapter.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{chapter.description}</p>
                    )}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {chapter.content.text && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Text
                        </span>
                      )}
                      {chapter.content.pdf && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1">
                          <File className="w-3 h-3" />
                          PDF
                        </span>
                      )}
                      {chapter.content.video && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      chapter.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {chapter.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(chapter._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(chapter)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget({ id: chapter._id, title: chapter.title });
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
          ))
        )}
      </div>

      {/* Create Chapter Modal */}
      {showCreate && (
        <ChapterModal
          title="Create Course Chapter"
          form={chapterForm}
          setForm={setChapterForm}
          onSubmit={handleCreateChapter}
          onClose={() => {
            setShowCreate(false);
            resetChapterForm();
          }}
          loading={loading}
          onFileChange={handleFileChange}
        />
      )}

      {/* Edit Chapter Modal */}
      {showEdit && selectedChapter && (
        <ChapterModal
          title="Edit Course Chapter"
          form={chapterForm}
          setForm={setChapterForm}
          onSubmit={handleUpdateChapter}
          onClose={() => {
            setShowEdit(false);
            resetChapterForm();
            setSelectedChapter(null);
          }}
          loading={loading}
          onFileChange={handleFileChange}
          existingChapter={selectedChapter}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Course Chapter"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
      />

      {/* Details Modal */}
      {showDetails && selectedChapter && (
        <ChapterDetailsModal
          chapter={selectedChapter}
          onClose={() => {
            setShowDetails(false);
            setSelectedChapter(null);
          }}
        />
      )}
    </div>
  );
}

// Chapter Modal Component
interface ChapterModalProps {
  title: string;
  form: {
    title: string;
    description: string;
    order: number;
    textContent: string;
    pdf: File | null;
    video: File | null;
    isActive: boolean;
  };
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'video') => void;
  existingChapter?: CourseChapter;
}

function ChapterModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  onFileChange,
  existingChapter,
}: ChapterModalProps) {
  const { showToast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please enter a prompt for AI generation', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: aiPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content with AI');
      }

      const data = await response.json();
      
      if (data.completion) {
        setForm({ ...form, textContent: data.completion });
        showToast('Content generated successfully!', 'success');
        setAiPrompt('');
      } else {
        throw new Error('No completion in response');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to generate content with AI', 'error');
    } finally {
      setAiLoading(false);
    }
  };

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter chapter description..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Text Content (Markdown)</label>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={aiLoading || loading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              {aiLoading && (
                <div className="mb-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                    <span>Generating content with AI...</span>
                  </div>
                </div>
              )}
              <div className="mb-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateWithAI();
                    }
                  }}
                  placeholder="Enter your prompt for AI generation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  disabled={aiLoading || loading}
                />
                <p className="mt-1 text-xs text-gray-500">Press Enter to generate or click the button</p>
              </div>
              <textarea
                value={form.textContent}
                onChange={(e) => setForm({ ...form, textContent: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none font-mono text-sm"
                placeholder="Enter markdown content or generate with AI..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PDF File (Optional, Max 50MB)</label>
              {existingChapter?.content.pdf && !form.pdf && (
                <div className="mb-2">
                  <span className="text-sky-600 flex items-center gap-2">
                    <File className="w-4 h-4" />
                    {typeof existingChapter.content.pdf === 'object' ? existingChapter.content.pdf.fileName : 'Existing PDF'}
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => onFileChange(e, 'pdf')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video File (Optional, Max 500MB)</label>
              {existingChapter?.content.video && !form.video && (
                <div className="mb-2">
                  <span className="text-sky-600 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {typeof existingChapter.content.video === 'object' ? existingChapter.content.video.fileName : 'Existing Video'}
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={(e) => onFileChange(e, 'video')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700"
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

// Chapter Details Modal
interface ChapterDetailsModalProps {
  chapter: CourseChapter;
  onClose: () => void;
}

function ChapterDetailsModal({ chapter, onClose }: ChapterDetailsModalProps) {
  const getUrl = (content: any) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return content.url || '';
  };

  const getFileName = (content: any) => {
    if (!content) return '';
    if (typeof content === 'object' && content.fileName) return content.fileName;
    if (typeof content === 'string') {
      const parts = content.split('/');
      return parts[parts.length - 1];
    }
    return 'File';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-sky-400 to-sky-600 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Chapter Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                <p className="text-gray-800 font-semibold text-lg">{chapter.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Order</label>
                <p className="text-gray-800 font-semibold">
                  <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm">
                    #{chapter.order}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    chapter.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {chapter.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Description */}
            {chapter.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {chapter.description}
                </p>
              </div>
            )}

            {/* Markdown Content */}
            {chapter.content.text && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Text Content (Markdown)</label>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 text-gray-800" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 text-gray-800" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 text-gray-800" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 text-gray-700" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 text-gray-700" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      code: ({ node, ...props }) => (
                        <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto mb-3" {...props} />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-sky-500 pl-4 italic text-gray-600 mb-3" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                      ),
                    }}
                  >
                    {chapter.content.text}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            {chapter.content.pdf && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-500">PDF File</label>
                  <a
                    href={getUrl(chapter.content.pdf)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline flex items-center gap-2 text-sm"
                  >
                    <File className="w-4 h-4" />
                    {getFileName(chapter.content.pdf)}
                    <span className="text-xs text-gray-500">(Open in new tab)</span>
                  </a>
                </div>
                <div className="bg-gray-100 rounded-lg border border-gray-300 overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={getUrl(chapter.content.pdf)}
                    className="w-full h-full"
                    title="PDF Preview"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Video Player */}
            {chapter.content.video && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-500">Video File</label>
                  <a
                    href={getUrl(chapter.content.video)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:underline flex items-center gap-2 text-sm"
                  >
                    <Video className="w-4 h-4" />
                    {getFileName(chapter.content.video)}
                    <span className="text-xs text-gray-500">(Open in new tab)</span>
                  </a>
                </div>
                <div className="bg-gray-900 rounded-lg border border-gray-300 overflow-hidden">
                  <video
                    src={getUrl(chapter.content.video)}
                    controls
                    className="w-full"
                    style={{ maxHeight: '600px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-800">{new Date(chapter.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Updated At</label>
                <p className="text-gray-800">{new Date(chapter.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

