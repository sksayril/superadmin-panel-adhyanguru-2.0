// const API_BASE_URL = 'http://localhost:3023/api/super-admin';
const API_BASE_URL = 'https://api.adhyan.guru/api/super-admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    userId: string;
    email: string;
    mobileNumber: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
  };
}

interface SignupResponse {
  _id: string;
  userId: string;
  email: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
  createdAt: string;
}

export const api = {
  async login(identifier: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async signup(
    email: string,
    mobileNumber: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePicture?: File
  ): Promise<ApiResponse<SignupResponse>> {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('mobileNumber', mobileNumber);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Signup failed. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Logout failed. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async createAdmin(
    token: string,
    email: string,
    mobileNumber: string,
    password: string,
    firstName: string,
    lastName: string,
    profilePicture?: File,
    latitude?: number,
    longitude?: number
  ): Promise<ApiResponse<SignupResponse>> {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('mobileNumber', mobileNumber);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      
      if (latitude !== undefined && latitude !== null) {
        formData.append('latitude', latitude.toString());
      }
      
      if (longitude !== undefined && longitude !== null) {
        formData.append('longitude', longitude.toString());
      }

      const response = await fetch(`${API_BASE_URL}/create-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create admin. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async createUser(
    token: string,
    userType: string,
    email: string,
    mobileNumber: string,
    password: string,
    firstName: string,
    lastName: string,
    district?: string,
    profilePicture?: File,
    latitude?: number,
    longitude?: number
  ): Promise<ApiResponse<SignupResponse>> {
    try {
      const formData = new FormData();
      formData.append('userType', userType);
      formData.append('email', email);
      formData.append('mobileNumber', mobileNumber);
      formData.append('password', password);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      
      if (district) {
        formData.append('district', district);
      }
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }
      
      if (latitude !== undefined && latitude !== null) {
        formData.append('latitude', latitude.toString());
      }
      
      if (longitude !== undefined && longitude !== null) {
        formData.append('longitude', longitude.toString());
      }

      const response = await fetch(`${API_BASE_URL}/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create user. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllUsers(token: string): Promise<ApiResponse<Array<{
    _id: string;
    userId: string;
    email: string;
    role: string;
  }>> & { count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/all-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch users. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getUserDetails(
    token: string,
    userId: string,
    includePassword?: boolean
  ): Promise<ApiResponse<{
    _id: string;
    userId: string;
    email: string;
    mobileNumber: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    profilePicture?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    updatedAt: string;
    password?: string;
    encryptedPassword?: string;
  }>> {
    try {
      const url = `${API_BASE_URL}/user/${userId}${includePassword ? '?includePassword=true' : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch user details. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Main Category APIs
  async createMainCategory(
    token: string,
    name: string,
    description?: string,
    image?: File
  ): Promise<ApiResponse<{
    _id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (description) {
        formData.append('description', description);
      }
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_BASE_URL}/main-category`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create main category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllMainCategories(
    token: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
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
  }>> & { count: number }> {
    try {
      const url = `${API_BASE_URL}/main-category${isActive !== undefined ? `?isActive=${isActive}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch main categories. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getMainCategoryById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
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
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/main-category/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch main category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateMainCategory(
    token: string,
    id: string,
    name?: string,
    description?: string,
    isActive?: boolean,
    image?: File
  ): Promise<ApiResponse<{
    _id: string;
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (description !== undefined) formData.append('description', description);
      if (isActive !== undefined) formData.append('isActive', isActive.toString());
      if (image) formData.append('image', image);

      const response = await fetch(`${API_BASE_URL}/main-category/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update main category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteMainCategory(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/main-category/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete main category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Sub Category APIs
  async createSubCategory(
    token: string,
    name: string,
    mainCategoryId: string,
    description?: string,
    image?: File
  ): Promise<ApiResponse<{
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
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('mainCategoryId', mainCategoryId);
      if (description) {
        formData.append('description', description);
      }
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_BASE_URL}/sub-category`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create sub category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllSubCategories(
    token: string,
    mainCategoryId?: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
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
  }>> & { count: number }> {
    try {
      const params = new URLSearchParams();
      if (mainCategoryId) params.append('mainCategoryId', mainCategoryId);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      const queryString = params.toString();
      const url = `${API_BASE_URL}/sub-category${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch sub categories. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getSubCategoryById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
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
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/sub-category/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch sub category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateSubCategory(
    token: string,
    id: string,
    name?: string,
    description?: string,
    mainCategoryId?: string,
    isActive?: boolean,
    image?: File
  ): Promise<ApiResponse<{
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
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (description !== undefined) formData.append('description', description);
      if (mainCategoryId) formData.append('mainCategoryId', mainCategoryId);
      if (isActive !== undefined) formData.append('isActive', isActive.toString());
      if (image) formData.append('image', image);

      const response = await fetch(`${API_BASE_URL}/sub-category/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update sub category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteSubCategory(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/sub-category/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete sub category. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Subject Management APIs
  async createSubject(
    token: string,
    title: string,
    mainCategoryId: string,
    subCategoryId: string,
    description?: string,
    thumbnail?: File,
    boardId?: string,
    isActive?: boolean
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    mainCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    board?: {
      _id: string;
      name: string;
      description?: string;
      code?: string;
    } | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('mainCategoryId', mainCategoryId);
      formData.append('subCategoryId', subCategoryId);
      if (description) formData.append('description', description);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      if (boardId) formData.append('boardId', boardId);
      if (isActive !== undefined) formData.append('isActive', isActive.toString());

      const response = await fetch(`${API_BASE_URL}/subject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create subject. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllSubjects(
    token: string,
    mainCategoryId?: string,
    subCategoryId?: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    mainCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    board?: {
      _id: string;
      name: string;
      description?: string;
      code?: string;
    } | null;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const params = new URLSearchParams();
      if (mainCategoryId) params.append('mainCategoryId', mainCategoryId);
      if (subCategoryId) params.append('subCategoryId', subCategoryId);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      const queryString = params.toString();
      const url = `${API_BASE_URL}/subject${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch subjects. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getSubjectById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    mainCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    board?: {
      _id: string;
      name: string;
      description?: string;
      code?: string;
    } | null;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    chapters?: Array<{
      _id: string;
      title: string;
      description?: string;
      order: number;
      content: {
        text?: string;
        pdf?: {
          url: string;
          fileName: string;
        };
        video?: {
          url: string;
          fileName: string;
        };
      };
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/subject/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch subject details. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateSubject(
    token: string,
    id: string,
    title?: string,
    description?: string,
    mainCategoryId?: string,
    subCategoryId?: string,
    boardId?: string | null,
    isActive?: boolean,
    thumbnail?: File
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    mainCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
    };
    board?: {
      _id: string;
      name: string;
      description?: string;
      code?: string;
    } | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description !== undefined) formData.append('description', description);
      if (mainCategoryId) formData.append('mainCategoryId', mainCategoryId);
      if (subCategoryId) formData.append('subCategoryId', subCategoryId);
      if (boardId !== undefined) {
        if (boardId === null || boardId === '') {
          formData.append('boardId', '');
        } else {
          formData.append('boardId', boardId);
        }
      }
      if (isActive !== undefined) formData.append('isActive', isActive.toString());
      if (thumbnail) formData.append('thumbnail', thumbnail);

      const response = await fetch(`${API_BASE_URL}/subject/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update subject. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteSubject(
    token: string,
    id: string
  ): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/subject/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete subject. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Chapter Management APIs
  async createChapter(
    token: string,
    title: string,
    subjectId: string,
    order?: number,
    description?: string,
    textContent?: string,
    pdf?: File,
    video?: File,
    isActive?: boolean
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    subject: {
      _id: string;
      title: string;
      description?: string;
      thumbnail?: string;
    };
    order: number;
    content: {
      text?: string;
      pdf?: {
        url: string;
        fileName: string;
      };
      video?: {
        url: string;
        fileName: string;
      };
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subjectId', subjectId);
      if (order !== undefined) formData.append('order', order.toString());
      if (description) formData.append('description', description);
      if (textContent) formData.append('textContent', textContent);
      if (pdf) formData.append('pdf', pdf);
      if (video) formData.append('video', video);
      if (isActive !== undefined) formData.append('isActive', isActive.toString());

      const response = await fetch(`${API_BASE_URL}/chapter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getChaptersBySubject(
    token: string,
    subjectId: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
    _id: string;
    title: string;
    description?: string;
    order: number;
    content: {
      text?: string;
      pdf?: {
        url: string;
        fileName: string;
      };
      video?: {
        url: string;
        fileName: string;
      };
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      const queryString = params.toString();
      const url = `${API_BASE_URL}/chapter/subject/${subjectId}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch chapters. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getChapterById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    subject: {
      _id: string;
      title: string;
      description?: string;
      thumbnail?: string;
      mainCategory: {
        _id: string;
        name: string;
        description?: string;
        image?: string;
      };
      subCategory: {
        _id: string;
        name: string;
        description?: string;
        image?: string;
      };
    };
    order: number;
    content: {
      text?: string;
      pdf?: {
        url: string;
        fileName: string;
      };
      video?: {
        url: string;
        fileName: string;
      };
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
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chapter/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch chapter details. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateChapter(
    token: string,
    id: string,
    title?: string,
    description?: string,
    order?: number,
    textContent?: string,
    isActive?: boolean,
    pdf?: File,
    video?: File
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    order: number;
    content: {
      text?: string;
      pdf?: {
        url: string;
        fileName: string;
      };
      video?: {
        url: string;
        fileName: string;
      };
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description !== undefined) formData.append('description', description);
      if (order !== undefined) formData.append('order', order.toString());
      if (textContent !== undefined) formData.append('textContent', textContent);
      if (isActive !== undefined) formData.append('isActive', isActive.toString());
      if (pdf) formData.append('pdf', pdf);
      if (video) formData.append('video', video);

      const response = await fetch(`${API_BASE_URL}/chapter/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteChapter(
    token: string,
    id: string
  ): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chapter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Board Management APIs
  async createBoard(
    token: string,
    name: string,
    description?: string,
    code?: string
  ): Promise<ApiResponse<{
    _id: string;
    name: string;
    description?: string;
    code?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/board`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create board. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllBoards(
    token: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
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
  }>> & { count: number }> {
    try {
      const url = `${API_BASE_URL}/board${isActive !== undefined ? `?isActive=${isActive}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch boards. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getBoardById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
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
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/board/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch board. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateBoard(
    token: string,
    id: string,
    name?: string,
    description?: string,
    code?: string,
    isActive?: boolean
  ): Promise<ApiResponse<{
    _id: string;
    name: string;
    description?: string;
    code?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const body: any = {};
      if (name !== undefined) body.name = name;
      if (description !== undefined) body.description = description;
      if (code !== undefined) body.code = code;
      if (isActive !== undefined) body.isActive = isActive;

      const response = await fetch(`${API_BASE_URL}/board/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update board. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteBoard(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/board/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete board. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Plan Management APIs
  async createPlan(
    token: string,
    subCategoryId: string,
    duration: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR',
    amount: number,
    description?: string
  ): Promise<ApiResponse<{
    _id: string;
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
      mainCategory: {
        _id: string;
        name: string;
      };
    };
    duration: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subCategoryId,
          duration,
          amount,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create plan. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async createMultiplePlans(
    token: string,
    subCategoryId: string,
    plans: Array<{
      duration: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR';
      amount: number;
      description?: string;
    }>
  ): Promise<ApiResponse<Array<{
    _id: string;
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
      mainCategory: {
        _id: string;
        name: string;
      };
    };
    duration: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/plan/multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subCategoryId,
          plans,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create plans. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllPlans(
    token: string,
    subCategoryId?: string,
    duration?: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR',
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
    _id: string;
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
      mainCategory: {
        _id: string;
        name: string;
      };
    };
    duration: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const params = new URLSearchParams();
      if (subCategoryId) params.append('subCategoryId', subCategoryId);
      if (duration) params.append('duration', duration);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      const queryString = params.toString();
      const url = `${API_BASE_URL}/plan${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch plans. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getPlansBySubCategory(
    token: string,
    subCategoryId: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
    _id: string;
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
      mainCategory: {
        _id: string;
        name: string;
      };
    };
    duration: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const url = `${API_BASE_URL}/plan/sub-category/${subCategoryId}${isActive !== undefined ? `?isActive=${isActive}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch plans. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getPlanById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
    _id: string;
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
      mainCategory: {
        _id: string;
        name: string;
      };
    };
    duration: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/plan/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch plan. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updatePlan(
    token: string,
    id: string,
    duration?: '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR',
    amount?: number,
    description?: string,
    isActive?: boolean
  ): Promise<ApiResponse<{
    _id: string;
    subCategory: {
      _id: string;
      name: string;
      description?: string;
      image?: string;
      mainCategory: {
        _id: string;
        name: string;
      };
    };
    duration: string;
    amount: number;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const body: any = {};
      if (duration !== undefined) body.duration = duration;
      if (amount !== undefined) body.amount = amount;
      if (description !== undefined) body.description = description;
      if (isActive !== undefined) body.isActive = isActive;

      const response = await fetch(`${API_BASE_URL}/plan/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update plan. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deletePlan(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/plan/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete plan. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Public Course Management APIs
  async createCourse(
    token: string,
    title: string,
    price: number,
    description?: string,
    thumbnail?: File
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price.toString());
      if (description) formData.append('description', description);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      const response = await fetch(`${API_BASE_URL}/course`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create course. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getAllCourses(
    token: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const url = `${API_BASE_URL}/course${isActive !== undefined ? `?isActive=${isActive}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch courses. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getCourseById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    isActive: boolean;
    createdBy?: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    chapters?: Array<{
      _id: string;
      title: string;
      description?: string;
      order: number;
      content: {
        text?: string;
        pdf?: string;
        video?: string;
      };
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/course/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch course. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateCourse(
    token: string,
    id: string,
    title?: string,
    description?: string,
    price?: number,
    isActive?: boolean,
    thumbnail?: File
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description !== undefined) formData.append('description', description);
      if (price !== undefined) formData.append('price', price.toString());
      if (isActive !== undefined) formData.append('isActive', isActive.toString());
      if (thumbnail) formData.append('thumbnail', thumbnail);

      const response = await fetch(`${API_BASE_URL}/course/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update course. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteCourse(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/course/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete course. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  // Course Chapter Management APIs
  async createCourseChapter(
    token: string,
    courseId: string,
    title: string,
    order: number,
    description?: string,
    text?: string,
    pdf?: File,
    video?: File
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    course: string;
    order: number;
    content: {
      text?: string;
      pdf?: string;
      video?: string;
    };
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', title);
      formData.append('order', order.toString());
      if (description) formData.append('description', description);
      if (text) formData.append('text', text);
      if (pdf) formData.append('pdf', pdf);
      if (video) formData.append('video', video);

      const response = await fetch(`${API_BASE_URL}/course-chapter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create course chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getCourseChapters(
    token: string,
    courseId: string,
    isActive?: boolean
  ): Promise<ApiResponse<Array<{
    _id: string;
    title: string;
    description?: string;
    order: number;
    content: {
      text?: string;
      pdf?: string;
      video?: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> & { count: number }> {
    try {
      const url = `${API_BASE_URL}/course/${courseId}/chapters${isActive !== undefined ? `?isActive=${isActive}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch course chapters. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async getCourseChapterById(
    token: string,
    id: string
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    course: {
      _id: string;
      title: string;
      description?: string;
      thumbnail?: string;
    };
    order: number;
    content: {
      text?: string;
      pdf?: string;
      video?: string;
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
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/course-chapter/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch course chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async updateCourseChapter(
    token: string,
    id: string,
    title?: string,
    description?: string,
    order?: number,
    text?: string,
    isActive?: boolean,
    pdf?: File,
    video?: File
  ): Promise<ApiResponse<{
    _id: string;
    title: string;
    description?: string;
    order: number;
    content: {
      text?: string;
      pdf?: string;
      video?: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description !== undefined) formData.append('description', description);
      if (order !== undefined) formData.append('order', order.toString());
      if (text !== undefined) formData.append('text', text);
      if (isActive !== undefined) formData.append('isActive', isActive.toString());
      if (pdf) formData.append('pdf', pdf);
      if (video) formData.append('video', video);

      const response = await fetch(`${API_BASE_URL}/course-chapter/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update course chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  async deleteCourseChapter(
    token: string,
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/course-chapter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete course chapter. Please try again.');
      }

      return data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },
};

