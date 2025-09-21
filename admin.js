document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi panel admin
    initializeAdminPanel();

    // Atur event listeners
    setupEventListeners();

    // Perbarui tanggal dan waktu
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load logo saat awal
    loadLogo();
});

// Inisialisasi panel admin
function initializeAdminPanel() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        showAdminPanel();
        loadAdminData();
    }
}

// Tampilkan panel admin
function showAdminPanel() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
}

// Tampilkan login
function showLoginPanel() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
}

// Perbarui jam & tanggal
function updateDateTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli',
                    'Agustus','September','Oktober','November','Desember'];

    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;

    document.getElementById('admin-current-time').textContent = timeString;
    document.getElementById('admin-current-date').textContent = dateString;
}

// Muat data admin
function loadAdminData() {
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    document.getElementById('admin-instansi-nama').textContent = instansiNama;
    document.getElementById('instansi-name-input').value = instansiNama;

    const runningText = localStorage.getItem('runningText') || 
        'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda.';
    document.getElementById('running-text-input').value = runningText;

    const currentQueue = localStorage.getItem('currentQueue') || '-';
    document.getElementById('admin-current-number').textContent = currentQueue;

    const queueNote = localStorage.getItem('queueNote') || 
        'Loket pelayanan 1 melayani pengiriman paket, loket 2 melayani jasa lainnya.';
    document.getElementById('queue-note-input').value = queueNote;

    const totalQueue = parseInt(localStorage.getItem('totalQueue') || '0');
    const processedQueue = parseInt(localStorage.getItem('processedQueue') || '0');
    const remainingQueue = parseInt(localStorage.getItem('remainingQueue') || '0');

    document.getElementById('total-queue').textContent = totalQueue;
    document.getElementById('processed-queue').textContent = processedQueue;
    document.getElementById('remaining-queue').textContent = remainingQueue;

    loadSlideshowSettings();
    loadLogo();
}

// ---------------- SLIDESHOW ----------------
function loadSlideshowSettings() {
    const slideshowList = document.getElementById('slideshow-list');
    slideshowList.innerHTML = '';

    let slides = JSON.parse(localStorage.getItem('slides')) || [
        { src: 'https://i.ibb.co/6PqjXWc/pos-slide-1.jpg' },
        { src: 'https://i.ibb.co/tCg3X3B/pos-slide-2.jpg' },
        { src: 'https://i.ibb.co/p3tJ5P0/pos-slide-3.jpg' }
    ];

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

    document.querySelectorAll('.edit-slide').forEach(button => {
        button.addEventListener('click', function() {
            editSlide(this.getAttribute('data-index'));
        });
    });

    document.querySelectorAll('.delete-slide').forEach(button => {
        button.addEventListener('click', function() {
            deleteSlide(this.getAttribute('data-index'));
        });
    });
}

function editSlide(index) {
    let slides = JSON.parse(localStorage.getItem('slides')) || [];
    const slide = slides[index];

    const url = prompt('Masukkan URL gambar:', slide.src);
    if (url && url.trim() !== '') {
        slides[index].src = url;
        localStorage.setItem('slides', JSON.stringify(slides));
        loadSlideshowSettings();
    }
}

function deleteSlide(index) {
    if (confirm('Apakah Anda yakin ingin menghapus slide ini?')) {
        let slides = JSON.parse(localStorage.getItem('slides')) || [];
        slides.splice(index, 1);
        localStorage.setItem('slides', JSON.stringify(slides));
        loadSlideshowSettings();
    }
}

function addSlide() {
    const url = prompt('Masukkan URL gambar:');
    if (url && url.trim() !== '') {
        let slides = JSON.parse(localStorage.getItem('slides')) || [];
        slides.push({ src: url });
        localStorage.setItem('slides', JSON.stringify(slides));
        loadSlideshowSettings();
    }
}

