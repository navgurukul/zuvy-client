import { deleteCookie } from './deleteCookie'; // adjust the path as needed

export const Logout = () => {
<<<<<<< HEAD
    // Clear local storage
    localStorage.clear();

    // Delete the 'user' cookie
    deleteCookie('user');

    // Redirect to home page
=======
    localStorage.clear();
    deleteCookie('secure_typeuser');
>>>>>>> cc57bebdcd2bb4e3ca09491824b30890acde8c11
    window.location.pathname = '/';
};