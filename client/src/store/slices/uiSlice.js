import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: true,
    sidebarOpen: false,
    searchModalOpen: false,
    bookingModalOpen: false,
    loginModalOpen: false,
    notifications: [],
    pageLoading: false,
  },
  reducers: {
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar: (state, action) => { state.sidebarOpen = action.payload; },
    setSearchModal: (state, action) => { state.searchModalOpen = action.payload; },
    setBookingModal: (state, action) => { state.bookingModalOpen = action.payload; },
    setLoginModal: (state, action) => { state.loginModalOpen = action.payload; },
    addNotification: (state, action) => {
      state.notifications.unshift({ id: Date.now(), ...action.payload });
      if (state.notifications.length > 10) state.notifications.pop();
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setPageLoading: (state, action) => { state.pageLoading = action.payload; },
  },
});

export const {
  toggleDarkMode, toggleSidebar, setSidebar,
  setSearchModal, setBookingModal, setLoginModal,
  addNotification, removeNotification, setPageLoading,
} = uiSlice.actions;

export const selectUI = (state) => state.ui;
export const selectDarkMode = (state) => state.ui.darkMode;
export default uiSlice.reducer;