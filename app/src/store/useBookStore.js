// src/store/useBookStore.js
// State global daftar buku + kategori, supaya Home, Detail, Wishlist,
// Favorites, dan Statistik semua bisa baca data yang sama tanpa fetch ulang
// terus-menerus. Setiap aksi (create/update/delete) memperbarui store ini
// sehingga semua screen otomatis ter-sinkron (ini yang membuat 25 fitur
// "saling terhubung" secara nyata, bukan cuma di atas kertas).

import { create } from 'zustand';
import { booksApi } from '../api/books';
import { categoriesApi } from '../api/categories';

export const useBookStore = create((set, get) => ({
  books: [],
  categories: [],
  isLoadingBooks: false,

  fetchBooks: async (filters = {}) => {
    set({ isLoadingBooks: true });
    try {
      const res = await booksApi.getAll(filters);
      set({ books: res.data.data, isLoadingBooks: false });
    } catch (err) {
      set({ isLoadingBooks: false });
      throw err;
    }
  },

  fetchCategories: async () => {
    const res = await categoriesApi.getAll();
    set({ categories: res.data.data });
  },

  addBook: async (bookData) => {
    const res = await booksApi.create(bookData);
    set({ books: [res.data.data, ...get().books] });
    return res.data.data;
  },

  editBook: async (id, bookData) => {
    const res = await booksApi.update(id, bookData);
    set({
      books: get().books.map((b) => (b.id === id ? res.data.data : b)),
    });
    return res.data.data;
  },

  removeBook: async (id) => {
    await booksApi.remove(id);
    set({ books: get().books.filter((b) => b.id !== id) });
  },

  updateProgress: async (id, currentPage) => {
    const res = await booksApi.updateProgress(id, currentPage);
    set({
      books: get().books.map((b) => (b.id === id ? res.data.data : b)),
    });
    return res.data.data;
  },

  toggleFavorite: async (id) => {
    const res = await booksApi.toggleFavorite(id);
    set({
      books: get().books.map((b) =>
        b.id === id ? { ...b, is_favorite: res.data.data.is_favorite ? 1 : 0 } : b
      ),
    });
  },

  toggleWishlist: async (id) => {
    const res = await booksApi.toggleWishlist(id);
    set({
      books: get().books.map((b) =>
        b.id === id ? { ...b, is_wishlist: res.data.data.is_wishlist ? 1 : 0 } : b
      ),
    });
  },

  addCategory: async (name) => {
    const res = await categoriesApi.create(name);
    set({ categories: [...get().categories, res.data.data] });
    return res.data.data;
  },

  removeCategory: async (id) => {
    await categoriesApi.remove(id);
    set({ categories: get().categories.filter((c) => c.id !== id) });
  },
}));
