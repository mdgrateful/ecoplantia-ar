const fs = require('fs');

// Read the original file
let content = fs.readFileSync('C:/Users/carba/Downloads/ecoplantia-designer-v11.html', 'utf8');

console.log('Applying AI Panel patch to ecoplantia-designer-v11.html...\n');

// CHANGE 1: Add CSS Variable --info-panel to :root
const change1Old = `:root {
  --top: 44px;
  --bottom: 50px;
  --tray: 56px;
  --ctrl: 40px;
  --side: 0px;
  --scale: 1;
}`;

const change1New = `:root {
  --top: 44px;
  --bottom: 50px;
  --tray: 56px;
  --ctrl: 40px;
  --side: 0px;
  --scale: 1;
  --info-panel: 90px;
}`;

if (content.includes(change1Old)) {
  content = content.replace(change1Old, change1New);
  console.log('✓ CHANGE 1: Added --info-panel to :root');
} else {
  console.log('✗ CHANGE 1: Could not find :root block');
}

// CHANGE 2: Add Wide Mode CSS Variable
const change2Old = `body.wide-mode {
  --top: 28px;
  --bottom: 0px;
  --tray: 44px;
  --ctrl: 28px;
  --side: 36px;
}`;

const change2New = `body.wide-mode {
  --top: 28px;
  --bottom: 0px;
  --tray: 44px;
  --ctrl: 28px;
  --side: 36px;
  --info-panel: 70px;
}`;

if (content.includes(change2Old)) {
  content = content.replace(change2Old, change2New);
  console.log('✓ CHANGE 2: Added --info-panel to body.wide-mode');
} else {
  console.log('✗ CHANGE 2: Could not find body.wide-mode block');
}

// CHANGE 3: Update Viewport Bottom Calculation for Wide Mode
const change3Old = `body.wide-mode #viewport { bottom: calc(var(--tray) + var(--ctrl)); }`;
const change3New = `body.wide-mode #viewport { bottom: calc(var(--tray) + var(--ctrl) + var(--info-panel)); }`;

if (content.includes(change3Old)) {
  content = content.replace(change3Old, change3New);
  console.log('✓ CHANGE 3: Updated viewport bottom for wide mode');
} else {
  console.log('✗ CHANGE 3: Could not find viewport wide-mode rule');
}

// CHANGE 4: Update Control Bar Bottom for Wide Mode
const change4Old = `body.wide-mode #ctrlBar { bottom: var(--tray); height: 28px; padding: 0 4px; }`;
const change4New = `body.wide-mode #ctrlBar { bottom: calc(var(--tray) + var(--info-panel)); height: 28px; padding: 0 4px; }`;

if (content.includes(change4Old)) {
  content = content.replace(change4Old, change4New);
  console.log('✓ CHANGE 4: Updated ctrlBar bottom for wide mode');
} else {
  console.log('✗ CHANGE 4: Could not find ctrlBar wide-mode rule');
}

// CHANGE 5: Add Wide Mode Info Panel Styles
const change5Find = `body.wide-mode #polyDoneBtn { padding: 5px 10px; font-size: 10px; }`;
const change5Add = `body.wide-mode #polyDoneBtn { padding: 5px 10px; font-size: 10px; }
    /* Wide mode info panel */
    body.wide-mode #infoPanel { min-height: 70px; }
    body.wide-mode #infoPanel.collapsed { min-height: 20px; }
    body.wide-mode .infoHead { padding: 2px 6px; font-size: 7px; }
    body.wide-mode .infoContent { padding: 6px; gap: 6px; }
    body.wide-mode .plantPreviewImg { width: 50px; height: 50px; }
    body.wide-mode .plantPreviewInfo h4 { font-size: 10px; }
    body.wide-mode .plantPreviewInfo .sciName { font-size: 7px; }
    body.wide-mode .plantFactRow { font-size: 7px; }
    body.wide-mode .aiTip { font-size: 7px; padding: 4px 6px; }`;

if (content.includes(change5Find)) {
  content = content.replace(change5Find, change5Add);
  console.log('✓ CHANGE 5: Added wide mode info panel styles');
} else {
  console.log('✗ CHANGE 5: Could not find polyDoneBtn wide-mode rule');
}

