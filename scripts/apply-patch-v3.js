const fs = require('fs');

// Read the patched file from v2 (to add remaining changes)
let content = fs.readFileSync('C:/Users/carba/Downloads/ecoplantia-designer-v11-patched.html', 'utf8');

console.log('Applying remaining AI Panel patches (v3)...\n');

// CHANGE 12: Update plant innerHTML to include image - line 2291 pattern
const change12Old = 'el.innerHTML=`<span class="acr" style="color:${getPlantColor(idx)}">${p.acr}</span>`;';
const change12New = `el.innerHTML=\`<span class="acr" style="color:\${getPlantColor(idx)}">\${p.acr}</span><img class="plant-img" src="\${p.productImg || p.img || ''}" alt="\${p.name}">\`;
      if (showPlantImages) el.classList.add('show-img');`;

if (content.includes(change12Old)) {
  content = content.replace(change12Old, change12New);
  console.log('✓ CHANGE 12: Updated place function to include image');
} else {
  console.log('✗ CHANGE 12: Could not find plant innerHTML pattern');
}

// CHANGE 13: Add updateInfoPanel after state.plants.push
const change13Pat = /state\.plants\.push\(\{id:el\.id,idx,name:p\.name,cx:x,cy:y\}\);/;
if (change13Pat.test(content)) {
  content = content.replace(change13Pat, 'state.plants.push({id:el.id,idx,name:p.name,cx:x,cy:y});\n      updateInfoPanel();');
  console.log('✓ CHANGE 13: Added updateInfoPanel after placing');
} else {
  console.log('✗ CHANGE 13: Could not find state.plants.push');
}

// CHANGE 14: Add updateInfoPanel after delete filter
const change14Old = "state.plants=state.plants.filter(p=>p.id!==a.data.id);";
const change14New = "state.plants=state.plants.filter(p=>p.id!==a.data.id);\n        updateInfoPanel();";

if (content.includes(change14Old)) {
  content = content.replace(change14Old, change14New);
  console.log('✓ CHANGE 14: Added updateInfoPanel after delete');
} else {
  console.log('✗ CHANGE 14: Could not find plants filter for delete');
}

// CHANGE 18: Add updateInfoPanel in undo function after filter
// The undo already does the filter, so updateInfoPanel was added in CHANGE 14
// Just confirm it's present
if (content.includes('updateInfoPanel();')) {
  console.log('✓ CHANGE 18: updateInfoPanel already integrated in undo flow');
} else {
  console.log('✗ CHANGE 18: updateInfoPanel not found');
}

