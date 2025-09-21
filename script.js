// ======================
// script.js - Terhubung Firebase Realtime Database
// ======================

// Import Firebase (pastikan script type="module" di index.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";

// ======================
// Inisialisasi Firebase
// ======================
const firebaseConfig = {
  apiKey: "AIzaSyATmw7Oy0dd1ETEbcThKGM1CDznzFX7v_c",
  authDomain: "antriankantorpos.firebaseapp.com",
  databaseURL: "https://antriankantorpos-default-rtdb.firebaseio.com",
  projectId: "antriankantorpos",
  storageBucket: "antriankantorpos.firebasestorage.app",
  messagingSenderId: "906149591966",
  appId: "1:906149591966:web:cc342da74f2065e41f748f",
  measurementId: "G-0ZLZT3CKK6"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// ======================
// Event DOM Loaded
// ======================
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadSettings();
    initializeSlideshow();
    loadQueueData();
});

// ======================
// Tanggal & Waktu
// ======================
function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;

    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// ======================
// Load Settings (nama instansi & running text)
// ======================
function loadSettings() {
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    document.getElementById('instansi-nama').textContent = instansiNama;

    const runningText = localStorage.getItem('runningText') || 'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda sesuai keperluan Anda.';
    document.getElementById('running-text').textContent = runningText;
}

// ======================
// Slideshow
// ======================
let slideshowInterval;
let currentSlide = 0;

function initializeSlideshow() {
    const slideshowContainer = document.getElementById('slideshow');
    const dotsContainer = document.getElementById('dots-container');
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
        slideshowContainer.appendChild(slideElement);

        const dotElement = document.createElement('div');
        dotElement.className = 'dot';
        if (index === 0) dotElement.classList.add('active');
        dotElement.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dotElement);
    });

    if (slides.length > 1) startSlideshow();
}

function startSlideshow() {
    slideshowInterval = setInterval(() => nextSlide(), 5000);
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

// ======================
// Firebase Queue Data
// ======================
function loadQueueData() {
    const antrianRef = ref(database, 'antrian');
    onValue(antrianRef, (snapshot) => {
        const data = snapshot.val();
        let nomorTerakhir = 0;
        let queueList = [];

        if (data) {
            const semuaData = Object.values(data);
            semuaData.sort((a,b) => a.waktu - b.waktu);
            queueList = semuaData.map(item => item.nomorAntrian);
            nomorTerakhir = queueList[queueList.length-1] || 0;
        }

        document.getElementById('current-queue-number').textContent = nomorTerakhir;
        document.getElementById('queue-note').textContent = 'Silakan menuju loket yang tersedia.';

        for (let i=0; i<9; i++) {
            const queueItem = document.getElementById(`queue-next-${i+1}`);
            if(queueItem) queueItem.textContent = queueList[i+1] || '-';
        }
    });
}

// ======================
// Tambah Nomor Antrian
// ======================
export function tambahNomorAntrian(nomor) {
    const antrianRef = ref(database, 'antrian');
    const newAntrianRef = push(antrianRef);
    set(newAntrianRef, {
        nomorAntrian: nomor,
        waktu: Date.now()
    }).then(() => {
        console.log("Nomor antrian berhasil ditambahkan:", nomor);
    }).catch((err) => {
        console.error("Gagal menambahkan nomor antrian:", err);
    });
}

// ======================
// Text-to-Speech
// ======================
export function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}