// CHANGE 6: Add AI Info Panel CSS (Main Styles)
const change6Find = `#toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }`;
const change6Add = `#toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

    /* ===== AI INFO PANEL ===== */
    #infoPanel {
      background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
      border-top: 1px solid #A5D6A7;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      min-height: 90px;
      transition: min-height 0.2s;
    }

    #infoPanel.collapsed { min-height: 24px; }
    #infoPanel.collapsed .infoContent { display: none; }

    .infoHead {
      padding: 4px 10px;
      font-size: 8px;
      font-weight: bold;
      color: #1B5E20;
      background: rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(27,158,49,0.2);
    }

    .infoHead .infoTitle { display: flex; align-items: center; gap: 4px; }
    .infoHead .toggleWrap { display: flex; align-items: center; gap: 6px; }

    .imgToggle {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 7px;
      color: #1B5E20;
      cursor: pointer;
    }
    .imgToggle input { width: 12px; height: 12px; accent-color: #1B9E31; }

    .infoContent {
      padding: 8px 10px;
      display: flex;
      gap: 10px;
      overflow: hidden;
    }

    .plantPreview { display: flex; gap: 8px; flex: 1; min-width: 0; }

    .plantPreviewImg {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      background: #fff;
      border: 2px solid #1B9E31;
      flex-shrink: 0;
    }

    .plantPreviewInfo { flex: 1; min-width: 0; }
    .plantPreviewInfo h4 {
      font-size: 11px;
      color: #1B5E20;
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .plantPreviewInfo .sciName {
      font-size: 8px;
      color: #666;
      font-style: italic;
      margin-bottom: 4px;
    }

    .plantFacts { display: flex; flex-wrap: wrap; gap: 4px 8px; }
    .plantFactRow {
      font-size: 8px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .plantFactRow .factIcon { font-size: 10px; }

    .keystoneBadge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: #FFF3CD;
      color: #856404;
      padding: 1px 4px;
      border-radius: 8px;
      font-size: 7px;
      font-weight: bold;
    }

    .aiTipSection {
      flex: 0 0 auto;
      max-width: 140px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .aiTip {
      background: #fff;
      border-radius: 8px;
      padding: 6px 8px;
      font-size: 8px;
      color: #333;
      border-left: 3px solid #1B9E31;
      line-height: 1.3;
    }
    .aiTip .tipIcon { font-size: 10px; margin-right: 3px; }
    .aiTip.warning { border-left-color: #FF9800; background: #FFF8E1; }
    .aiTip.success { border-left-color: #4CAF50; background: #E8F5E9; }

    .infoDefault {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 10px;
    }
    .infoDefault .statsGrid { display: flex; gap: 8px; }
    .infoDefault .statItem {
      background: #fff;
      padding: 6px 10px;
      border-radius: 8px;
      text-align: center;
    }
    .infoDefault .statVal { font-size: 14px; font-weight: bold; color: #1B9E31; }
    .infoDefault .statLbl { font-size: 7px; color: #666; }
    .infoDefault .tipsList { display: flex; flex-direction: column; gap: 4px; flex: 1; }

    /* Plant with image preview on canvas */
    .plant.show-img .acr { display: none; }
    .plant .plant-img {
      display: none;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .plant.show-img .plant-img { display: block; }`;

if (content.includes(change6Find)) {
  content = content.replace(change6Find, change6Add);
  console.log('✓ CHANGE 6: Added AI Info Panel CSS');
} else {
  console.log('✗ CHANGE 6: Could not find toast.show rule');
}

// CHANGE 7: Add Info Panel HTML
const change7Find = `<div class="trayList" id="plantList"></div>
      </div>
    </section>`;

