// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ── Async Thunks ──────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Update failed');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'auth/toggleWishlist',
  async (hotelId, { rejectWithValue, getState }) => {
    try {
      const { data } = await api.post(`/auth/wishlist/${hotelId}`);
      return { wishlist: data.wishlist, message: data.message, hotelId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Wishlist update failed');
    }
  }
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/admin/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Admin login failed');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user:            getStoredUser(),
  token:           localStorage.getItem('token') || null,
  loading:         false,
  error:           null,
  isAuthenticated: !!localStorage.getItem('token'),
};

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.error           = null;
      state.loading         = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.token           = localStorage.getItem('token');
      state.error           = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── loginUser ─────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
        state.error           = null;
        toast.success(action.payload.message || 'Welcome back!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        toast.error(action.payload || 'Login failed');
      });

    // ── registerUser ──────────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
        state.error           = null;
        toast.success(action.payload.message || 'Account created!');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        toast.error(action.payload || 'Registration failed');
      });

    // ── fetchCurrentUser ──────────────────────────────────
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading         = false;
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
      });

    // ── updateProfile ─────────────────────────────────────
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        toast.success('Profile updated successfully!');
      })
      .addCase(updateProfile.rejected, (state, action) => {
        toast.error(action.payload || 'Update failed');
      });

    // ── toggleWishlist ────────────────────────────────────
    builder
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = action.payload.wishlist;
          // Update localStorage
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          stored.wishlist = action.payload.wishlist;
          localStorage.setItem('user', JSON.stringify(stored));
        }
        toast.success(action.payload.message);
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        toast.error(action.payload || 'Failed to update wishlist');
      });

    // ── adminLogin ────────────────────────────────────────
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
        state.isAuthenticated = true;
        state.error           = null;
        toast.success(action.payload.message || 'Welcome Admin!');
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        toast.error(action.payload || 'Admin login failed');
      });
  },
});

export const { logout, clearError, setUser, setLoading } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────
export const selectAuth            = (state) => state.auth;
export const selectUser            = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin         = (state) => state.auth.user?.role === 'admin';
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectAuthError       = (state) => state.auth.error;
export const selectWishlist        = (state) => state.auth.user?.wishlist || [];

export default authSlice.reducer;