# AI Assistant Panel Patch for Ecoplantia Garden Designer

This patch adds an AI Assistant Panel feature to the Ecoplantia Garden Designer HTML file. Apply these changes in order.

---

## CHANGE 1: Add CSS Variable

**FIND this line in `:root`:**
```css
:root {
  --top: 44px;
  --bottom: 50px;
  --tray: 56px;
  --ctrl: 40px;
  --side: 0px;
  --scale: 1;
}
```

**REPLACE with:**
```css
:root {
  --top: 44px;
  --bottom: 50px;
  --tray: 56px;
  --ctrl: 40px;
  --side: 0px;
  --scale: 1;
  --info-panel: 90px;
}
```

---

## CHANGE 2: Add Wide Mode CSS Variable

**FIND this line in `body.wide-mode`:**
```css
body.wide-mode {
  --top: 28px;
  --bottom: 0px;
  --tray: 44px;
  --ctrl: 28px;
  --side: 36px;
}
```

**REPLACE with:**
```css
body.wide-mode {
  --top: 28px;
  --bottom: 0px;
  --tray: 44px;
  --ctrl: 28px;
  --side: 36px;
  --info-panel: 70px;
}
```

---

## CHANGE 3: Update Viewport Bottom Calculation for Wide Mode

**FIND:**
```css
body.wide-mode #viewport { bottom: calc(var(--tray) + var(--ctrl)); }
```

**REPLACE with:**
```css
body.wide-mode #viewport { bottom: calc(var(--tray) + var(--ctrl) + var(--info-panel)); }
```

---

## CHANGE 4: Update Control Bar Bottom for Wide Mode

**FIND:**
```css
body.wide-mode #ctrlBar { bottom: var(--tray); height: 28px; padding: 0 4px; }
```

**REPLACE with:**
```css
body.wide-mode #ctrlBar { bottom: calc(var(--tray) + var(--info-panel)); height: 28px; padding: 0 4px; }
```

---

## CHANGE 5: Add Wide Mode Info Panel Styles

