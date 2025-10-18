const INSTRUCTIONS = [
    {step: 1, value: 6, description: "Pindah ke posisi -4", from: -10, to: -4},
    {step: 2, value: 3, description: "Pindah ke posisi -1", from: -4, to: -1},
    {step: 3, value: 5, description: "Pindah ke posisi 4", from: -1, to: 4},
    {step: 4, value: -2, description: "Pindah ke posisi 2", from: 4, to: 2},
    {step: 5, value: 4, description: "Pindah ke posisi 6", from: 2, to: 6},
    {step: 6, value: -1, description: "Pindah ke posisi 5", from: 6, to: 5},
    {step: 7, value: 3, description: "Pindah ke posisi 8", from: 5, to: 8},
    {step: 8, value: 2, description: "Pindah ke posisi 10", from: 8, to: 10}
];

let currentStep = 0;
let playerPosition = -10;
let correctCount = 0;
let timer = 20;
let timerInterval = null;
let isWaitingForMove = false;

// Generate pilihan gerakan berdasarkan instruksi
function generateMoveOptions(correctValue) {
    const options = new Set([correctValue]);
    
    // Tambahkan pilihan yang salah
    const possibleValues = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    while (options.size < 10) {
        const randomValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        options.add(randomValue);
    }
    
    // Konversi ke array dan acak
    return Array.from(options).sort(() => Math.random() - 0.5);
}

function initNumberLine() {
    const numberLine = document.getElementById('numberLine');
    
    // Clear existing content except player
    const existingPoints = numberLine.querySelectorAll('.number-point');
    existingPoints.forEach(point => point.remove());
    
    for (let i = -10; i <= 10; i++) {
        const point = document.createElement('div');
        point.className = 'number-point';
        point.innerHTML = `
            <div class="point" data-position="${i}"></div>
            <div class="number ${i === 0 ? 'zero' : ''}">${i}</div>
        `;
        numberLine.appendChild(point);
    }
    updatePlayerPosition();
}

function updatePlayerPosition() {
    const player = document.getElementById('player');
    const points = document.querySelectorAll('.point');
    
    // Batasi posisi untuk display (tapi tetap simpan nilai asli untuk validasi)
    let displayPosition = playerPosition;
    if (displayPosition < -10) displayPosition = -10;
    if (displayPosition > 10) displayPosition = 10;
    
    const targetPoint = points[displayPosition + 10];
    
    if (targetPoint) {
        const numberLine = document.querySelector('.number-line');
        const lineRect = numberLine.getBoundingClientRect();
        const pointRect = targetPoint.getBoundingClientRect();
        
        const leftPosition = pointRect.left - lineRect.left + (pointRect.width / 2);
        player.style.left = leftPosition + 'px';
    }
    
    // Display menunjukkan posisi yang dibatasi
    document.getElementById('currentPosition').textContent = displayPosition;
}

function startGame() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('movementButtons').style.display = 'grid';
    currentStep = 0;
    correctCount = 0;
    playerPosition = -10;
    updatePlayerPosition();
    updateInfo();
    
    // Scroll ke posisi awal (-10)
    setTimeout(() => {
        scrollToPosition(-10);
    }, 100);
    
    nextInstruction();
}

function nextInstruction() {
    if (currentStep >= INSTRUCTIONS.length) {
        endGame();
        return;
    }

    const instruction = INSTRUCTIONS[currentStep];
    const instructionBox = document.getElementById('instructionBox');
    
    instructionBox.innerHTML = `
        <div class="instruction-title">Langkah ${instruction.step} dari 8</div>
        <div class="instruction-text">${instruction.description}</div>
        <div class="timer" id="timer">20</div>
    `;

    // Generate tombol gerakan berdasarkan instruksi saat ini
    generateButtons(instruction.value);

    timer = 20;
    isWaitingForMove = true;
    enableButtons();
    highlightTargetPosition(instruction.to);
    
    // Scroll untuk menampilkan posisi player dan target
    setTimeout(() => {
        scrollToPosition(instruction.to);
    }, 100);
    
    timerInterval = setInterval(() => {
        timer--;
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = timer;
            
            // Ubah warna timer saat waktu hampir habis
            if (timer <= 5) {
                timerElement.style.color = '#ff6b6b';
            }
        }
        
        if (timer <= 0) {
            clearInterval(timerInterval);
            if (isWaitingForMove) {
                // Waktu habis, anggap salah (steps = 0 karena tidak memilih)
                checkPosition(playerPosition, 0);
            }
        }
    }, 1000);
}

function generateButtons(correctValue) {
    const movementButtons = document.getElementById('movementButtons');
    const options = generateMoveOptions(correctValue);
    
    movementButtons.innerHTML = '';
    
    options.forEach(value => {
        const button = document.createElement('button');
        button.className = 'btn-move';
        button.textContent = value >= 0 ? `+${value}` : value;
        button.onclick = () => movePlayer(value);
        movementButtons.appendChild(button);
    });
}

