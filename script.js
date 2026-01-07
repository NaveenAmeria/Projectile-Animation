const ctx = document.getElementById('trajectoryChart').getContext('2d');


const g = 9.8;


const angleRange = document.getElementById('angleRange');
const angleInput = document.getElementById('angleInput');
const velocityRange = document.getElementById('velocityRange');
const velocityInput = document.getElementById('velocityInput');
const unitSelect = document.getElementById('unitSelect');


const rangeValue = document.getElementById('rangeValue');
const heightValue = document.getElementById('heightValue');
const timeValue = document.getElementById('timeValue');


let velocityMS = 20; 
let fullTrajectory = [];
let animationIndex = 0;
let animationId = null;


function calculateTrajectory(angleDeg, velocity) {
  const angleRad = angleDeg * Math.PI / 180;

  const Vx = velocity * Math.cos(angleRad);
  const Vy = velocity * Math.sin(angleRad);

  const timeOfFlight = (2 * Vy) / g;
  const points = [];
  const dt = 0.05;

  for (let t = 0; t <= timeOfFlight; t += dt) {
    const x = Vx * t;
    const y = Vy * t - 0.5 * g * t * t;
    if (y >= 0) points.push({ x, y });
  }

  const range = (velocity * velocity * Math.sin(2 * angleRad)) / g;
  const maxHeight = (Vy * Vy) / (2 * g);


  points.push({ x: range, y: 0 });

  return { points, range, maxHeight, timeOfFlight };
}


const trajectoryChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Projectile Path',
        data: [],
        borderColor: 'cyan',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1
      },
      {
        label: 'Projectile',
        data: [],
        backgroundColor: 'yellow',
        pointRadius: 6,
        showLine: false
      }
    ]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: {
        type: 'linear',
        beginAtZero: true,
        title: { display: true, text: 'Distance', color: '#e5e7eb' }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Height', color: '#e5e7eb' }
      }
    },
    plugins: {
      legend: { labels: { color: '#e5e7eb' } }
    }
  }
});


function animateProjectile() {
  if (animationIndex >= fullTrajectory.length) return;

  trajectoryChart.data.datasets[0].data =
    fullTrajectory.slice(0, animationIndex + 1);

  trajectoryChart.data.datasets[1].data = [
    fullTrajectory[animationIndex]
  ];

  trajectoryChart.update('none');
  animationIndex++;

  animationId = requestAnimationFrame(animateProjectile);
}


function updateGraph() {
  cancelAnimationFrame(animationId);
  animationIndex = 0;

  const angle = parseFloat(angleInput.value);
  const result = calculateTrajectory(angle, velocityMS);

  fullTrajectory = result.points;

  rangeValue.textContent = result.range.toFixed(2);
  heightValue.textContent = result.maxHeight.toFixed(2);
  timeValue.textContent = result.timeOfFlight.toFixed(2);

  trajectoryChart.options.scales.x.max = result.range * 1.1;
  trajectoryChart.options.scales.y.max = result.maxHeight * 1.2;

  trajectoryChart.data.datasets[0].data = [];
  trajectoryChart.data.datasets[1].data = [];

  trajectoryChart.update();
  animateProjectile();
}


function syncAngle(value) {
  angleRange.value = value;
  angleInput.value = value;
  updateGraph();
}

function syncVelocity(displayValue) {
  velocityMS =
    unitSelect.value === 'kmph'
      ? displayValue * (5 / 18)
      : displayValue;

  velocityRange.value = displayValue;
  velocityInput.value = displayValue;

  updateGraph();
}


unitSelect.addEventListener('change', () => {
  let displayValue;

  if (unitSelect.value === 'kmph') {
    displayValue = velocityMS * (18 / 5);
    velocityRange.max = 180;
    velocityInput.max = 180;
  } else {
    displayValue = velocityMS;
    velocityRange.max = 50;
    velocityInput.max = 50;
  }

  velocityRange.value = displayValue.toFixed(1);
  velocityInput.value = displayValue.toFixed(1);
  updateGraph();
});


angleRange.addEventListener('input', e => syncAngle(e.target.value));
angleInput.addEventListener('input', e => syncAngle(e.target.value));
velocityRange.addEventListener('input', e => syncVelocity(parseFloat(e.target.value)));
velocityInput.addEventListener('input', e => syncVelocity(parseFloat(e.target.value)));


updateGraph();



const modal = document.createElement('div');
modal.style.cssText = `
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

modal.innerHTML = `
  <div style="
    background:#020617;
    color:#e5e7eb;
    padding:20px 25px;
    border-radius:10px;
    max-width:420px;
    box-shadow:0 0 20px rgba(0,0,0,0.6);
  ">
    <h3 style="margin-top:0">Projectile Motion Equations</h3>
    <p><strong>Horizontal velocity:</strong><br>Vx = V cosθ</p>
    <p><strong>Vertical velocity:</strong><br>Vy = V sinθ</p>
    <p><strong>Position:</strong><br>
      x = Vx · t<br>
      y = Vy · t − ½ g t²
    </p>
    <p><strong>Time of Flight:</strong><br>
      T = 2Vy / g
    </p>
    <p><strong>Maximum Height:</strong><br>
      H = Vy² / (2g)
    </p>
    <p><strong>Range:</strong><br>
      R = V² sin(2θ) / g
    </p>
    <button id="closeModal"
      style="
        margin-top:10px;
        padding:6px 14px;
        border:none;
        background:#7c3aed;
        color:white;
        border-radius:6px;
        cursor:pointer;
      ">
      Close
    </button>
  </div>
`;

document.body.appendChild(modal);

const eqBtn = document.createElement('button');
eqBtn.textContent = 'Show Equations';
eqBtn.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 16px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  z-index: 999;
`;

document.body.appendChild(eqBtn);

eqBtn.onclick = () => modal.style.display = 'flex';
modal.querySelector('#closeModal').onclick = () => modal.style.display = 'none';

window.addEventListener('resize', () => {
  trajectoryChart.resize();
});