**FIND this line (it's near the end of the wide-mode CSS rules, after the polygon styles):**
```css
body.wide-mode #polyDoneBtn { padding: 5px 10px; font-size: 10px; }
```

**ADD AFTER it:**
```css
    /* Wide mode info panel */
    body.wide-mode #infoPanel { min-height: 70px; }
    body.wide-mode #infoPanel.collapsed { min-height: 20px; }
    body.wide-mode .infoHead { padding: 2px 6px; font-size: 7px; }
    body.wide-mode .infoContent { padding: 6px; gap: 6px; }
    body.wide-mode .plantPreviewImg { width: 50px; height: 50px; }
    body.wide-mode .plantPreviewInfo h4 { font-size: 10px; }
    body.wide-mode .plantPreviewInfo .sciName { font-size: 7px; }
    body.wide-mode .plantFactRow { font-size: 7px; }
    body.wide-mode .aiTip { font-size: 7px; padding: 4px 6px; }
```

---

## CHANGE 6: Add AI Info Panel CSS (Main Styles)

**FIND this line (near the end of CSS, before `</style>`):**
```css
    #toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
```

**ADD AFTER it (before `</style>`):**
```css
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
    .plant.show-img .plant-img { display: block; }
```

---

## CHANGE 7: Add Info Panel HTML

**FIND this closing tag (end of plantTray div):**
```html
      </div><!-- end plantTray -->
    </section>
```

If it doesn't have the comment, find:
```html
        <div class="trayList" id="plantList"></div>
      </div>
    </section>
```

**REPLACE with:**
```html
        <div class="trayList" id="plantList"></div>
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
    </section>
```

---

## CHANGE 8: Update PLANTS Array with Extended Data

**FIND the entire PLANTS array (it starts like this):**
```javascript
    const PLANTS=[
      {name:'Lanceleaf Coreopsis',acr:'COR',size:12,
```

**REPLACE the entire PLANTS array with:**
```javascript
    const PLANTS=[
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
    ];
```

---

## CHANGE 9: Add showPlantImages Variable

**FIND this line (near the top of the script, with other variable declarations):**
```javascript
    let allowOverlap=false;
    let screenScale=1;
```

**REPLACE with:**
```javascript
    let allowOverlap=false;
    let screenScale=1;
    let showPlantImages=false;
```

---

## CHANGE 10: Add Info Panel Functions

**FIND this comment or section (should be somewhere in the middle of the JavaScript):**
```javascript
    // ===== SUMMARY =====
```

**ADD BEFORE it:**
```javascript
    // ===== AI INFO PANEL =====
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

```

---

## CHANGE 11: Update selPlant Function

**FIND the selPlant function:**
```javascript
    function selPlant(i){
      curPlant=i;
      document.querySelectorAll('.pItem').forEach((el,idx)=>{
        el.classList.toggle('sel',idx===i);
      });
    }
```

**REPLACE with:**
```javascript
    function selPlant(i){
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
    }
```

---

## CHANGE 12: Update place Function to Include Image

**FIND in the place function where the plant element is created. Look for:**
```javascript
      el.innerHTML=`<span class="acr">${p.acr}</span>`;
```

**REPLACE with:**
```javascript
      el.innerHTML=`<span class="acr">${p.acr}</span><img class="plant-img" src="${p.productImg || p.img || ''}" alt="${p.name}">`;
      if (showPlantImages) el.classList.add('show-img');
```

---

## CHANGE 13: Call updateInfoPanel After Placing

**FIND at the end of the place function (look for where it pushes to placed array):**
```javascript
      placed.push({id,acr:p.acr,x:cx,y:cy});
      if(typeof saveState==='function') saveState();
```

**ADD AFTER:**
```javascript
      updateInfoPanel();
```

---

## CHANGE 14: Call updateInfoPanel After Deleting Plant

**FIND where plants are deleted (in the pointerup handler for plants, look for):**
```javascript
        placed = placed.filter(pl => pl.id !== dragP.id);
```

**ADD AFTER:**
```javascript
        updateInfoPanel();
```

---

## CHANGE 15: Add Info Panel Event Listeners

**FIND the DOMContentLoaded event listener section where other event listeners are set up. Look for:**
```javascript
    $('collapseBtn').onclick=()=>{
```

**ADD AFTER that collapse button handler:**
```javascript
    // Info panel collapse
    $('infoCollapseBtn').onclick=()=>{
      const panel = $('infoPanel');
      panel.classList.toggle('collapsed');
      $('infoCollapseBtn').textContent = panel.classList.contains('collapsed') ? '▲' : '▼';
    };
    
    // Show images toggle
    $('showImgChk').onchange=(e)=>{
      togglePlantImages(e.target.checked);
    };
```

---

## CHANGE 16: Initialize Info Panel on Garden Creation

**FIND in the createBtn click handler, near the end where the canvas area is shown:**
```javascript
      $('canvasArea').classList.add('vis');
```

**ADD AFTER:**
```javascript
      updateInfoPanel();
```

---

## CHANGE 17: Update Info Panel After Matrix Fill

**FIND at the end of the matrix apply handler where it closes the modal:**
```javascript
        $('matrixModal').classList.remove('vis');
```

**ADD BEFORE that line:**
```javascript
        updateInfoPanel();
```

---

## CHANGE 18: Update Info Panel After Undo

**FIND in the undo function where it restores state:**
```javascript
      placed = state.placed.map(p => ({...p}));
```

**ADD AFTER the undo restoration logic:**
```javascript
      updateInfoPanel();
```

---

## TESTING

After applying all changes:
1. Open the HTML file in a browser
2. Create a new garden
3. Verify the green AI Info Panel appears below the plant tray
4. Select a plant - verify the plant preview shows with image and details
5. Place plants - verify stats update (count, coverage, species)
6. Check that AI tips change based on your design
7. Toggle "Show Images" checkbox - verify plant circles show actual photos
8. Test the collapse button on the info panel

---

## NOTES

- The info panel is positioned between the plant tray and the bottom of the canvas area
- Stats update in real-time as plants are added/removed
- AI tips provide contextual guidance based on coverage, keystone species, and diversity
- The "Show Images" toggle affects all placed plants on the canvas
- In wide mode, the panel uses smaller fonts and reduced padding