const change7New = `<div class="trayList" id="plantList"></div>
      </div>
      <!-- AI Info Panel -->
      <div id="infoPanel">
        <div class="infoHead">
          <div class="infoTitle">
            <span>🌱</span>
            <span id="infoPanelTitle">Plant Info & Tips</span>
          </div>
          <div class="toggleWrap">
            <label class="imgToggle">
              <input type="checkbox" id="showImgChk">
              <span>Show Images</span>
            </label>
            <button class="collapseBtn" id="infoCollapseBtn">▼</button>
          </div>
        </div>
        <div class="infoContent" id="infoContent">
          <div class="infoDefault" id="infoDefault">
            <div class="statsGrid">
              <div class="statItem">
                <div class="statVal" id="infoPlantCount">0</div>
                <div class="statLbl">Plants</div>
              </div>
              <div class="statItem">
                <div class="statVal" id="infoCoverage">0%</div>
                <div class="statLbl">Coverage</div>
              </div>
              <div class="statItem">
                <div class="statVal" id="infoSpecies">0</div>
                <div class="statLbl">Species</div>
              </div>
            </div>
            <div class="tipsList" id="defaultTips">
              <div class="aiTip"><span class="tipIcon">💡</span> Select a plant to see details</div>
            </div>
          </div>
          <div class="plantPreview" id="plantPreview" style="display:none;">
            <img class="plantPreviewImg" id="previewImg" src="" alt="Plant">
            <div class="plantPreviewInfo">
              <h4 id="previewName">Plant Name</h4>
              <div class="sciName" id="previewSciName">Scientific name</div>
              <div class="plantFacts">
                <div class="plantFactRow"><span class="factIcon">📏</span> <span id="previewHeight">—</span></div>
                <div class="plantFactRow"><span class="factIcon">☀️</span> <span id="previewLight">—</span></div>
                <div class="plantFactRow"><span class="factIcon">🌸</span> <span id="previewBloom">—</span></div>
                <div class="plantFactRow" id="keystoneRow" style="display:none;">
                  <span class="keystoneBadge">🦋 Keystone</span>
                </div>
              </div>
            </div>
          </div>
          <div class="aiTipSection" id="aiTipSection">
            <div class="aiTip" id="aiTip1"><span class="tipIcon">💡</span> <span id="aiTipText1">Add plants to get recommendations</span></div>
            <div class="aiTip" id="aiTip2" style="display:none;"><span class="tipIcon">🌿</span> <span id="aiTipText2"></span></div>
          </div>
        </div>
      </div>
    </section>`;

if (content.includes(change7Find)) {
  content = content.replace(change7Find, change7New);
  console.log('✓ CHANGE 7: Added Info Panel HTML');
} else {
  console.log('✗ CHANGE 7: Could not find plantList closing section');
}

// CHANGE 8: Update PLANTS Array - Look for various formats
const plantsPatterns = [
  /const PLANTS=\[\s*\{name:'Lanceleaf Coreopsis',acr:'COR',size:12[^\]]+\];/s,
  /const PLANTS\s*=\s*\[\s*\{name:'Lanceleaf Coreopsis'[^\]]+\];/s
];

