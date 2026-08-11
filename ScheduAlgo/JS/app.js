/* =========================================================
   ScheduAlgo — CPU Scheduling Algorithm Simulator
   Author: Zaid Inamdar
   ========================================================= */

/* ---------- Storage Keys ---------- */
const STORAGE_KEYS = {
  processes: "scheduAlgo_processes",
  algorithm: "scheduAlgo_algorithm",
  quantum: "scheduAlgo_quantum",
  theme: "scheduAlgo_theme",
};

/* ---------- Color palette for Gantt bars (cycled per process) ---------- */
const GANTT_PALETTE = [
  "#7FFFD4", // aquamarine
  "#FFF9A8", // pale yellow
  "#78FC78", // light green
  "#D58CFF", // light purple
  "#89CFF0", // light blue
  "#FFB6B9", // light pink
  "#FFD59E", // light orange
  "#B5EAD7", // mint
];
const IDLE_COLOR = "#E0E0E0";

/* ---------- App State ---------- */
let processes = loadProcesses();
let selectedAlgorithm = localStorage.getItem(STORAGE_KEYS.algorithm) || "";
let timeQuantum = Number(localStorage.getItem(STORAGE_KEYS.quantum)) || 2;

/* ---------- DOM References ---------- */
const dropdown = document.getElementById("algorithm");
const algoForm = document.getElementById("AlgoForm");
const algoHelperText = document.getElementById("algoHelperText");
const addProcessHelperText = document.getElementById("addProcessHelperText");

const tableBody = document.getElementById("tableBody");

const clearAllBtn = document.getElementById("clearAllBtn");
const resetBtn = document.getElementById("resetBtn");
const startBtn = document.getElementById("startSimulationBtn");
const themeToggle = document.getElementById("themeToggle");

const resultsTableWrapper = document.getElementById("resultsTableWrapper");
const resultsTableBody = document.getElementById("resultsTableBody");
const resultsEmptyMsg = document.getElementById("resultsEmptyMsg");

const ganttWrapper = document.getElementById("ganttWrapper");
const ganttContainer = document.getElementById("ganttContainer");
const ganttTimeline = document.getElementById("ganttTimeline");
const ganttEmptyMsg = document.getElementById("ganttEmptyMsg");

const avgWaitingTimeEl = document.getElementById("avgWaitingTime");
const avgTurnaroundTimeEl = document.getElementById("avgTurnaroundTime");
const cpuUtilizationEl = document.getElementById("cpuUtilization");
const throughputEl = document.getElementById("throughput");
const totalProcessesEl = document.getElementById("totalProcesses");
const totalTimeEl = document.getElementById("totalTime");

const trashIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#1C1C1C"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;

/* =========================================================
   PERSISTENCE
   ========================================================= */
function loadProcesses() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.processes));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveProcesses() {
  localStorage.setItem(STORAGE_KEYS.processes, JSON.stringify(processes));
}

function saveAlgorithm() {
  localStorage.setItem(STORAGE_KEYS.algorithm, selectedAlgorithm);
}

function saveQuantum() {
  localStorage.setItem(STORAGE_KEYS.quantum, String(timeQuantum));
}

/* =========================================================
   ALGORITHM -> FORM FIELDS
   ========================================================= */
function renderAlgoForm(algorithm) {
  const disabled = !algorithm;

  let extraField = "";
  if (algorithm === "rr") {
    extraField = `
      <div class="inputField">
        <label for="timeQuantum">Time Quantum</label>
        <input type="number" id="timeQuantum" name="timeQuantum" min="1" value="${timeQuantum}" placeholder="eg: 2" required>
      </div>`;
  }

  algoForm.innerHTML = `
    <div class="inputField">
      <label for="arrivalTime">Arrival Time</label>
      <input type="number" id="arrivalTime" name="arrivalTime" min="0" placeholder="eg: 0" ${disabled ? "disabled" : ""} required>
    </div>
    <div class="inputField">
      <label for="burstTime">Burst Time</label>
      <input type="number" id="burstTime" name="burstTime" min="1" placeholder="eg: 3" ${disabled ? "disabled" : ""} required>
    </div>
    ${extraField}
    <div class="inputField">
      <button type="submit" ${disabled ? "disabled" : ""}>+ Add Process</button>
    </div>
  `;

  addProcessHelperText.textContent = disabled
    ? "Add process details here."
    : "Fill in the fields and click “Add Process”.";
}

