const API_BASE_URL = 'http://localhost:8080';

// Types
export interface User {
  username: string;
  fullname: string;
  email: string;
  phonenumber: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
  books?: number; // Number of books in this category
}

export interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  published?: string;
  category: string; // Category name as string in response
  rating?: number; // Average rating
  reviewCount?: number; // Number of reviews
}

export interface FeaturedBook {
  id: number;
  title: string;
  image: string;
  rating: number;
  category: string;
}

export interface ChapterDetail {
  id: number;
  title_chapter: string;
  text: string;
  listAudio: AudioDetail[]; // API returns 'listAudio'
  audioes?: AudioDetail[]; // Computed field for compatibility
}

export interface AudioDetail {
  id: number;
  audio_name: string;
  audio_file: string;
}

// Base interfaces for entities (used in requests)
export interface Chapter {
  id: number;
  title_chapter: string;
  text: string;
  book?: Book;
  audios?: Audio[];
}

export interface Audio {
  id: number;
  audio_name: string;
  audio_file: string;
  chapter?: Chapter;
}

export interface Review {
  id: number;
  review: string;
  rating: number;
  user: {
    username: string;
  };
  book?: Book;
}

export interface BookDetail {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  published?: string;
  category: string; // Category name as string
  listChapter: ChapterDetail[]; // API returns 'listChapter'
  chapters?: ChapterDetail[]; // Computed field for compatibility
  rating?: number;
  reviews?: Review[];
}

export interface MyAudio {
  id: number;
  audio_name: string;
  audio_url: string;
  username: string;
}

export interface ListenHistory {
  id?: number;
  titleOfBook: string;
  titleOfChapter: string;
  audioUrl: string; // Note: response uses camelCase 'audioUrl'
  nameOfAudio: string;
  time: string;
  username: string;
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text() as T;
}

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Tài khoản/mật khẩu không đúng');
    return response.text();
  },

  register: async (data: {
    username: string;
    password: string;
    fullname: string;
    email: string;
    phonenumber: string;
  }): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Đăng ký thất bại');
    }
    return response.text();
  },

  getUser: async (username: string): Promise<User> => {
    return apiRequest<User>(`/user/get-user/${username}`);
  },

  getAllUsers: async (): Promise<User[]> => {
    return apiRequest<User[]>('/user/get-user');
  },

  updateUser: async (username: string, data: Partial<User>): Promise<void> => {
    await apiRequest(`/user/${username}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (username: string): Promise<void> => {
    await apiRequest(`/user/${username}`, {
      method: 'DELETE',
    });
  },

  updateProfile: async (
    username: string,
    data: { fullname: string; email: string; phonenumber: string }
  ): Promise<void> => {
    await apiRequest(`/user/update-profile/${username}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (
    username: string,
    data: { oldPassword: string; newPassword: string }
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/user/change-password/${username}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Change password failed');
    }
  },
};