const newPlants = `const PLANTS=[
      {name:'Lanceleaf Coreopsis',acr:'COR',size:12,
       sciName:'Coreopsis lanceolata',isKeystone:false,isGrass:false,
       light:'Full Sun',bloom:'May-Jul',
       img:'https://static.wixstatic.com/media/94bd1f_48d31eb0d72044c5a798b2fd8960256a~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_441b6603b3e74b2c9ec595ca3bc21a7c~mv2.png'},
      {name:'Blazingstar',acr:'LIA',size:12,
       sciName:'Liatris spicata',isKeystone:false,isGrass:false,
       light:'Full Sun',bloom:'Jul-Sep',
       img:'https://static.wixstatic.com/media/94bd1f_40a5cc37e827410ebc1c5bcbbafd48ac~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_866dca16b6444a3a88f005468821c479~mv2.png'},
      {name:'Purple Lovegrass',acr:'ERA',size:18,
       sciName:'Eragrostis spectabilis',isKeystone:false,isGrass:true,
       light:'Full Sun',bloom:'Aug-Oct',
       img:'https://static.wixstatic.com/media/94bd1f_3c95b2098fb741caa1bbae4eb3cfb0a5~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_8f658d4b079d4ac4a0cc986ca9356f06~mv2.png'},
      {name:'Black-Eyed Susan',acr:'RUD',size:18,
       sciName:'Rudbeckia hirta',isKeystone:true,isGrass:false,
       light:'Full Sun',bloom:'Jun-Sep',
       img:'https://static.wixstatic.com/media/94bd1f_8d4b2dd6f6c04e5abcf2b3c7a1d8e9f0~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_d999bdf79f7f4395bdea532a6e0960d1~mv2.png'},
      {name:'Purple Coneflower',acr:'ECH',size:18,
       sciName:'Echinacea purpurea',isKeystone:true,isGrass:false,
       light:'Full Sun',bloom:'Jun-Aug',
       img:'https://static.wixstatic.com/media/94bd1f_9e5c3dd7f7d04f6abdf3c4d8b2e9f1a1~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_14557c6680704ccdb1388a3c9bb78bb1~mv2.png'},
      {name:'Rough Goldenrod',acr:'SOL',size:24,
       sciName:'Solidago rugosa',isKeystone:true,isGrass:false,
       light:'Full Sun',bloom:'Aug-Oct',
       img:'https://static.wixstatic.com/media/94bd1f_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_f0ae2d7f5bdf40be9bae834522028f05~mv2.png'},
      {name:'Smooth Aster',acr:'AST',size:24,
       sciName:'Symphyotrichum laeve',isKeystone:true,isGrass:false,
       light:'Full-Part Sun',bloom:'Sep-Oct',
       img:'https://static.wixstatic.com/media/94bd1f_b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_ab0ec431fb7649729106b8d57fbfc17e~mv2.png'},
      {name:'Blunt Mountain-Mint',acr:'MMT',size:24,
       sciName:'Pycnanthemum muticum',isKeystone:false,isGrass:false,
       light:'Full-Part Sun',bloom:'Jul-Sep',
       img:'https://static.wixstatic.com/media/94bd1f_c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_05477fc754bf4d58b3f73fcc91812c25~mv2.png'},
      {name:'Butterfly Weed',acr:'ASC',size:24,
       sciName:'Asclepias tuberosa',isKeystone:true,isGrass:false,
       light:'Full Sun',bloom:'Jun-Aug',
       img:'https://static.wixstatic.com/media/94bd1f_d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9~mv2.png',
       productImg:'https://static.wixstatic.com/media/94bd1f_00213b64feff49f591a7fb83fd720fbb~mv2.png'},
      {name:'Toolbox',acr:'TBX',size:18,
       sciName:'',isKeystone:false,isGrass:false,
       light:'',bloom:'',
       img:'',productImg:''}
    ];`;

let plantsReplaced = false;
for (const pattern of plantsPatterns) {
  if (pattern.test(content)) {
    content = content.replace(pattern, newPlants);
    plantsReplaced = true;
    console.log('✓ CHANGE 8: Updated PLANTS array with extended data');
    break;
  }
}
if (!plantsReplaced) {
  console.log('✗ CHANGE 8: Could not find PLANTS array');
}

// CHANGE 9: Add showPlantImages Variable
const change9Old = `let allowOverlap=false;
    let screenScale=1;`;
const change9New = `let allowOverlap=false;
    let screenScale=1;
    let showPlantImages=false;`;

if (content.includes(change9Old)) {
  content = content.replace(change9Old, change9New);
  console.log('✓ CHANGE 9: Added showPlantImages variable');
} else {
  console.log('✗ CHANGE 9: Could not find allowOverlap/screenScale declarations');
}

