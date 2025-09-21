// ======================
// script.js - Realtime Firebase
// ======================

// Import Firebase (pastikan <script type="module"> di index.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
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
// DOM Loaded
// ======================
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadSettings();
    initializeSlideshow();
    setupRealtimeQueue();
});

// ======================
// Tanggal & Waktu
// ======================
function updateDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;

    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    document.getElementById('current-date').textContent = `${day}, ${date} ${month} ${year}`;
}

// ======================
// Load Settings
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
function initializeSlideshow() {
    const slideshowContainer = document.getElementById('slideshow');
    const dotsContainer = document.getElementById('dots-container');
    
    let slides = JSON.parse(localStorage.getItem("slides")) || [
        { src: "assets/slide1.jpg" },
        { src: "assets/slide2.jpg" },
        { src: "assets/slide3.jpg" }
    ];

    slideshowContainer.innerHTML = '';
    dotsContainer.innerHTML = '';

    slides.forEach((slide,index) => {
        const img = document.createElement('img');
        img.src = slide.src;
        img.className = 'slide';
        if(index===0) img.classList.add('active');
        slideshowContainer.appendChild(img);

        const dot = document.createElement('div');
        dot.className = 'dot';
        if(index===0) dot.classList.add('active');
        dot.addEventListener('click', ()=>goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    if(slides.length>1) startSlideshow();
}

let slideshowInterval;
let currentSlide = 0;

function startSlideshow() {
    slideshowInterval = setInterval(nextSlide,5000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (currentSlide+1)%slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index){
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
// Realtime Queue
// ======================
function setupRealtimeQueue() {
    const antrianRef = ref(database, 'antrian');

    onValue(antrianRef, snapshot => {
        const data = snapshot.val();
        if(!data) return;

        const semuaAntrian = Object.values(data).sort((a,b)=>a.waktu - b.waktu);
        const currentQueue = semuaAntrian[0]?.nomorAntrian || '-';
        document.getElementById('current-queue-number').textContent = String(currentQueue).padStart(3,'0');

        const queueNote = 'Silakan menuju loket yang tersedia.';
        document.getElementById('queue-note').textContent = queueNote;

        for(let i=0;i<9;i++){
            const queueItem = document.getElementById(`queue-next-${i+1}`);
            queueItem.textContent = semuaAntrian[i+1]? String(semuaAntrian[i+1].nomorAntrian).padStart(3,'0') : '-';
        }

        // Suara jika ada nomor baru dipanggil (opsional)
        if(currentQueue !== '-') speakText(`Nomor antrian ${String(currentQueue).padStart(3,'0')} silakan menuju loket.`);
    });
}

// ======================
// Text-to-Speech
// ======================
function speakText(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'id-ID';
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1.2;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
}
