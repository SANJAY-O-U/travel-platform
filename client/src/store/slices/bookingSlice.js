// ============================================================
// Booking Slice
// ============================================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/bookings', bookingData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Booking failed');
  }
});

export const fetchMyBookings = createAsyncThunk('bookings/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/bookings/my', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchBookingDetail = createAsyncThunk('bookings/fetchDetail', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/bookings/${id}`);
    return data.booking;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Cancellation failed');
  }
});

export const fetchAllBookings = createAsyncThunk('bookings/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/bookings/all', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchBookingStats = createAsyncThunk('bookings/stats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/bookings/stats');
    return data.stats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    myBookings: [],
    allBookings: [],
    currentBooking: null,
    stats: null,
    total: 0,
    pages: 1,
    loading: false,
    createLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentBooking: (state) => { state.currentBooking = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => { state.createLoading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createLoading = false;
        state.currentBooking = action.payload.booking;
        toast.success('Booking confirmed! 🎉');
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload.bookings;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => { state.currentBooking = action.payload; })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.myBookings.findIndex(b => b._id === action.payload.booking._id);
        if (idx !== -1) state.myBookings[idx] = action.payload.booking;
        toast.success('Booking cancelled successfully');
      })
      .addCase(cancelBooking.rejected, (state, action) => { toast.error(action.payload); })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.allBookings = action.payload.bookings;
        state.total = action.payload.total;
      })
      .addCase(fetchBookingStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export const { clearCurrentBooking } = bookingSlice.actions;
export const selectMyBookings = (state) => state.bookings.myBookings;
export const selectCurrentBooking = (state) => state.bookings.currentBooking;
export const selectBookingLoading = (state) => state.bookings.createLoading;
export default bookingSlice.reducer;