// CHANGE 10: Add Info Panel Functions (before SUMMARY section)
const change10Find = `// ===== SUMMARY =====`;
const change10Add = `// ===== AI INFO PANEL =====
    function updateInfoPanel() {
      const plantCount = placed.length;
      const speciesUsed = [...new Set(placed.map(p => p.acr))];
      const speciesCount = speciesUsed.filter(a => a !== 'TBX').length;

      // Calculate coverage
      let totalPlantArea = 0;
      placed.forEach(p => {
        const plant = PLANTS.find(pl => pl.acr === p.acr);
        if (plant) {
          const radiusIn = plant.size / 2;
          totalPlantArea += Math.PI * radiusIn * radiusIn;
        }
      });
      const gardenAreaSqIn = gardenW * gardenD * 144;
      const coverage = gardenAreaSqIn > 0 ? Math.round((totalPlantArea / gardenAreaSqIn) * 100) : 0;

      // Update stats
      $('infoPlantCount').textContent = plantCount;
      $('infoCoverage').textContent = coverage + '%';
      $('infoSpecies').textContent = speciesCount;

      // Generate AI tips
      generateAITips(plantCount, coverage, speciesCount, speciesUsed);
    }

    function generateAITips(plantCount, coverage, speciesCount, speciesUsed) {
      const tip1 = $('aiTip1');
      const tip2 = $('aiTip2');
      const tipText1 = $('aiTipText1');
      const tipText2 = $('aiTipText2');

      tip1.className = 'aiTip';
      tip2.style.display = 'none';

      // Tip 1: Coverage-based advice
      if (plantCount === 0) {
        tipText1.textContent = 'Start by adding plants to your garden!';
      } else if (coverage < 30) {
        tipText1.textContent = 'Add more plants for better coverage (' + coverage + '% filled)';
        tip1.classList.add('warning');
      } else if (coverage < 60) {
        tipText1.textContent = 'Good progress! ' + coverage + '% coverage achieved.';
      } else if (coverage < 90) {
        tipText1.textContent = 'Great coverage at ' + coverage + '%!';
        tip1.classList.add('success');
      } else {
        tipText1.textContent = 'Excellent! Garden is well-filled.';
        tip1.classList.add('success');
      }

      // Tip 2: Diversity/keystone advice
      const keystones = speciesUsed.filter(acr => {
        const p = PLANTS.find(pl => pl.acr === acr);
        return p && p.isKeystone;
      });
      const hasGrass = speciesUsed.some(acr => {
        const p = PLANTS.find(pl => pl.acr === acr);
        return p && p.isGrass;
      });

      if (plantCount > 0) {
        tip2.style.display = 'block';
        tip2.className = 'aiTip';

        if (keystones.length === 0) {
          tipText2.textContent = 'Add keystone species (🦋) for wildlife!';
          tip2.classList.add('warning');
        } else if (!hasGrass && speciesCount > 2) {
          tipText2.textContent = 'Consider adding ornamental grass for texture.';
        } else if (speciesCount < 3) {
          tipText2.textContent = 'Try adding more species for diversity.';
        } else {
          tipText2.textContent = keystones.length + ' keystone species - great for pollinators!';
          tip2.classList.add('success');
        }
      }
    }

    function showPlantDetails(plant) {
      if (!plant || plant.acr === 'TBX') {
        $('infoDefault').style.display = 'flex';
        $('plantPreview').style.display = 'none';
        return;
      }

      $('infoDefault').style.display = 'none';
      $('plantPreview').style.display = 'flex';

      $('previewImg').src = plant.productImg || plant.img || '';
      $('previewName').textContent = plant.name;
      $('previewSciName').textContent = plant.sciName || '';
      $('previewHeight').textContent = plant.size + '" spread';
      $('previewLight').textContent = plant.light || 'Full Sun';
      $('previewBloom').textContent = plant.bloom || '—';

      const keystoneRow = $('keystoneRow');
      if (plant.isKeystone) {
        keystoneRow.style.display = 'block';
      } else {
        keystoneRow.style.display = 'none';
      }
    }

    function hidePlantDetails() {
      $('infoDefault').style.display = 'flex';
      $('plantPreview').style.display = 'none';
    }

    function togglePlantImages(show) {
      showPlantImages = show;
      document.querySelectorAll('.plant').forEach(el => {
        if (show) {
          el.classList.add('show-img');
        } else {
          el.classList.remove('show-img');
        }
      });
    }

    // ===== SUMMARY =====`;

if (content.includes(change10Find)) {
  content = content.replace(change10Find, change10Add);
  console.log('✓ CHANGE 10: Added Info Panel functions');
} else {
  console.log('✗ CHANGE 10: Could not find SUMMARY section');
}

// CHANGE 11: Update selPlant Function
const change11Old = `function selPlant(i){
      curPlant=i;
      document.querySelectorAll('.pItem').forEach((el,idx)=>{
        el.classList.toggle('sel',idx===i);
      });
    }`;

const change11New = `function selPlant(i){
      curPlant=i;
      document.querySelectorAll('.pItem').forEach((el,idx)=>{
        el.classList.toggle('sel',idx===i);
      });
      // Update info panel with selected plant details
      if (i >= 0 && i < PLANTS.length) {
        showPlantDetails(PLANTS[i]);
      } else {
        hidePlantDetails();
      }
    }`;

if (content.includes(change11Old)) {
  content = content.replace(change11Old, change11New);
  console.log('✓ CHANGE 11: Updated selPlant function');
} else {
  console.log('✗ CHANGE 11: Could not find selPlant function');
}

