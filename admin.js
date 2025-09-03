document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi panel admin
    initializeAdminPanel();

    // Atur event listeners
    setupEventListeners();

    // Perbarui tanggal dan waktu
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

// Inisialisasi panel admin
function initializeAdminPanel() {
    // Periksa status login
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        showAdminPanel();
        loadAdminData();
    }
}

// Tampilkan panel admin dan sembunyikan login
function showAdminPanel() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
}

// Tampilkan halaman login dan sembunyikan panel admin
function showLoginPanel() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
}

// Perbarui tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    
    // Format waktu: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Format tanggal: Hari, DD Bulan YYYY
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;
    
    // Perbarui DOM
    document.getElementById('admin-current-time').textContent = timeString;
    document.getElementById('admin-current-date').textContent = dateString;
}

// Muat data admin
function loadAdminData() {
    // Muat nama instansi
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    document.getElementById('admin-instansi-nama').textContent = instansiNama;
    document.getElementById('instansi-name-input').value = instansiNama;
    
    // Muat teks berjalan
    const runningText = localStorage.getItem('runningText') || 'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda sesuai keperluan Anda.';
    document.getElementById('running-text-input').value = runningText;
    
    // Muat data antrian
    const currentQueue = localStorage.getItem('currentQueue') || '-';
    document.getElementById('admin-current-number').textContent = currentQueue;
    
    // Muat catatan antrian
    const queueNote = localStorage.getItem('queueNote') || 'Loket pelayanan 1 sedang melayani pengiriman paket dan uang. Loket 2 melayani jasa lainnya.';
    document.getElementById('queue-note-input').value = queueNote;
    
    // Muat statistik antrian
    const totalQueue = parseInt(localStorage.getItem('totalQueue') || '0');
    const processedQueue = parseInt(localStorage.getItem('processedQueue') || '0');
    const remainingQueue = parseInt(localStorage.getItem('remainingQueue') || '0');
    
    document.getElementById('total-queue').textContent = totalQueue;
    document.getElementById('processed-queue').textContent = processedQueue;
    document.getElementById('remaining-queue').textContent = remainingQueue;
    
    // Muat slideshow
    loadSlideshowSettings();
}

// Muat pengaturan slideshow
function loadSlideshowSettings() {
    const slideshowList = document.getElementById('slideshow-list');
    slideshowList.innerHTML = '';
    
    // Dapatkan slides dari localStorage atau gunakan defaults yang relevan dengan Pos
    let slides = JSON.parse(localStorage.getItem('slides')) || [
        { src: 'https://i.ibb.co/6PqjXWc/pos-slide-1.jpg' },
        { src: 'https://i.ibb.co/tCg3X3B/pos-slide-2.jpg' },
        { src: 'https://i.ibb.co/p3tJ5P0/pos-slide-3.jpg' }
    ];
    
    // Buat item slide
    slides.forEach((slide, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slideshow-item';
        slideItem.innerHTML = `
            <img src="${slide.src}" alt="Slide ${index + 1}">
            <div class="slideshow-item-overlay">
                <div class="slideshow-item-actions">
                    <button class="slide-action-btn edit-slide" data-index="${index}">✏️</button>
                    <button class="slide-action-btn delete-slide" data-index="${index}">🗑️</button>
                </div>
            </div>
        `;
        slideshowList.appendChild(slideItem);
    });
    
    // Tambahkan event listener untuk edit dan hapus
    document.querySelectorAll('.edit-slide').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            editSlide(index);
        });
    });
    
    document.querySelectorAll('.delete-slide').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deleteSlide(index);
        });
    });
}

// Edit slide
function editSlide(index) {
    let slides = JSON.parse(localStorage.getItem('slides')) || [];
    const slide = slides[index];
    
    const sourceType = prompt('Pilih sumber gambar (1: URL)', '1');
    
    if (sourceType === '1') {
        const url = prompt('Masukkan URL gambar:', slide.src);
        if (url && url.trim() !== '') {
            slides[index].src = url;
            localStorage.setItem('slides', JSON.stringify(slides));
            loadSlideshowSettings();
        }
    } else {
        alert('Fitur upload file lokal belum didukung.');
    }
}

// Hapus slide
function deleteSlide(index) {
    if (confirm('Apakah Anda yakin ingin menghapus slide ini?')) {
        let slides = JSON.parse(localStorage.getItem('slides')) || [];
        slides.splice(index, 1);
        localStorage.setItem('slides', JSON.stringify(slides));
        loadSlideshowSettings();
    }
}

// Tambah slide baru
function addSlide() {
    const sourceType = prompt('Pilih sumber gambar (1: URL)', '1');
    
    if (sourceType === '1') {
        const url = prompt('Masukkan URL gambar:');
        if (url && url.trim() !== '') {
            let slides = JSON.parse(localStorage.getItem('slides')) || [];
            slides.push({ src: url });
            localStorage.setItem('slides', JSON.stringify(slides));
            loadSlideshowSettings();
        }
    } else {
        alert('Fitur upload file lokal belum didukung.');
    }
}

