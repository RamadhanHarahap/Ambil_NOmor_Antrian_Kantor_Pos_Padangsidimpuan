document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi tanggal & waktu
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load nama instansi & teks berjalan
    loadInstansi();
    loadRunningText();
    loadQueueStatus();

    // Event listeners
    setupSidebar();
    setupAdminActions();
});

// --------------------
// TANGGAL & WAKTU
// --------------------
function updateDateTime() {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const dateString = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    document.getElementById('admin-current-time').textContent = timeString;
    document.getElementById('admin-current-date').textContent = dateString;
}

// --------------------
// LOAD NAMA INSTANSI
// --------------------
function loadInstansi() {
    firebase.database().ref('settings/instansiNama').on('value', snapshot => {
        document.getElementById('admin-instansi-nama').textContent = snapshot.val() || 'Kantor Pos Padangsidimpuan';
    });
}

// --------------------
// LOAD RUNNING TEXT
// --------------------
function loadRunningText() {
    firebase.database().ref('settings/runningText').on('value', snapshot => {
        document.getElementById('running-text-input').value = snapshot.val() || '';
    });
}

// --------------------
// LOAD STATUS ANTRIAN
// --------------------
function loadQueueStatus() {
    const currentRef = firebase.database().ref('antrian/current');
    const nextRef = firebase.database().ref('antrian/next');
    const noteRef = firebase.database().ref('antrian/queueNote');

    currentRef.on('value', snap => {
        document.getElementById('admin-current-number').textContent = snap.val() || '-';
    });
    nextRef.on('value', snap => {
        const queue = snap.val() || [];
        document.getElementById('remaining-queue').textContent = queue.length;
        document.getElementById('total-queue').textContent = queue.length; // bisa dikembangkan
    });
    noteRef.on('value', snap => {
        document.getElementById('queue-note-input').value = snap.val() || '';
    });
}

// --------------------
// SIDEBAR SWITCH
// --------------------
function setupSidebar() {
    const buttons = document.querySelectorAll('.sidebar-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(btn.dataset.target).classList.add('active');
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        location.reload(); // sederhana, bisa pakai auth Firebase
    });
}

// --------------------
// ADMIN ACTIONS
// --------------------
function setupAdminActions() {
    document.getElementById('call-next-btn').addEventListener('click', callNextQueue);
    document.getElementById('reset-queue-btn').addEventListener('click', resetQueue);
    document.getElementById('update-note-btn').addEventListener('click', updateQueueNote);
    document.getElementById('save-display-settings').addEventListener('click', saveDisplaySettings);
}

// Panggil nomor berikutnya
function callNextQueue() {
    const nextRef = firebase.database().ref('antrian/next');
    const currentRef = firebase.database().ref('antrian/current');

    nextRef.transaction(queue => {
        if (!queue || queue.length === 0) return queue;
        const nextNumber = queue.shift();
        currentRef.set(nextNumber);
        return queue;
    });
}

// Reset antrian
function resetQueue() {
    if(confirm('Yakin ingin mereset semua antrian?')) {
        firebase.database().ref('antrian/next').set([]);
        firebase.database().ref('antrian/current').set(null);
        firebase.database().ref('antrian/queueNote').set('');
    }
}

// Update catatan antrian
function updateQueueNote() {
    const note = document.getElementById('queue-note-input').value;
    firebase.database().ref('antrian/queueNote').set(note);
}

// Simpan pengaturan tampilan
function saveDisplaySettings() {
    const instansiName = document.getElementById('instansi-name-input').value;
    const runningText = document.getElementById('running-text-input').value;

    firebase.database().ref('settings/instansiNama').set(instansiName);
    firebase.database().ref('settings/runningText').set(runningText);

    alert('Pengaturan tampilan berhasil disimpan!');
}
