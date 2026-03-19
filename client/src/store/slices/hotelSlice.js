// client/src/store/slices/hotelSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/hotels', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchFeaturedHotels = createAsyncThunk(
  'hotels/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/hotels/featured');
      return data.hotels || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchHotelDetail = createAsyncThunk(
  'hotels/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/hotels/${id}`);
      return data.hotel;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchDestinations = createAsyncThunk(
  'hotels/destinations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/hotels/destinations');
      return data.destinations || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    list:          [],
    featured:      [],
    destinations:  [],
    currentHotel:  null,
    total:         0,
    pages:         1,
    currentPage:   1,
    loading:       false,
    detailLoading: false,
    error:         null,
    filters: {
      city:         '',
      checkIn:      '',
      checkOut:     '',
      guests:       1,
      minPrice:     '',
      maxPrice:     '',
      starRating:   '',
      propertyType: '',
      sortBy:       'rating',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        city: '', checkIn: '', checkOut: '', guests: 1,
        minPrice: '', maxPrice: '', starRating: '',
        propertyType: '', sortBy: 'rating',
      };
    },
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchHotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading     = false;
        state.list        = action.payload.hotels      || [];
        state.total       = action.payload.total       || 0;
        state.pages       = action.payload.pages       || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.list    = [];
      })
      // fetchFeaturedHotels
      .addCase(fetchFeaturedHotels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedHotels.fulfilled, (state, action) => {
        state.loading  = false;
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedHotels.rejected, (state, action) => {
        state.loading  = false;
        state.error    = action.payload;
        state.featured = [];
      })
      // fetchHotelDetail
      .addCase(fetchHotelDetail.pending, (state) => {
        state.detailLoading = true;
        state.error         = null;
      })
      .addCase(fetchHotelDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHotel  = action.payload;
      })
      .addCase(fetchHotelDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error         = action.payload;
      })
      // fetchDestinations
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.destinations = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentHotel, clearError } = hotelSlice.actions;

export const selectHotels        = (state) => state.hotels;
export const selectFeaturedHotels = (state) => state.hotels.featured;
export const selectCurrentHotel  = (state) => state.hotels.currentHotel;
export const selectDestinations  = (state) => state.hotels.destinations;

export default hotelSlice.reducer;