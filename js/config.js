/**
 * =========================================================
 *  CONFIG — Pesta Siaga 2026
 *  Ganti API_URL setelah deploy Web App dari Google Apps Script
 *  (Deploy > New deployment > Web app > Execute as: Me,
 *   Who has access: Anyone). Tempel URL yang berakhiran /exec.
 * =========================================================
 */

const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbyThXG-e88ZOMLXznF9V2BuS-dUF4jjTFlAiOr9meHkZdrvap8sORf98sbZiGT9E-VeAg/exec',
  APP_NAME: 'Pesta Siaga 2026',
  PENYELENGGARA: 'KKMI Bondowoso',
  TAGLINE: 'Tunas Kelapa, Berbakti Tanpa Henti',
  SESSION_KEY: 'pesta_siaga_session'
};

/**
 * Pemanggil API generik ke backend GAS.
 * action  : nama fungsi di actionHandlers (backend)
 * params  : array argumen sesuai urutan fungsi backend
 * useAuth : true -> sisipkan token sesi yang tersimpan
 */
async function callApi(action, params = [], useAuth = true) {

  const session = useAuth ? getSession() : null;

  const payload = {
    action: action,
    token: session ? session.token : '',
    params: params
  };

  let response;

  try {
    response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  } catch (networkErr) {
    throw new Error('Tidak dapat menghubungi server. Periksa koneksi internet Anda.');
  }

  const result = await response.json();

  if (result.status === 'ERROR') {

    // Sesi kedaluwarsa / tidak valid -> paksa kembali ke login
    if (/[Ss]esi/.test(result.message)) {
      clearSession();
      if (!location.pathname.endsWith('index.html') && location.pathname !== '/') {
        location.href = 'index.html';
      }
    }

    throw new Error(result.message || 'Terjadi kesalahan pada server.');
  }

  return result.data;
}

function saveSession(sessionData) {
  localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(sessionData));
}

function getSession() {

  const raw = localStorage.getItem(CONFIG.SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(CONFIG.SESSION_KEY);
}

/**
 * Redirect ke dashboard sesuai role setelah login.
 * File dashboard menyusul di Fase 4 lanjutan — untuk sekarang
 * semua role diarahkan ke satu file dashboard.html yang akan
 * menyesuaikan tampilan berdasarkan session.role.
 */
function redirectByRole(role) {
  location.href = 'dashboard.html';
}
