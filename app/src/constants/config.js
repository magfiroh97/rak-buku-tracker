
const DEV_LOCAL_IP = 'http://10.176.30.193:3000';
const PRODUCTION_URL = 'https://rak-buku-tracker-production.up.railway.app';

const isDev = __DEV__;

export const API_BASE_URL = `${isDev ? DEV_LOCAL_IP : PRODUCTION_URL}/api`;

export const GOOGLE_BOOKS_PLACEHOLDER_COVER =
  'https://via.placeholder.com/128x192.png?text=No+Cover';