# ScheduAlgo

**Visualize • Learn • Experiment**

ScheduAlgo is a browser-based CPU scheduling algorithm simulator. Pick an algorithm, add processes, and instantly see the resulting schedule, Gantt chart, and performance metrics — all computed live in the browser with no backend required.


## Features

- **Four scheduling algorithms**
  - First Come First Serve (FCFS)
  - Shortest Job First — Non-Preemptive (SJF-NP)
  - Shortest Job First — Preemptive / Shortest Remaining Time First (SRTF)
  - Round Robin (with configurable time quantum)
- **Dynamic process list** — add and remove processes on the fly, with input validation (no negative arrival times, no zero/negative burst times).
- **Live results table** — Completion Time, Turnaround Time, and Waiting Time computed for every process.
- **Gantt chart** — proportionally-sized, color-coded execution timeline, including idle CPU gaps.
- **Key metrics** — Average Waiting Time, Average Turnaround Time, CPU Utilization, Throughput, Total Processes, and Total Time.
- **Clear All / Reset controls** — Clear All wipes the process list only; Reset restores the entire simulator to its initial state.
- **Persistence** — your process list, chosen algorithm, and time quantum are saved to `localStorage`, so a page refresh won't lose your work.
- **Light / dark theme toggle** (sun icon, top-right).
- **Fully responsive**, matching the original design mockups pixel-for-pixel.

## Project Structure

```
schedualgo/
├── index.html          # App markup
├── CSS/
│   └── styles.css      # All styling (light + dark themes)
├── JS/
│   └── app.js           # App state, scheduling algorithms, rendering logic
└── README.md
```

## Getting Started

No build step or dependencies — it's plain HTML/CSS/JS.

1. Download/clone the project folder.
2. Open `index.html` directly in your browser, **or** serve it locally:
   ```bash
   cd schedualgo
   python3 -m http.server 8000
   ```
   then visit `http://localhost:8000`.

## How to Use

1. **Choose Algorithm** — select FCFS, SJF (Non-Preemptive), SJF (Preemptive/SRTF), or Round Robin from the dropdown. Round Robin reveals an extra **Time Quantum** field.
2. **Add Process** — enter Arrival Time and Burst Time (and Time Quantum for Round Robin), then click **+ Add Process**. Repeat for as many processes as you like.
3. **Process List** — review added processes; delete any row with the trash icon, use **Clear All** to empty the list, or **Reset** to start completely fresh.
4. **Start Simulation** — click to run the selected algorithm. The right-hand panel populates with:
   - the per-process results table,
   - the Gantt chart of execution order,
   - and the aggregate performance metrics.

## Algorithm Notes

| Algorithm | Type | Tie-breaker |
|---|---|---|
| FCFS | Non-preemptive | Earlier arrival wins; ties broken by insertion order |
| SJF (Non-Preemptive) | Non-preemptive | Shortest burst time among arrived processes; ties by arrival, then insertion order |
| SJF (Preemptive / SRTF) | Preemptive | Shortest **remaining** time, re-evaluated at every time unit |
| Round Robin | Preemptive, fixed quantum | Circular queue in arrival order; newly-arrived processes join the queue before a process that just used up its quantum re-joins |

All four implementations were validated against standard OS-textbook scheduling examples to confirm correct completion/turnaround/waiting time output.

## Metrics Formulas

- **Waiting Time** = Turnaround Time − Burst Time
- **Turnaround Time** = Completion Time − Arrival Time
- **CPU Utilization** = (Sum of Burst Times ÷ Total Time) × 100
- **Throughput** = Total Processes ÷ Total Time

## Author

**Zaid Inamdar**
- GitHub: [github.com/Zaidcodes19](https://github.com/Zaidcodes19)
- LinkedIn: [linkedin.com/in/zaid-inamdar](https://www.linkedin.com/in/zaid-inamdar/)
- Email: inamdarzaid587@gmail.com

## License

© 2026 Zaid Inamdar. All Rights Reserved.