// Books API
export const booksApi = {
  getFeatured: async (): Promise<FeaturedBook[]> => {
    return apiRequest<FeaturedBook[]>('/featuredBook');
  },

  getAll: async (categoryId: number = 0, rating: number = 0, page?: number): Promise<Book[] | { content: Book[], totalPages: number }> => {
    if (page !== undefined) {
      return apiRequest<{ content: Book[], totalPages: number }>(`/bookInCategory/page/${categoryId}/${page}`);
    }
    return apiRequest<Book[]>(`/book/${categoryId}/${rating}`);
  },

  getById: async (id: number): Promise<BookDetail> => {
    const response = await apiRequest<any>(`/book/${id}`);
    // Map listChapter to chapters and listAudio to audioes for compatibility
    const chapters = (response.listChapter || []).map((chapter: any) => ({
      ...chapter,
      audioes: chapter.listAudio || [],
    }));
    
    return {
      ...response,
      chapters,
    };
  },

  getByCategory: async (categoryId: number, rating: number = 0, page?: number): Promise<Book[] | { content: Book[], totalPages: number }> => {
    if (page !== undefined) {
      return apiRequest<{ content: Book[], totalPages: number }>(`/bookInCategory/page/${categoryId}/${page}`);
    }
    return apiRequest<Book[]>(`/bookInCategory/${categoryId}/${rating}`);
  },

  search: async (keyword: string, categoryId: number = 0, rating: number = 0): Promise<Book[]> => {
    return apiRequest<Book[]>(`/searchBook/${keyword}/${categoryId}/${rating}`);
  },

  add: async (data: {
    title: string;
    author: string;
    image: string;
    description: string;
    categoryId: number;
    published?: string;
  }): Promise<void> => {
    await apiRequest('/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Book>): Promise<void> => {
    await apiRequest(`/book/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/book/${id}`, { method: 'DELETE' });
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return apiRequest<Category[]>('/category/getCategories');
  },

  add: async (name: string): Promise<void> => {
    await apiRequest('/category', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: number, name: string): Promise<void> => {
    await apiRequest(`/category/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/category/${id}`, {
      method: 'DELETE',
    });
  },
};

// My Audio API
export const myAudioApi = {
  getByUser: async (username: string): Promise<MyAudio[]> => {
    return apiRequest<MyAudio[]>(`/getMyAudio/${username}`);
  },

  add: async (data: { audio_name: string; audio_url: string; username: string }): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/addMyAudio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add audio: ${response.status} - ${errorText}`);
    }
    
    return response.text();
  },

  update: async (id: number, data: { audio_name: string; audio_url: string }): Promise<void> => {
    await apiRequest(`/updateMyAudio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/deleteMyAudio/${id}`, { method: 'DELETE' });
  },
};

// File Upload API
export const uploadApi = {
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/generatePath`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    return response.text();
  },
};

// Listen History API
export const historyApi = {
  add: async (data: {
    username: string;
    titleOfBook: string;
    titleOfChapter: string;
    audioUrl: string; // Note: backend expects camelCase 'audioUrl'
    nameOfAudio: string;
    time: string;
  }): Promise<void> => {
    await apiRequest('/listenHistory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getByUser: async (username: string, page: number = 0, size: number = 10): Promise<{
    content: ListenHistory[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> => {
    return apiRequest(`/listenHistory/${username}?page=${page}&size=${size}`);
  },
};

// Reviews API
export const reviewsApi = {
  add: async (data: {
    bookId: number;
    username: string;
    rating: number;
    review: string;
  }): Promise<void> => {
    const { bookId, ...reviewData } = data;
    await apiRequest(`/${bookId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getByBook: async (bookId: number, page: number = 0, size: number = 10): Promise<{
    content: Review[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  } | Review[]> => {
    return apiRequest(`/${bookId}/reviews?page=${page}&size=${size}`);
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/reviews/${id}`, { method: 'DELETE' });
  },
};

// Chapters API
export const chaptersApi = {
  add: async (data: {
    book_id: number;
    chapter_title: string;
    text?: string;
  }): Promise<void> => {
    await apiRequest('/chapter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    chapter_title?: string;
    text?: string;
  }): Promise<void> => {
    await apiRequest(`/chapter/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/chapter/${id}`, { method: 'DELETE' });
  },
};

// Audio API
export const audioApi = {
  add: async (data: {
    chapter_id: number;
    audio_name: string;
    audio_file: string;
  }): Promise<void> => {
    await apiRequest('/audio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    audio_name?: string;
    audio_file?: string;
  }): Promise<void> => {
    await apiRequest(`/audio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest(`/audio/${id}`, { method: 'DELETE' });
  },
};

// TTS API
export const ttsApi = {
  generate: async (text: string, audioUrl: string): Promise<{ 
    message: string; 
    audio_file_url: string;
  }> => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('audio_url', audioUrl);

    const response = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`TTS generation failed: ${response.status}`);
    }

    return response.json();
  },
};

// OCR API (Image to Text)
export const ocrApi = {
  getText: async (imageUrl: string): Promise<{
    message: string;
    text_from_image: string;
  }> => {
    const response = await fetch('http://localhost:5000/getText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`OCR extraction failed: ${response.status}`);
    }

    return response.json();
  },
};
