/**
 * =========================================================
 *  LOGIN — Pesta Siaga 2026
 * ========================================================= */

(function () {

  // Jika sudah ada sesi aktif, langsung lempar ke dashboard
  const existing = getSession();
  if (existing && existing.token) {
    redirectByRole(existing.role);
    return;
  }

  const form = document.getElementById('loginForm');
  const btnSubmit = document.getElementById('btnSubmit');
  const alertError = document.getElementById('alertError');
  const inputUsername = document.getElementById('username');
  const inputPassword = document.getElementById('password');
  const toggleBtn = document.getElementById('togglePassword');

  toggleBtn.addEventListener('click', function () {
    const isPassword = inputPassword.type === 'password';
    inputPassword.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? 'Sembunyikan' : 'Lihat';
  });

  function showError(message) {
    alertError.textContent = message;
    alertError.classList.add('show');
  }

  function hideError() {
    alertError.classList.remove('show');
    alertError.textContent = '';
  }

  function setLoading(isLoading) {
    btnSubmit.disabled = isLoading;
    btnSubmit.classList.toggle('loading', isLoading);
    btnSubmit.querySelector('.btn-label').textContent = isLoading ? 'Memeriksa...' : 'Masuk';
  }

  form.addEventListener('submit', async function (e) {

    e.preventDefault();
    hideError();

    const username = inputUsername.value.trim();
    const password = inputPassword.value;

    if (!username || !password) {
      showError('Username dan password wajib diisi.');
      return;
    }

    if (CONFIG.API_URL.indexOf('GANTI_DENGAN') === 0) {
      showError('API_URL belum diatur di js/config.js. Tempel URL Web App GAS Anda terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {

      // action "login" bersifat publik -> useAuth = false
      const result = await callApi('login', [username, password], false);

      if (!result.success) {
        showError(result.message || 'Username atau password salah.');
        setLoading(false);
        return;
      }

      saveSession({
        token: result.token,
        userId: result.user.userId,
        nama: result.user.nama,
        role: result.user.role,
        sekolahId: result.user.sekolahId
      });

      redirectByRole(result.user.role);

    } catch (err) {

      showError(err.message || 'Terjadi kesalahan. Coba lagi.');
      setLoading(false);
    }
  });

})();
