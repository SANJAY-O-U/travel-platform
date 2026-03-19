// client/src/store/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api   from '../../utils/api';
import toast from 'react-hot-toast';

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bookings', bookingData);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Booking failed. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings/my', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bookings');
    }
  }
);

export const fetchBookingDetail = createAsyncThunk(
  'bookings/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/bookings/${id}`);
      return data.booking;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/bookings/${id}/cancel`, { reason });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Cancellation failed');
    }
  }
);

export const fetchAllBookings = createAsyncThunk(
  'bookings/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings/all', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchBookingStats = createAsyncThunk(
  'bookings/stats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bookings/stats');
      return data.stats;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    myBookings:     [],
    allBookings:    [],
    currentBooking: null,
    stats:          null,
    total:          0,
    pages:          1,
    loading:        false,
    createLoading:  false,
    error:          null,
  },
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // createBooking
    builder
      .addCase(createBooking.pending, (state) => {
        state.createLoading = true;
        state.error         = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createLoading  = false;
        state.currentBooking = action.payload.booking;
        state.error          = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createLoading = false;
        state.error         = action.payload;
      });

    // fetchMyBookings
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading    = false;
        state.myBookings = action.payload.bookings || [];
        state.total      = action.payload.total    || 0;
        state.pages      = action.payload.pages    || 1;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // fetchBookingDetail
    builder
      .addCase(fetchBookingDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => {
        state.loading        = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingDetail.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // cancelBooking
    builder
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const updated = action.payload.booking;
        const idx     = state.myBookings.findIndex((b) => b._id === updated._id);
        if (idx !== -1) state.myBookings[idx] = updated;
        toast.success('Booking cancelled successfully');
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        toast.error(action.payload || 'Cancellation failed');
      });

    // fetchAllBookings
    builder
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.allBookings = action.payload.bookings || [];
        state.total       = action.payload.total    || 0;
      });

    // fetchBookingStats
    builder
      .addCase(fetchBookingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearCurrentBooking, clearBookingError } = bookingSlice.actions;

export const selectMyBookings     = (state) => state.bookings.myBookings;
export const selectCurrentBooking = (state) => state.bookings.currentBooking;
export const selectBookingLoading = (state) => state.bookings.createLoading;
export const selectAllBookings    = (state) => state.bookings.allBookings;
export const selectBookingStats   = (state) => state.bookings.stats;

export default bookingSlice.reducer;