// CHANGE 12: Update place Function to Include Image
const change12Old = 'el.innerHTML=`<span class="acr">${p.acr}</span>`;';
const change12New = 'el.innerHTML=`<span class="acr">${p.acr}</span><img class="plant-img" src="${p.productImg || p.img || \'\'}" alt="${p.name}">`;\n      if (showPlantImages) el.classList.add(\'show-img\');';

if (content.includes(change12Old)) {
  content = content.replace(change12Old, change12New);
  console.log('✓ CHANGE 12: Updated place function to include image');
} else {
  console.log('✗ CHANGE 12: Could not find plant innerHTML in place function');
}

// CHANGE 13: Call updateInfoPanel After Placing
const change13Old = `placed.push({id,acr:p.acr,x:cx,y:cy});
      if(typeof saveState==='function') saveState();`;
const change13New = `placed.push({id,acr:p.acr,x:cx,y:cy});
      if(typeof saveState==='function') saveState();
      updateInfoPanel();`;

if (content.includes(change13Old)) {
  content = content.replace(change13Old, change13New);
  console.log('✓ CHANGE 13: Added updateInfoPanel after placing');
} else {
  console.log('✗ CHANGE 13: Could not find placed.push in place function');
}

// CHANGE 14: Call updateInfoPanel After Deleting Plant
const change14Old = `placed = placed.filter(pl => pl.id !== dragP.id);`;
const change14New = `placed = placed.filter(pl => pl.id !== dragP.id);
        updateInfoPanel();`;

if (content.includes(change14Old)) {
  content = content.replace(change14Old, change14New);
  console.log('✓ CHANGE 14: Added updateInfoPanel after deleting');
} else {
  console.log('✗ CHANGE 14: Could not find placed.filter for delete');
}

// CHANGE 15: Add Info Panel Event Listeners
const change15Find = `$('collapseBtn').onclick=()=>{`;
const change15Add = `$('collapseBtn').onclick=()=>{`;
// We need to find the end of this handler and add after
const collapseBtnMatch = content.match(/\$\('collapseBtn'\)\.onclick=\(\)=>\{[^}]+\};/);
if (collapseBtnMatch) {
  const afterCollapse = collapseBtnMatch[0] + `
    // Info panel collapse
    $('infoCollapseBtn').onclick=()=>{
      const panel = $('infoPanel');
      panel.classList.toggle('collapsed');
      $('infoCollapseBtn').textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
    };

    // Show images toggle
    $('showImgChk').onchange=(e)=>{
      togglePlantImages(e.target.checked);
    };`;
  content = content.replace(collapseBtnMatch[0], afterCollapse);
  console.log('✓ CHANGE 15: Added Info Panel event listeners');
} else {
  console.log('✗ CHANGE 15: Could not find collapseBtn onclick');
}

// CHANGE 16: Initialize Info Panel on Garden Creation
const change16Old = `$('canvasArea').classList.add('vis');`;
const change16New = `$('canvasArea').classList.add('vis');
      updateInfoPanel();`;

// Only replace first occurrence (in createBtn handler)
if (content.includes(change16Old)) {
  content = content.replace(change16Old, change16New);
  console.log('✓ CHANGE 16: Added updateInfoPanel on garden creation');
} else {
  console.log('✗ CHANGE 16: Could not find canvasArea vis toggle');
}

// CHANGE 17: Update Info Panel After Matrix Fill
const change17Old = `$('matrixModal').classList.remove('vis');`;
const change17New = `updateInfoPanel();
        $('matrixModal').classList.remove('vis');`;

if (content.includes(change17Old)) {
  content = content.replace(change17Old, change17New);
  console.log('✓ CHANGE 17: Added updateInfoPanel after matrix fill');
} else {
  console.log('✗ CHANGE 17: Could not find matrixModal close');
}

// CHANGE 18: Update Info Panel After Undo
const change18Old = `placed = state.placed.map(p => ({...p}));`;
const change18New = `placed = state.placed.map(p => ({...p}));
      updateInfoPanel();`;

if (content.includes(change18Old)) {
  content = content.replace(change18Old, change18New);
  console.log('✓ CHANGE 18: Added updateInfoPanel after undo');
} else {
  console.log('✗ CHANGE 18: Could not find placed restoration in undo');
}

// Write the patched file
const outputPath = 'C:/Users/carba/Downloads/ecoplantia-designer-v11-patched.html';
fs.writeFileSync(outputPath, content);
console.log('\n✅ Patched file saved to: ' + outputPath);