function algoDisplayName(value) {
  switch (value) {
    case "fcfs":
      return "FCFS (First Come First Serve)";
    case "sjfnp":
      return "SJF Non-Preemptive";
    case "sjf":
      return "SJF Preemptive (SRTF)";
    case "rr":
      return "Round Robin";
    default:
      return "";
  }
}

/* =========================================================
   PROCESS LIST (left panel)
   ========================================================= */
function renderProcessList() {
  tableBody.innerHTML = "";

  if (processes.length === 0) {
    tableBody.innerHTML = `
      <tr class="emptyRow">
        <td colspan="4">
          <div class="emptyMsg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-inbox-icon lucide-inbox">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
            <div>
              <h3>Process list is empty.</h3>
              <p>Add processes to get started.</p>
            </div>
          </div>
        </td>
      </tr>`;
    return;
  }

  processes.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>P${index + 1}</td>
      <td>${p.arrivalTime}</td>
      <td>${p.burstTime}</td>
      <td><button type="button" class="deleteBtn" data-index="${index}" aria-label="Delete P${index + 1}">${trashIconSVG}</button></td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      deleteProcess(idx);
    });
  });
}

function addProcess(arrivalTime, burstTime) {
  processes.push({ arrivalTime, burstTime });
  saveProcesses();
  renderProcessList();
  clearSimulationOutput();
}

function deleteProcess(index) {
  processes.splice(index, 1);
  saveProcesses();
  renderProcessList();
  clearSimulationOutput();
}

function clearAllProcesses() {
  if (processes.length === 0) return;
  processes = [];
  saveProcesses();
  renderProcessList();
  clearSimulationOutput();
}

/* =========================================================
   FULL RESET
   ========================================================= */
function resetApp() {
  processes = [];
  selectedAlgorithm = "";
  timeQuantum = 2;

  localStorage.removeItem(STORAGE_KEYS.processes);
  localStorage.removeItem(STORAGE_KEYS.algorithm);
  localStorage.removeItem(STORAGE_KEYS.quantum);

  dropdown.value = "";
  algoHelperText.textContent = "Select an algorithm to configure the simulation.";
  renderAlgoForm("");
  renderProcessList();
  clearSimulationOutput();
}

/* =========================================================
   SIMULATION OUTPUT (right panel) — clear / empty states
   ========================================================= */
function clearSimulationOutput() {
  resultsTableWrapper.classList.add("hidden");
  resultsEmptyMsg.classList.remove("hidden");
  resultsTableBody.innerHTML = "";

  ganttContainer.classList.add("hidden");
  ganttTimeline.classList.add("hidden");
  ganttEmptyMsg.classList.remove("hidden");
  ganttContainer.innerHTML = "";
  ganttTimeline.innerHTML = "";

  avgWaitingTimeEl.textContent = "-";
  avgTurnaroundTimeEl.textContent = "-";
  cpuUtilizationEl.textContent = "-";
  throughputEl.textContent = "-";
  totalProcessesEl.textContent = "-";
  totalTimeEl.textContent = "-";
}

/* =========================================================
   SCHEDULING ALGORITHMS
   Each returns { schedule: [{id,start,end}], results: [{label,arrival,burst,completion,turnaround,waiting}] }
   ========================================================= */
function labelNum(label) {
  return parseInt(label.slice(1), 10);
}

function byLabel(a, b) {
  return labelNum(a.label) - labelNum(b.label);
}

