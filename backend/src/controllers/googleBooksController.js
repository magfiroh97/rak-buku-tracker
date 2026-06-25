// src/controllers/googleBooksController.js
// Menangani Fitur 9: Cari Buku via Google Books API & Scan Barcode ISBN
//
// Google Books API tidak butuh API key untuk request dasar (rate limit lebih rendah
// tanpa key, tapi cukup untuk skala tugas kuliah). Kalau mau lebih stabil,
// bisa daftar API key gratis di https://console.cloud.google.com lalu isi di .env

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY || '';

function mapVolumeToBook(item) {
  const info = item.volumeInfo || {};
  const access = item.accessInfo || {};
  const isbnList = info.industryIdentifiers || [];
  const isbn13 = isbnList.find(i => i.type === 'ISBN_13')?.identifier;
  const isbn10 = isbnList.find(i => i.type === 'ISBN_10')?.identifier;

  // Fitur Baca Buku: hanya untuk buku berstatus PUBLIC_DOMAIN (hak cipta sudah
  // habis) yang teksnya benar-benar tersedia dibaca penuh lewat Google Books.
  // Kita TIDAK menyimpan/extract teks buku sendiri — hanya menyalurkan ke
  // pembaca resmi Google. CATATAN: kita sengaja TIDAK pakai access.webReaderLink
  // mentah dari API, karena field itu kadang mengarah ke Google Play Books
  // (yang mewajibkan login Google) bukan ke pembaca publik books.google.com.
  // URL format manual ini lebih konsisten untuk dibuka tanpa login di WebView.
  const isPublicDomain = access.publicDomain === true;
  const isReadable = isPublicDomain && access.viewability === 'ALL_PAGES';
  const readLink = isReadable
    ? `https://books.google.com/books?id=${item.id}&printsec=frontcover&output=reader`
    : null;

  return {
    google_id: item.id,
    title: info.title || 'Tanpa Judul',
    author: (info.authors || []).join(', ') || 'Penulis Tidak Diketahui',
    isbn: isbn13 || isbn10 || null,
    cover_url: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
    total_pages: info.pageCount || 0,
    description: info.description || null,
    published_date: info.publishedDate || null,
    categories: info.categories || [],
    is_public_domain: isReadable,
    read_link: readLink
  };
}

// Fitur 9a: Cari buku via teks (judul/penulis)
async function searchBooks(req, res) {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Kata kunci pencarian wajib diisi.' });
    }

    const url = `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(q)}&maxResults=20${API_KEY ? `&key=${API_KEY}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Gagal menghubungi Google Books API.' });
    }

    const json = await response.json();
    const results = (json.items || []).map(mapVolumeToBook);

    return res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mencari buku.' });
  }
}

// Fitur 9b: Cari buku via ISBN hasil scan barcode kamera
async function searchByIsbn(req, res) {
  try {
    const { isbn } = req.params;
    if (!isbn) {
      return res.status(400).json({ success: false, message: 'ISBN wajib diisi.' });
    }

    const url = `${GOOGLE_BOOKS_BASE_URL}?q=isbn:${encodeURIComponent(isbn)}${API_KEY ? `&key=${API_KEY}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Gagal menghubungi Google Books API.' });
    }

    const json = await response.json();

    if (!json.items || json.items.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku dengan ISBN tersebut tidak ditemukan.' });
    }

    const result = mapVolumeToBook(json.items[0]);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mencari buku via ISBN.' });
  }
}

module.exports = { searchBooks, searchByIsbn };
