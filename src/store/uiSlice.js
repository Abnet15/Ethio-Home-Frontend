import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  language: 'en',
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;