// Panggil antrian berikutnya
function callNextQueue() {
    let queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    
    if (queueList.length > 0) {
        // Ambil nomor antrian berikutnya
        const nextQueue = queueList.shift();
        
        // Perbarui antrian saat ini
        localStorage.setItem('currentQueue', nextQueue);
        document.getElementById('admin-current-number').textContent = nextQueue;
        
        // Perbarui daftar antrian
        localStorage.setItem('queueList', JSON.stringify(queueList));
        
        // Perbarui statistik
        const processedQueue = parseInt(localStorage.getItem('processedQueue') || '0') + 1;
        const remainingQueue = queueList.length;
        
        localStorage.setItem('processedQueue', processedQueue.toString());
        localStorage.setItem('remainingQueue', remainingQueue.toString());
        
        document.getElementById('processed-queue').textContent = processedQueue;
        document.getElementById('remaining-queue').textContent = remainingQueue;
        
        // Umumkan antrian berikutnya dengan suara yang lebih bagus
        const announcementText = `Nomor antrian ${nextQueue}. Silakan menuju loket.`;
        speakText(announcementText);
    } else {
        alert('Tidak ada antrian berikutnya.');
    }
}

// Reset antrian
function resetQueue() {
    if (confirm('Apakah Anda yakin ingin mereset seluruh antrian?')) {
        localStorage.setItem('currentQueue', '-');
        localStorage.setItem('queueList', JSON.stringify([]));
        localStorage.setItem('totalQueue', '0');
        localStorage.setItem('processedQueue', '0');
        localStorage.setItem('remainingQueue', '0');
        
        document.getElementById('admin-current-number').textContent = '-';
        document.getElementById('total-queue').textContent = '0';
        document.getElementById('processed-queue').textContent = '0';
        document.getElementById('remaining-queue').textContent = '0';
        
        alert('Antrian telah direset.');
    }
}

// Perbarui catatan antrian
function updateQueueNote() {
    const note = document.getElementById('queue-note-input').value;
    localStorage.setItem('queueNote', note);
    alert('Catatan antrian telah diperbarui.');
}

// Simpan pengaturan tampilan
function saveDisplaySettings() {
    const instansiNama = document.getElementById('instansi-name-input').value;
    const runningText = document.getElementById('running-text-input').value;
    
    localStorage.setItem('instansiNama', instansiNama);
    localStorage.setItem('runningText', runningText);
    
    document.getElementById('admin-instansi-nama').textContent = instansiNama;
    
    alert('Pengaturan tampilan telah disimpan.');
}

// Ubah password
function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const errorElement = document.getElementById('password-error');
    const successElement = document.getElementById('password-success');
    
    errorElement.textContent = '';
    successElement.textContent = '';
    
    // Dapatkan hash password yang tersimpan
    const storedHash = localStorage.getItem('adminPasswordHash') || hashPassword('admin123');
    
    // Verifikasi password saat ini
    if (hashPassword(currentPassword) !== storedHash) {
        errorElement.textContent = 'Password saat ini tidak valid!';
        return;
    }
    
    // Periksa apakah password baru cocok
    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'Password baru dan konfirmasi tidak cocok!';
        return;
    }
    
    // Periksa kekuatan password
    if (newPassword.length < 6) {
        errorElement.textContent = 'Password baru terlalu pendek (minimal 6 karakter)!';
        return;
    }
    
    // Simpan password baru
    localStorage.setItem('adminPasswordHash', hashPassword(newPassword));
    successElement.textContent = 'Password berhasil diubah!';
    
    // Kosongkan form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Login
function login() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Dapatkan hash password yang tersimpan atau gunakan default
    const storedHash = localStorage.getItem('adminPasswordHash') || hashPassword('admin123');
    
    if (hashPassword(password) === storedHash) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        loadAdminData();
        errorElement.textContent = '';
    } else {
        errorElement.textContent = 'Password tidak valid!';
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginPanel();
}

// Hash password (hash sederhana untuk demo)
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// Atur event listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-btn').addEventListener('click', login);
    
    // Navigasi sidebar
    document.querySelectorAll('.sidebar-btn').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // Sembunyikan semua bagian
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Tampilkan bagian target
            document.getElementById(target).classList.add('active');
            
            // Perbarui tombol aktif
            document.querySelectorAll('.sidebar-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Manajemen antrian
    document.getElementById('call-next-btn').addEventListener('click', callNextQueue);
    document.getElementById('reset-queue-btn').addEventListener('click', resetQueue);
    document.getElementById('update-note-btn').addEventListener('click', updateQueueNote);
    
    // Pengaturan tampilan
    document.getElementById('add-slide-btn').addEventListener('click', addSlide);
    document.getElementById('save-display-settings').addEventListener('click', saveDisplaySettings);
    
    // Pengaturan sistem
    document.getElementById('change-password-btn').addEventListener('click', changePassword);
    
    // Input password - submit dengan Enter
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
}

// Fungsionalitas suara
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2; // Sedikit lebih cepat
    speech.pitch = 1.1; // Sedikit lebih tinggi untuk suara yang lebih jernih
    
    window.speechSynthesis.speak(speech);
}