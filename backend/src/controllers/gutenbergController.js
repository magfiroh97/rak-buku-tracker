// src/controllers/gutenbergController.js
// Integrasi Project Gutenberg via Gutendex API untuk fitur baca buku teks asli.

const GUTENDEX_BASE_URL = 'https://gutendex.com/books';

const START_MARKERS = [
  /\*\*\* START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/is,
  /\*\*\*START OF THE PROJECT GUTENBERG EBOOK.*?\*\*\*/is,
];
const END_MARKERS = [
  /\*\*\* END OF THE PROJECT GUTENBERG EBOOK.*/is,
  /\*\*\*END OF THE PROJECT GUTENBERG EBOOK.*/is,
];

function stripGutenbergBoilerplate(text) {
  let result = text;
  for (const marker of START_MARKERS) {
    const match = result.match(marker);
    if (match) { result = result.slice(match.index + match[0].length); break; }
  }
  for (const marker of END_MARKERS) {
    const match = result.match(marker);
    if (match) { result = result.slice(0, match.index); break; }
  }
  return result.trim();
}

function isTitleSimilar(a, b) {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const normA = normalize(a.split(/[:;\/]/)[0]);
  const normB = normalize(b.split(/[:;\/]/)[0]);
  return normA.includes(normB) || normB.includes(normA);
}

async function checkAvailability(req, res) {
  try {
    const { title, author } = req.query;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Judul wajib diisi.' });
    }

    const query = author ? `${title} ${author}` : title;
    const url = `${GUTENDEX_BASE_URL}?search=${encodeURIComponent(query)}&languages=en,id`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.json({ success: true, data: { available: false } });
    }

    const json = await response.json();
    const candidates = json.results || [];
    const match = candidates.find((b) => isTitleSimilar(b.title, title));

    if (!match) {
      return res.json({ success: true, data: { available: false } });
    }

    const textFormat = Object.keys(match.formats || {}).find(
      (key) => key.startsWith('text/plain')
    );

    if (!textFormat) {
      return res.json({ success: true, data: { available: false } });
    }

    return res.json({
      success: true,
      data: {
        available: true,
        gutenberg_id: match.id,
        title: match.title,
        text_url: match.formats[textFormat],
      },
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: true, data: { available: false } });
  }
}

async function getBookText(req, res) {
  try {
    const { textUrl } = req.query;
    if (!textUrl || !textUrl.startsWith('https://www.gutenberg.org/')) {
      return res.status(400).json({ success: false, message: 'URL teks tidak valid.' });
    }

    const response = await fetch(textUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, message: 'Gagal mengambil teks dari Gutenberg.' });
    }

    const rawText = await response.text();
    const cleanedText = stripGutenbergBoilerplate(rawText);

    return res.json({ success: true, data: { text: cleanedText } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan.' });
  }
}

module.exports = { checkAvailability, getBookText };