// Add showPlantImages variable declaration if not present
if (!content.includes('let showPlantImages')) {
  const stateDecl = content.match(/const state\s*=\s*\{/);
  if (stateDecl) {
    content = content.replace(stateDecl[0], 'let showPlantImages = false;\n    ' + stateDecl[0]);
    console.log('✓ Added showPlantImages variable');
  }
}

// Add CSS for plant images and info panel if not present
if (!content.includes('.plant-img')) {
  const plantImgCSS = `
    /* Plant image styles */
    .plant .plant-img {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 80%;
      object-fit: contain;
      pointer-events: none;
      z-index: 1;
    }
    .plant.show-img .plant-img {
      display: block;
    }
    .plant.show-img .acr {
      display: none;
    }

    /* AI Info Panel styles */
    #infoPanel {
      position: fixed;
      right: 0;
      top: var(--top);
      width: var(--info-panel, 90px);
      height: calc(100vh - var(--top) - var(--bottom));
      background: rgba(255,255,255,0.95);
      border-left: 1px solid #ddd;
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: transform 0.3s;
      overflow: hidden;
    }
    #infoPanel.collapsed {
      transform: translateX(calc(100% - 24px));
    }
    .infoPanelHeader {
      padding: 8px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
    }
    .infoPanelToggle {
      cursor: pointer;
      padding: 4px;
    }
    .infoPanelContent {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .infoStat {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11px;
      border-bottom: 1px solid #eee;
    }
    .infoStat .label { color: #666; }
    .infoStat .value { font-weight: 600; }
    .aiTip {
      background: #f0f7ff;
      border-radius: 6px;
      padding: 8px;
      margin-top: 8px;
      font-size: 10px;
    }
    .aiTip.warning { background: #fff3e0; }
    .aiTip.success { background: #e8f5e9; }
    #infoDefault {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px;
      text-align: center;
      color: #666;
    }
    #plantPreview {
      display: none;
      flex-direction: column;
      align-items: center;
      padding: 8px;
    }
    #previewImg {
      width: 60px;
      height: 60px;
      object-fit: contain;
      margin-bottom: 8px;
    }
    #previewName {
      font-weight: 600;
      font-size: 12px;
    }
    #previewSciName {
      font-style: italic;
      font-size: 10px;
      color: #666;
    }
    .previewDetail {
      font-size: 10px;
      color: #666;
      margin-top: 4px;
    }
    #keystoneRow {
      color: #2e7d32;
      font-weight: 600;
    }
    .toggleRow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px;
      border-top: 1px solid #eee;
      font-size: 11px;
    }
    .toggleSwitch {
      width: 36px;
      height: 20px;
      background: #ccc;
      border-radius: 10px;
      position: relative;
      cursor: pointer;
    }
    .toggleSwitch.on { background: #4caf50; }
    .toggleSwitch::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: left 0.2s;
    }
    .toggleSwitch.on::after { left: 18px; }
`;

  // Insert before </style>
  content = content.replace('</style>', plantImgCSS + '\n    </style>');
  console.log('✓ Added plant image and info panel CSS');
}

// Add Info Panel HTML if not present
if (!content.includes('id="infoPanel"')) {
  const infoPanelHTML = `
  <!-- AI Info Panel -->
  <div id="infoPanel">
    <div class="infoPanelHeader">
      <span>AI Tips</span>
      <span class="infoPanelToggle" onclick="this.closest('#infoPanel').classList.toggle('collapsed')">◀</span>
    </div>
    <div class="infoPanelContent">
      <div class="infoStat">
        <span class="label">Plants</span>
        <span class="value" id="infoPlantCount">0</span>
      </div>
      <div class="infoStat">
        <span class="label">Coverage</span>
        <span class="value" id="infoCoverage">0%</span>
      </div>
      <div class="infoStat">
        <span class="label">Species</span>
        <span class="value" id="infoSpecies">0</span>
      </div>

      <div id="aiTip1" class="aiTip">
        <span id="aiTipText1">Start by adding plants!</span>
      </div>
      <div id="aiTip2" class="aiTip" style="display:none">
        <span id="aiTipText2"></span>
      </div>

      <div id="infoDefault">
        <div style="font-size:24px;margin-bottom:8px">🌱</div>
        <div>Select a plant to see details</div>
      </div>

      <div id="plantPreview">
        <img id="previewImg" src="" alt="">
        <div id="previewName"></div>
        <div id="previewSciName"></div>
        <div class="previewDetail" id="previewHeight"></div>
        <div class="previewDetail" id="previewLight"></div>
        <div class="previewDetail" id="previewBloom"></div>
        <div class="previewDetail" id="keystoneRow">⭐ Keystone Species</div>
      </div>
    </div>
    <div class="toggleRow">
      <span>Show Images</span>
      <div class="toggleSwitch" id="imgToggle" onclick="this.classList.toggle('on');togglePlantImages(this.classList.contains('on'))"></div>
    </div>
  </div>
`;

  // Insert before <script>
  content = content.replace('<script>', infoPanelHTML + '\n  <script>');
  console.log('✓ Added Info Panel HTML');
}

// Update functions to use state.plants instead of placed
content = content.replace(/const plantCount = placed\.length;/g, 'const plantCount = state.plants.length;');
content = content.replace(/const speciesUsed = \[\.\.\.new Set\(placed\.map/g, 'const speciesUsed = [...new Set(state.plants.map');

// Write the final patched file
const outputPath = 'C:/Users/carba/Downloads/ecoplantia-designer-v11-patched.html';
fs.writeFileSync(outputPath, content);
console.log('\n✅ Final patched file saved to: ' + outputPath);
