// ============================================================
// Flight Slice
// ============================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const searchFlights = createAsyncThunk('flights/search', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/flights', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchPopularRoutes = createAsyncThunk('flights/popularRoutes', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/flights/popular-routes');
    return data.routes;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const flightSlice = createSlice({
  name: 'flights',
  initialState: {
    list: [],
    popularRoutes: [],
    total: 0,
    pages: 1,
    loading: false,
    error: null,
    searchParams: { from: '', to: '', date: '', returnDate: '', passengers: 1, flightClass: 'Economy' },
  },
  reducers: {
    setSearchParams: (state, action) => { state.searchParams = { ...state.searchParams, ...action.payload }; },
    clearFlights: (state) => { state.list = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.flights;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(searchFlights.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPopularRoutes.fulfilled, (state, action) => { state.popularRoutes = action.payload; });
  },
});

export const { setSearchParams, clearFlights } = flightSlice.actions;
export const selectFlights = (state) => state.flights;
export default flightSlice.reducer;

