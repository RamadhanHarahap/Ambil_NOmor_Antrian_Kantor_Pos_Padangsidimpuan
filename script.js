document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi tanggal & waktu
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Inisialisasi slideshow
    initializeSlideshow();

    // Load data realtime dari Firebase
    loadQueueData();
    loadSettings();
});

// ---------------------
// TANGGAL & WAKTU
// ---------------------
function updateDateTime() {
    const now = new Date();

    // Format waktu: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;

    // Format tanggal: Hari, DD Bulan YYYY
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    document.getElementById('current-date').textContent = `${day}, ${date} ${month} ${year}`;
}

// ---------------------
// DATA SETTINGS (INSTANSI & RUNNING TEXT)
// ---------------------
function loadSettings() {
    // Nama instansi
    const instansiRef = firebase.database().ref('settings/instansiNama');
    instansiRef.on('value', snapshot => {
        const nama = snapshot.val() || 'Kantor Pos Padangsidimpuan';
        document.getElementById('instansi-nama').textContent = nama;
    });

    // Running text
    const runningTextRef = firebase.database().ref('settings/runningText');
    runningTextRef.on('value', snapshot => {
        const text = snapshot.val() || 'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda sesuai keperluan Anda.';
        document.getElementById('running-text').textContent = text;
    });

    // Slides
    const slidesRef = firebase.database().ref('slides');
    slidesRef.on('value', snapshot => {
        const slides = snapshot.val() || [
            { src: "assets/slide1.jpg" },
            { src: "assets/slide2.jpg" },
            { src: "assets/slide3.jpg" }
        ];
        initializeSlideshow(slides);
    });
}

// ---------------------
// SLIDESHOW
// ---------------------
let slideshowInterval;
let currentSlide = 0;

function initializeSlideshow(slides = null) {
    const slideshowContainer = document.getElementById('slideshow');
    const dotsContainer = document.getElementById('dots-container');

    if (!slides) {
        slides = [
            { src: "assets/slide1.jpg" },
            { src: "assets/slide2.jpg" },
            { src: "assets/slide3.jpg" }
        ];
    }

    slideshowContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    slides.forEach((slide, index) => {
        const img = document.createElement('img');
        img.src = slide.src;
        img.className = 'slide';
        if (index === 0) img.classList.add('active');
        img.alt = `Slide ${index+1}`;
        slideshowContainer.appendChild(img);

        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    if (slideshowInterval) clearInterval(slideshowInterval);
    if (slides.length > 1) startSlideshow();
}

function startSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    slideshowInterval = setInterval(() => {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = (currentSlide + 1) % slides.length;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }, 5000);
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');

    clearInterval(slideshowInterval);
    startSlideshow();
}

// ---------------------
// DATA ANTRIAN REALTIME
// ---------------------
function loadQueueData() {
    // Nomor antrian sekarang
    const currentQueueRef = firebase.database().ref('antrian/current');
    currentQueueRef.on('value', snapshot => {
        const current = snapshot.val() || '-';
        document.getElementById('current-queue-number').textContent = current;
    });

    // Catatan antrian
    const queueNoteRef = firebase.database().ref('antrian/note');
    queueNoteRef.on('value', snapshot => {
        const note = snapshot.val() || 'Silakan menunggu nomor antrian Anda dipanggil';
        document.getElementById('queue-note').textContent = note;
    });

    // Daftar antrian berikutnya
    const nextQueueRef = firebase.database().ref('antrian/next');
    nextQueueRef.on('value', snapshot => {
        const list = snapshot.val() || [];
        for (let i = 0; i < 9; i++) {
            document.getElementById(`queue-next-${i+1}`).textContent = list[i] || '-';
        }
    });
}

// ---------------------
// NOTIF SUARA
// ---------------------
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;

    window.speechSynthesis.speak(speech);
}
