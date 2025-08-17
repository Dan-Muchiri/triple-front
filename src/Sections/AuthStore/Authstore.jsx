import { create } from 'zustand';

const savedAuth = JSON.parse(localStorage.getItem('auth')) || {};

const useAuthStore = create((set) => ({
  isLoggedIn: savedAuth.isLoggedIn || false,
  userId: savedAuth.userId || null,
  username: savedAuth.username || '',
  userEmail: savedAuth.userEmail || '',
  userRole: savedAuth.userRole || '',

  setUserId: (id) => set({ userId: id }),

  setUserInfo: (newUsername, newEmail) => {
    set({ username: newUsername, userEmail: newEmail });
  },

  checkSession: async () => {
    try {
      const response = await fetch('https://tripletsmediclinic.onrender.com/check_session');
      if (response.ok) {
        const user = await response.json();
        set({
          isLoggedIn: true,
          userId: user.id,
          username: user.username,
          userEmail: user.email,
          userRole: user.role,
        });
        localStorage.setItem('auth', JSON.stringify({
          isLoggedIn: true,
          userId: user.id,
          username: user.username,
          userEmail: user.email,
          userRole: user.role
        }));
      } else {
        set({ isLoggedIn: false, userId: null, username: '', userEmail: '', userRole: '' });
        localStorage.removeItem('auth');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  },

  login: async (credentials, navigate) => {
    try {
      const response = await fetch('https://tripletsmediclinic.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const user = await response.json();
        set({
          isLoggedIn: true,
          userId: user.id,
          username: user.username,
          userEmail: user.email,
          userRole: user.role,
        });

        localStorage.setItem('auth', JSON.stringify({
          isLoggedIn: true,
          userId: user.id,
          username: user.username,
          userEmail: user.email,
          userRole: user.role
        }));

        switch (user.role) {
          case "receptionist": navigate('/receptionist'); break;
          case "nurse": navigate('/nurse'); break;
          case "doctor": navigate('/doctor'); break;
          case "lab_tech": navigate('/lab'); break;
          case "imaging_tech": navigate('/imaging'); break;
          case "pharmacist": navigate('/pharmacy'); break;
          case "admin": navigate('/admin'); break;
          default: navigate('/');
        }
      } else {
        const data = await response.json();
        if (response.status === 404) alert('Email not found');
        else if (response.status === 401) alert('Invalid password');
        else alert('Login error: ' + data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again later.');
    }
  },

  logout: async (navigate) => {
    try {
      const response = await fetch('https://tripletsmediclinic.onrender.com/logout', { method: 'DELETE' });

      set({ isLoggedIn: false, userId: null, username: '', userEmail: '', userRole: '' });
      localStorage.removeItem('auth');
      navigate('/');

      if (!response.ok) {
        console.error('Logout failed (backend):', await response.text());
      }
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoggedIn: false, userId: null, username: '', userEmail: '', userRole: '' });
      localStorage.removeItem('auth');
      navigate('/');
    }
  },

  deleteAccount: async (userId, handleLogout) => {
    try {
      const response = await fetch(`https://tripletsmediclinic.onrender.com/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        handleLogout();
      } else {
        console.error('Delete account failed');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  },
}));

export default useAuthStore;
