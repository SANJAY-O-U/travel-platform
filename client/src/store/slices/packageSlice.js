import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPackages = createAsyncThunk('packages/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/packages', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchFeaturedPackages = createAsyncThunk('packages/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/packages/featured');
    return data.packages;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchPackageDetail = createAsyncThunk('packages/detail', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/packages/${id}`);
    return data.package;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const packageSlice = createSlice({
  name: 'packages',
  initialState: {
    list: [],
    featured: [],
    currentPackage: null,
    total: 0,
    pages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentPackage: (state) => { state.currentPackage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => { state.loading = true; })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.packages;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchPackages.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedPackages.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchPackageDetail.fulfilled, (state, action) => { state.currentPackage = action.payload; });
  },
});

export const { clearCurrentPackage } = packageSlice.actions;
export const selectPackages = (state) => state.packages;
export default packageSlice.reducer;