document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadSettings();
    initializeSlideshow();
    loadQueueData();
    
    // Atur koneksi WebSocket untuk pembaruan real-time
    setupWebSocket();
});

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
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// Muat pengaturan dari localStorage
function loadSettings() {
    // Muat nama instansi
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    document.getElementById('instansi-nama').textContent = instansiNama;
    
    // Muat teks berjalan
    const runningText = localStorage.getItem('runningText') || 'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda sesuai keperluan Anda.';
    document.getElementById('running-text').textContent = runningText;
}

// Inisialisasi slideshow
function initializeSlideshow() {
    const slideshowContainer = document.getElementById('slideshow');
    const dotsContainer = document.getElementById('dots-container');
    
    // Ini adalah bagian yang paling penting! Gunakan URL publik, bukan jalur lokal.
    let slides = JSON.parse(localStorage.getItem("slides")) || [
    { src: "assets/slide1.jpg" },
    { src: "assets/slide2.jpg" },
    { src: "assets/slide3.jpg" }
];
    
    if (slideshowContainer) slideshowContainer.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideElement = document.createElement('img');
        slideElement.src = slide.src;
        slideElement.className = 'slide';
        if (index === 0) slideElement.classList.add('active');
        slideElement.alt = `Slide ${index + 1}`;
        if (slideshowContainer) slideshowContainer.appendChild(slideElement);
        
        const dotElement = document.createElement('div');
        dotElement.className = 'dot';
        if (index === 0) dotElement.classList.add('active');
        dotElement.addEventListener('click', () => goToSlide(index));
        if (dotsContainer) dotsContainer.appendChild(dotElement);
    });
    
    if (slides.length > 1) {
        startSlideshow();
    }
}

// Fungsionalitas slideshow
let slideshowInterval;
let currentSlide = 0;

function startSlideshow() {
    slideshowInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Ganti slide setiap 5 detik
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    // Hapus interval dan mulai ulang
    clearInterval(slideshowInterval);
    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    startSlideshow();
}

// Muat data antrian dari localStorage
function loadQueueData() {
    const currentQueue = localStorage.getItem('currentQueue') || '-';
    const queueNote = localStorage.getItem('queueNote') || 'Silakan menunggu nomor antrian Anda dipanggil';
    
    document.getElementById('current-queue-number').textContent = currentQueue;
    document.getElementById('queue-note').textContent = queueNote;
    
    // Muat item antrian berikutnya
    const queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    for (let i = 0; i < 9; i++) { // Ubah loop menjadi 9 untuk menampilkan semua item
        const queueItem = document.getElementById(`queue-next-${i + 1}`);
        if (queueItem) {
            queueItem.textContent = queueList[i] || '-';
        }
    }
}

// Atur koneksi WebSocket untuk pembaruan real-time
function setupWebSocket() {
    // Menggunakan event local storage untuk demo
    // Dalam sistem nyata, Anda akan mengimplementasikan WebSocket di sini
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentQueue' || e.key === 'queueList' || e.key === 'queueNote') {
            loadQueueData();
        } else if (e.key === 'instansiNama' || e.key === 'runningText') {
            loadSettings();
        } else if (e.key === 'slides') {
            clearInterval(slideshowInterval);
            initializeSlideshow();
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