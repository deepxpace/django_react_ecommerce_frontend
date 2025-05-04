import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

const useAuthStore = create((set, get) => ({
  allUserData: null,
  loading: false,
  isLoggedIn: false,
  user: null,

  setUser: (user) =>
    set({
      allUserData: user,
      isLoggedIn: user !== null,
      user: user
        ? {
            user_id: user.user_id,
            username: user.username,
            vendor_id: user.vendor_id || 0,
            is_vendor: user.vendor_id ? user.vendor_id > 0 : false,
          }
        : null,
    }),
  setLoading: (loading) => set({ loading }),
}));

if (import.meta.env.DEV) {
  mountStoreDevtool("Store", useAuthStore);
}

export { useAuthStore };
