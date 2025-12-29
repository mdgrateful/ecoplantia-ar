/**
 * ECOPLANTIA AR 2.0 - SUPABASE & VERCEL EDITION
 */

// 1. INITIALIZE SUPABASE
// Replace these with your actual keys from Supabase Settings > API
const SUPABASE_URL = 'https://ccjniauqjowpsvibljsz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjam5pYXVxam93cHN2aWJsanN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjgyNDksImV4cCI6MjA4MjQ0NDI0OX0.qPwWnoGk4iInPDDc4NtqqAtlAmrVOlYibh_1tT-NtMY'; 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class ArCameraElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.selectedPlantIndex = null;
    this.placedPlants = [];
    this.allPlants = []; // Fetched from Supabase
  }

  $(id) { return this.shadowRoot.getElementById(id); }

  async connectedCallback() {
    this.render();
    this.setupEventListeners();
    await this.initSupabaseData();
  }

  async initSupabaseData() {
    this.showHint("Connecting to Ecoplantia DB...");
    const { data, error } = await supabase.from('plants').select('*');
    
    if (error) {
      console.error("Supabase Error:", error);
      this.showHint("Database connection failed.");
      return;
    }

    this.allPlants = data;
    this.buildTray();
    this.showHint("Ready! Select a plant to begin.");
  }

  // --- SAVE FEATURE ---
  async saveCurrentDesign() {
    if (this.placedPlants.length === 0) {
      this.showHint("Add some plants before saving!");
      return;
    }

    const layout = this.placedPlants.map(el => ({
      name: el.dataset.name,
      x: el.style.left,
      y: el.style.top,
      scale: el.style.transform
    }));

    const { error } = await supabase
      .from('garden_designs')
      .insert([{ layout_data: layout }]);

    if (error) {
      this.showHint("Error saving design.");
    } else {
      this.showHint("Design saved to Supabase!");
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; height: 100vh; position: relative; overflow: hidden; font-family: sans-serif; }
        video { width: 100%; height: 100%; object-fit: cover; }
        #plantsOverlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        
        .placed-plant { 
          position: absolute; 
          transform-origin: bottom center; 
          pointer-events: auto; 
          cursor: move;
          transition: filter 0.2s;
        }

        /* UI PANELS */
        .controls { position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; }
        .btn { background: white; border: none; padding: 12px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer; font-size: 18px; }
        .btn-save { background: #4CAF50; color: white; border-radius: 8px; font-weight: bold; padding: 10px 20px; }
        
        #plantTray { 
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          display: flex; gap: 15px; padding: 15px; background: rgba(0,0,0,0.6);
          border-radius: 20px; backdrop-filter: blur(10px); width: 80%; overflow-x: auto;
        }
        .trayPlant { text-align: center; color: white; cursor: pointer; min-width: 60px; }
        .trayPlant img { width: 50px; height: 50px; object-fit: contain; border-radius: 8px; border: 2px solid transparent; }
        .trayPlant.active img { border-color: #4CAF50; transform: scale(1.1); }
        
        #hint { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; }
      </style>

      <video id="v" autoplay playsinline muted></video>
      <div id="plantsOverlay"></div>
      <div id="hint">Loading Camera...</div>

      <div class="controls">
        <button class="btn" id="clearBtn">🗑️</button>
        <button class="btn" id="captureBtn">📸</button>
        <button class="btn btn-save" id="saveBtn">SAVE DESIGN</button>
      </div>

      <div id="plantTray"></div>
    `;
  }

  buildTray() {
    const tray = this.$('plantTray');
    tray.innerHTML = '';
    this.allPlants.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'trayPlant';
      div.innerHTML = `<img src="${p.img}" crossorigin="anonymous"><div>${p.acr}</div>`;
      div.onclick = () => this.selectPlant(i, div);
      tray.appendChild(div);
    });
  }

  selectPlant(index, el) {
    this.shadowRoot.querySelectorAll('.trayPlant').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    this.selectedPlantIndex = index;
    this.showHint(`Tap screen to place ${this.allPlants[index].name}`);
  }

  setupEventListeners() {
    // Camera Init
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => { this.$('v').srcObject = stream; this.showHint("Camera Active"); })
      .catch(() => this.showHint("Camera Access Denied"));

    // Placement
    this.$('v').onclick = (e) => this.placePlant(e.clientX, e.clientY);

    // Buttons
    this.$('clearBtn').onclick = () => { this.$('plantsOverlay').innerHTML = ''; this.placedPlants = []; };
    this.$('saveBtn').onclick = () => this.saveCurrentDesign();
  }

  placePlant(x, y) {
    if (this.selectedPlantIndex === null) return;
    const plant = this.allPlants[this.selectedPlantIndex];

    const el = document.createElement('div');
    el.className = 'placed-plant';
    el.dataset.name = plant.name;
    // Auto-Z-Index: Plants lower on screen (higher Y) appear in front
    el.style.zIndex = Math.round(y); 
    el.style.left = `${x - 40}px`;
    el.style.top = `${y - 80}px`;
    
    el.innerHTML = `<img src="${plant.img}" style="width:80px;" crossorigin="anonymous">`;
    
    // Remove on tap
    el.onclick = (e) => { e.stopPropagation(); el.remove(); };

    this.$('plantsOverlay').appendChild(el);
    this.placedPlants.push(el);
  }

  showHint(msg) {
    this.$('hint').innerText = msg;
    setTimeout(() => { if(this.$('hint').innerText === msg) this.$('hint').innerText = ""; }, 3000);
  }
}

customElements.define('ar-camera-element', ArCameraElement);