function movePlayer(steps) {
    if (!isWaitingForMove) return;
    
    clearInterval(timerInterval);
    isWaitingForMove = false;
    disableButtons();
    
    // Simpan posisi lama untuk validasi
    const oldPosition = playerPosition;
    
    // Update posisi tanpa batasan untuk validasi yang akurat
    playerPosition = oldPosition + steps;
    
    updatePlayerPosition();
    
    setTimeout(() => {
        checkPosition(playerPosition, steps);
    }, 900);
}

function checkPosition(position, steps) {
    const instruction = INSTRUCTIONS[currentStep];
    const correctPos = instruction.to;
    const correctSteps = instruction.value;
    
    // Validasi harus tepat: posisi DAN langkah harus benar
    const isCorrect = (position === correctPos) && (steps === correctSteps);
    
    if (isCorrect) {
        correctCount++;
        showFeedback('✅ Benar!', 'linear-gradient(135deg, #62ef5fff, #279112ff)');
    } else {
        showFeedback(`💥 Salah! Seharusnya ${correctSteps >= 0 ? '+' : ''}${correctSteps} ke posisi ${correctPos}`, 'linear-gradient(135deg, #fa5b5bff, #800316ff)');
        document.getElementById('player').classList.add('explode');
        
        setTimeout(() => {
            document.getElementById('player').classList.remove('explode');
            playerPosition = correctPos;
            updatePlayerPosition();
            
            // Scroll untuk menampilkan posisi baru player
            setTimeout(() => {
                if (currentStep < INSTRUCTIONS.length - 1) {
                    scrollToPosition(INSTRUCTIONS[currentStep + 1].to);
                }
            }, 100);
        }, 600);
    }
    
    currentStep++;
    updateInfo();
    
    setTimeout(() => {
        removeHighlight();
        nextInstruction();
    }, 2000);
}

function showFeedback(message, color) {
    const instructionBox = document.getElementById('instructionBox');
    instructionBox.style.background = color;
    instructionBox.innerHTML = `<div class="instruction-text">${message}</div>`;
}

function highlightTargetPosition(position) {
    const points = document.querySelectorAll('.point');
    const targetPoint = points[position + 10];
    if (targetPoint) {
        targetPoint.classList.add('highlight');
        
        // Auto scroll ke posisi target
        scrollToPosition(position);
    }
}

function scrollToPosition(position) {
    const container = document.querySelector('.number-line-container');
    const numberLine = document.querySelector('.number-line');
    const points = document.querySelectorAll('.number-point');
    
    if (!container || !numberLine || points.length === 0) return;
    
    // Hitung range yang harus terlihat (posisi player dan target)
    const currentPos = playerPosition;
    const targetPos = position;
    
    const minPos = Math.min(currentPos, targetPos);
    const maxPos = Math.max(currentPos, targetPos);
    
    // Ambil elemen untuk posisi minimum dan maksimum
    const minPoint = points[minPos + 10];
    const maxPoint = points[maxPos + 10];
    
    if (minPoint && maxPoint) {
        const containerWidth = container.clientWidth;
        const minLeft = minPoint.offsetLeft;
        const maxLeft = maxPoint.offsetLeft;
        const maxWidth = maxPoint.offsetWidth;
        
        // Hitung tengah dari range
        const rangeCenter = (minLeft + maxLeft + maxWidth) / 2;
        
        // Hitung scroll position agar kedua titik terlihat
        const scrollLeft = rangeCenter - (containerWidth / 2);
        
        // Smooth scroll
        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }
}

function removeHighlight() {
    document.querySelectorAll('.point.highlight').forEach(p => p.classList.remove('highlight'));
}

function updateInfo() {
    document.getElementById('currentStep').textContent = `${currentStep}/8`;
    document.getElementById('correctCount').textContent = correctCount;
}

function enableButtons() {
    document.querySelectorAll('.btn-move').forEach(btn => btn.disabled = false);
}

function disableButtons() {
    document.querySelectorAll('.btn-move').forEach(btn => btn.disabled = true);
}

function endGame() {
    clearInterval(timerInterval);
    disableButtons();
    
    let level, code, badgeClass;
    if (correctCount < 4) {
        level = 'Inferior';
        code = 'KK1042';
        badgeClass = 'level-inferior';
    } else if (correctCount <= 6) {
        level = 'Reguler';
        code = 'KK2056';
        badgeClass = 'level-reguler';
    } else {
        level = 'Superior';
        code = 'KK3063';
        badgeClass = 'level-superior';
    }
    
    document.getElementById('finalScore').textContent = correctCount;
    document.getElementById('levelBadge').textContent = `Level ${level}`;
    document.getElementById('levelBadge').className = `level-badge ${badgeClass}`;
    document.getElementById('accessCode').textContent = code;
    document.getElementById('resultModal').classList.add('show');
    
    document.getElementById('instructionBox').style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    document.getElementById('instructionBox').innerHTML = `
        <div class="instruction-title">Permainan Selesai!</div>
        <div class="instruction-text">Skor Akhir: ${correctCount}/8</div>
    `;
    
    document.getElementById('movementButtons').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
}

// Handle window resize
window.addEventListener('resize', () => {
    updatePlayerPosition();
});

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    initNumberLine();
});