// ---------------- LOGO ----------------
function changeLogo() {
    const fileInput = document.getElementById('logo-upload');
    const previewImg = document.getElementById('logo-preview');
    const adminLogoImg = document.getElementById('admin-logo-img');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoData = e.target.result;
            previewImg.src = logoData;
            adminLogoImg.src = logoData;
            localStorage.setItem('logoImage', logoData);
            alert('Logo berhasil diperbarui!');
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

function loadLogo() {
    const savedLogo = localStorage.getItem('logoImage');
    if (savedLogo) {
        document.getElementById('logo-preview').src = savedLogo;
        document.getElementById('admin-logo-img').src = savedLogo;
    }
}

// ---------------- ANTRIAN ----------------
function callNextQueue() {
    let queueList = JSON.parse(localStorage.getItem('queueList')) || [];

    if (queueList.length > 0) {
        const nextQueue = queueList.shift();
        localStorage.setItem('currentQueue', nextQueue);
        document.getElementById('admin-current-number').textContent = nextQueue;

        localStorage.setItem('queueList', JSON.stringify(queueList));

        const processedQueue = parseInt(localStorage.getItem('processedQueue') || '0') + 1;
        const remainingQueue = queueList.length;

        localStorage.setItem('processedQueue', processedQueue.toString());
        localStorage.setItem('remainingQueue', remainingQueue.toString());

        document.getElementById('processed-queue').textContent = processedQueue;
        document.getElementById('remaining-queue').textContent = remainingQueue;

        speakText(`Nomor antrian ${nextQueue}. Silakan menuju loket.`);
    } else {
        alert('Tidak ada antrian berikutnya.');
    }
}

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

function updateQueueNote() {
    const note = document.getElementById('queue-note-input').value;
    localStorage.setItem('queueNote', note);
    alert('Catatan antrian telah diperbarui.');
}

// ---------------- PENGATURAN ----------------
function saveDisplaySettings() {
    const instansiNama = document.getElementById('instansi-name-input').value;
    const runningText = document.getElementById('running-text-input').value;

    localStorage.setItem('instansiNama', instansiNama);
    localStorage.setItem('runningText', runningText);

    document.getElementById('admin-instansi-nama').textContent = instansiNama;
    alert('Pengaturan tampilan telah disimpan.');
}

function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    const errorElement = document.getElementById('password-error');
    const successElement = document.getElementById('password-success');

    errorElement.textContent = '';
    successElement.textContent = '';

    const storedHash = localStorage.getItem('adminPasswordHash') || hashPassword('admin123');

    if (hashPassword(currentPassword) !== storedHash) {
        errorElement.textContent = 'Password saat ini tidak valid!';
        return;
    }

    if (newPassword !== confirmPassword) {
        errorElement.textContent = 'Password baru dan konfirmasi tidak cocok!';
        return;
    }

    if (newPassword.length < 6) {
        errorElement.textContent = 'Password baru terlalu pendek (minimal 6 karakter)!';
        return;
    }

    localStorage.setItem('adminPasswordHash', hashPassword(newPassword));
    successElement.textContent = 'Password berhasil diubah!';

    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// ---------------- LOGIN ----------------
function login() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');

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

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginPanel();
}

function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// ---------------- EVENT LISTENERS ----------------
function setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', login);

    document.querySelectorAll('.sidebar-btn').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            document.querySelectorAll('.admin-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(target).classList.add('active');
            document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    document.getElementById('call-next-btn').addEventListener('click', callNextQueue);
    document.getElementById('reset-queue-btn').addEventListener('click', resetQueue);
    document.getElementById('update-note-btn').addEventListener('click', updateQueueNote);

    document.getElementById('add-slide-btn').addEventListener('click', addSlide);
    document.getElementById('save-display-settings').addEventListener('click', saveDisplaySettings);

    document.getElementById('change-password-btn').addEventListener('click', changePassword);

    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    document.getElementById('change-logo-btn').addEventListener('click', changeLogo);
}

// ---------------- SUARA ----------------
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}