function runFCFS(procs) {
  const indexed = procs.map((p, i) => ({
    label: `P${i + 1}`,
    arrival: p.arrivalTime,
    burst: p.burstTime,
  }));
  const order = [...indexed].sort((a, b) => a.arrival - b.arrival || byLabel(a, b));

  let time = 0;
  const schedule = [];
  const results = [];

  order.forEach((p) => {
    if (p.arrival > time) {
      schedule.push({ id: "Idle", start: time, end: p.arrival });
      time = p.arrival;
    }
    const start = time;
    const end = start + p.burst;
    schedule.push({ id: p.label, start, end });
    time = end;

    const completion = end;
    const turnaround = completion - p.arrival;
    const waiting = turnaround - p.burst;
    results.push({ label: p.label, arrival: p.arrival, burst: p.burst, completion, turnaround, waiting });
  });

  results.sort(byLabel);
  return { schedule, results };
}

function runSJFNonPreemptive(procs) {
  const indexed = procs.map((p, i) => ({
    label: `P${i + 1}`,
    arrival: p.arrivalTime,
    burst: p.burstTime,
    done: false,
  }));
  const n = indexed.length;
  let time = 0;
  let completedCount = 0;
  const schedule = [];
  const results = [];

  while (completedCount < n) {
    const available = indexed.filter((p) => !p.done && p.arrival <= time);

    if (available.length === 0) {
      const remaining = indexed.filter((p) => !p.done);
      const nextArrival = Math.min(...remaining.map((p) => p.arrival));
      schedule.push({ id: "Idle", start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival || byLabel(a, b));
    const p = available[0];

    const start = time;
    const end = start + p.burst;
    schedule.push({ id: p.label, start, end });
    time = end;
    p.done = true;
    completedCount++;

    const completion = end;
    const turnaround = completion - p.arrival;
    const waiting = turnaround - p.burst;
    results.push({ label: p.label, arrival: p.arrival, burst: p.burst, completion, turnaround, waiting });
  }

  results.sort(byLabel);
  return { schedule, results };
}

function runSRTF(procs) {
  // Preemptive Shortest Job First (Shortest Remaining Time First)
  const indexed = procs.map((p, i) => ({
    label: `P${i + 1}`,
    arrival: p.arrivalTime,
    burst: p.burstTime,
    remaining: p.burstTime,
  }));
  const n = indexed.length;
  let time = 0;
  let completed = 0;
  const schedule = [];
  const completionTime = {};

  let currentLabel = null;
  let segStart = 0;

  const closeSegment = (endTime) => {
    if (currentLabel !== null) {
      schedule.push({ id: currentLabel, start: segStart, end: endTime });
      currentLabel = null;
    }
  };

  while (completed < n) {
    const available = indexed.filter((p) => p.arrival <= time && p.remaining > 0);

    if (available.length === 0) {
      closeSegment(time);
      const remaining = indexed.filter((p) => p.remaining > 0);
      const nextArrival = Math.min(...remaining.map((p) => p.arrival));
      if (nextArrival > time) {
        schedule.push({ id: "Idle", start: time, end: nextArrival });
      }
      time = nextArrival;
      continue;
    }

    available.sort((a, b) => a.remaining - b.remaining || a.arrival - b.arrival || byLabel(a, b));
    const p = available[0];

    if (currentLabel !== p.label) {
      closeSegment(time);
      currentLabel = p.label;
      segStart = time;
    }

    p.remaining -= 1;
    time += 1;

    if (p.remaining === 0) {
      completed++;
      completionTime[p.label] = time;
    }
  }
  closeSegment(time);

  const results = indexed
    .map((p) => {
      const completion = completionTime[p.label];
      const turnaround = completion - p.arrival;
      const waiting = turnaround - p.burst;
      return { label: p.label, arrival: p.arrival, burst: p.burst, completion, turnaround, waiting };
    })
    .sort(byLabel);

  return { schedule, results };
}

function runRoundRobin(procs, quantum) {
  const indexed = procs.map((p, i) => ({
    label: `P${i + 1}`,
    arrival: p.arrivalTime,
    burst: p.burstTime,
    remaining: p.burstTime,
  }));
  const n = indexed.length;
  const byArrival = [...indexed].sort((a, b) => a.arrival - b.arrival || byLabel(a, b));

  let time = 0;
  let ptr = 0;
  const queue = [];
  const schedule = [];
  const completionTime = {};

  const pushArrivals = (uptoTime) => {
    while (ptr < n && byArrival[ptr].arrival <= uptoTime) {
      queue.push(byArrival[ptr]);
      ptr++;
    }
  };

  if (byArrival.length) {
    time = byArrival[0].arrival;
    pushArrivals(time);
  }

  while (queue.length > 0) {
    const p = queue.shift();
    const start = time;
    const exec = Math.min(quantum, p.remaining);
    time += exec;
    p.remaining -= exec;
    schedule.push({ id: p.label, start, end: time });

    pushArrivals(time);

    if (p.remaining > 0) {
      queue.push(p);
    } else {
      completionTime[p.label] = time;
    }

    if (queue.length === 0 && ptr < n) {
      const nextArrival = byArrival[ptr].arrival;
      if (nextArrival > time) {
        schedule.push({ id: "Idle", start: time, end: nextArrival });
      }
      time = Math.max(time, nextArrival);
      pushArrivals(time);
    }
  }

  // merge back-to-back segments belonging to the same process
  const merged = [];
  schedule.forEach((seg) => {
    const last = merged[merged.length - 1];
    if (last && last.id === seg.id && last.end === seg.start) {
      last.end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  });

  const results = indexed
    .map((p) => {
      const completion = completionTime[p.label];
      const turnaround = completion - p.arrival;
      const waiting = turnaround - p.burst;
      return { label: p.label, arrival: p.arrival, burst: p.burst, completion, turnaround, waiting };
    })
    .sort(byLabel);

  return { schedule: merged, results };
}

/* =========================================================
   METRICS
   ========================================================= */
function computeMetrics(results, schedule) {
  const n = results.length;
  const totalWaiting = results.reduce((s, r) => s + r.waiting, 0);
  const totalTurnaround = results.reduce((s, r) => s + r.turnaround, 0);
  const totalBurst = results.reduce((s, r) => s + r.burst, 0);
  const totalTime = schedule.length ? schedule[schedule.length - 1].end : 0;

  return {
    avgWaiting: n ? totalWaiting / n : 0,
    avgTurnaround: n ? totalTurnaround / n : 0,
    cpuUtilization: totalTime ? (totalBurst / totalTime) * 100 : 0,
    throughput: totalTime ? n / totalTime : 0,
    totalProcesses: n,
    totalTime,
  };
}

/* =========================================================
   RENDER: RESULTS TABLE
   ========================================================= */
function renderResultsTable(results) {
  resultsTableBody.innerHTML = "";
  results.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.label}</td>
      <td>${r.arrival}</td>
      <td>${r.burst}</td>
      <td>${r.completion}</td>
      <td>${r.turnaround}</td>
      <td>${r.waiting}</td>
    `;
    resultsTableBody.appendChild(tr);
  });
  resultsTableWrapper.classList.remove("hidden");
  resultsEmptyMsg.classList.add("hidden");
}

/* =========================================================
   RENDER: GANTT CHART
   ========================================================= */
function renderGanttChart(schedule) {
  ganttContainer.innerHTML = "";
  ganttTimeline.innerHTML = "";

  const colorMap = {};
  let colorIndex = 0;

  schedule.forEach((seg) => {
    const duration = Math.max(seg.end - seg.start, 0.0001);

    const bar = document.createElement("div");
    bar.className = "bar" + (seg.id === "Idle" ? " idle" : "");
    bar.style.flex = `${duration} 0 0`;

    if (seg.id === "Idle") {
      bar.style.backgroundColor = IDLE_COLOR;
    } else {
      if (!(seg.id in colorMap)) {
        colorMap[seg.id] = GANTT_PALETTE[colorIndex % GANTT_PALETTE.length];
        colorIndex++;
      }
      bar.style.backgroundColor = colorMap[seg.id];
    }
    bar.textContent = seg.id;
    ganttContainer.appendChild(bar);

    const tick = document.createElement("span");
    tick.className = "tick";
    tick.style.flex = `${duration} 0 0`;
    tick.textContent = seg.start;
    ganttTimeline.appendChild(tick);
  });

  const endTick = document.createElement("span");
  endTick.className = "tick end";
  endTick.textContent = schedule.length ? schedule[schedule.length - 1].end : 0;
  ganttTimeline.appendChild(endTick);

  ganttContainer.classList.remove("hidden");
  ganttTimeline.classList.remove("hidden");
  ganttEmptyMsg.classList.add("hidden");
}

/* =========================================================
   RENDER: METRICS
   ========================================================= */
function renderMetrics(metrics) {
  avgWaitingTimeEl.textContent = metrics.avgWaiting.toFixed(2);
  avgTurnaroundTimeEl.textContent = metrics.avgTurnaround.toFixed(2);
  cpuUtilizationEl.textContent = `${metrics.cpuUtilization.toFixed(2)}%`;
  throughputEl.textContent = `${metrics.throughput.toFixed(2)} process/unit time`;
  totalProcessesEl.textContent = metrics.totalProcesses;
  totalTimeEl.textContent = metrics.totalTime;
}

/* =========================================================
   RUN SIMULATION
   ========================================================= */
function startSimulation() {
  if (!selectedAlgorithm) {
    alert("Please choose a scheduling algorithm first.");
    return;
  }
  if (processes.length === 0) {
    alert("Please add at least one process first.");
    return;
  }

  let outcome;
  switch (selectedAlgorithm) {
    case "fcfs":
      outcome = runFCFS(processes);
      break;
    case "sjfnp":
      outcome = runSJFNonPreemptive(processes);
      break;
    case "sjf":
      outcome = runSRTF(processes);
      break;
    case "rr":
      outcome = runRoundRobin(processes, timeQuantum);
      break;
    default:
      return;
  }

  const { schedule, results } = outcome;
  const metrics = computeMetrics(results, schedule);

  renderResultsTable(results);
  renderGanttChart(schedule);
  renderMetrics(metrics);
}

/* =========================================================
   THEME TOGGLE
   ========================================================= */
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || "light";
  applyTheme(saved);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme") || "light";
    applyTheme(current === "light" ? "dark" : "light");
  });
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */
dropdown.addEventListener("change", (event) => {
  selectedAlgorithm = event.target.value;
  saveAlgorithm();
  algoHelperText.textContent = selectedAlgorithm
    ? `Configuring: ${algoDisplayName(selectedAlgorithm)}`
    : "Select an algorithm to configure the simulation.";
  renderAlgoForm(selectedAlgorithm);
  clearSimulationOutput();
});

algoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(algoForm));
  const arrivalTime = Number(formData.arrivalTime);
  const burstTime = Number(formData.burstTime);

  if (Number.isNaN(arrivalTime) || arrivalTime < 0) {
    alert("Please enter a valid arrival time (0 or greater).");
    return;
  }
  if (Number.isNaN(burstTime) || burstTime <= 0) {
    alert("Please enter a valid burst time (greater than 0).");
    return;
  }

  if (selectedAlgorithm === "rr") {
    const quantum = Number(formData.timeQuantum);
    if (Number.isNaN(quantum) || quantum <= 0) {
      alert("Please enter a valid time quantum (greater than 0).");
      return;
    }
    timeQuantum = quantum;
    saveQuantum();
  }

  addProcess(arrivalTime, burstTime);
  algoForm.reset();
  // re-apply the (possibly updated) quantum value as default for the next entry
  if (selectedAlgorithm === "rr") {
    const quantumInput = document.getElementById("timeQuantum");
    if (quantumInput) quantumInput.value = timeQuantum;
  }
  document.getElementById("arrivalTime")?.focus();
});

clearAllBtn.addEventListener("click", clearAllProcesses);
resetBtn.addEventListener("click", resetApp);
startBtn.addEventListener("click", startSimulation);

/* =========================================================
   INIT
   ========================================================= */
function init() {
  initTheme();

  dropdown.value = selectedAlgorithm;
  algoHelperText.textContent = selectedAlgorithm
    ? `Configuring: ${algoDisplayName(selectedAlgorithm)}`
    : "Select an algorithm to configure the simulation.";
  renderAlgoForm(selectedAlgorithm);
  renderProcessList();
  clearSimulationOutput();
}

init();
