import { deleteCookie } from './deleteCookie'; // adjust the path as needed

export const Logout = () => {
    // Clear local storage
    localStorage.clear();

    // Delete the 'user' cookie
    deleteCookie('user');

    // Redirect to home page
    window.location.pathname = '/';
};