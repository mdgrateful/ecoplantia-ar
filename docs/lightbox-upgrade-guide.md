# Lightbox Upgrade: AI Assistant Panel

This document shows the changes to add the AI Info Panel to your existing designer lightbox.

## 1. ADD CSS (before closing `</style>` tag)

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

#infoPanel.collapsed {
  min-height: 24px;
}
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

.infoHead .infoTitle {
  display: flex;
  align-items: center;
  gap: 4px;
}

.infoHead .toggleWrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.imgToggle {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 7px;
  color: #1B5E20;
  cursor: pointer;
}

.imgToggle input {
  width: 12px;
  height: 12px;
  accent-color: #1B9E31;
}

.infoContent {
  padding: 8px 10px;
  display: flex;
  gap: 10px;
  overflow: hidden;
}

/* Plant preview section */
.plantPreview {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.plantPreviewImg {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  background: #fff;
  border: 2px solid #1B9E31;
  flex-shrink: 0;
}

.plantPreviewInfo {
  flex: 1;
  min-width: 0;
}

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

.plantFacts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.plantFactRow {
  font-size: 8px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 2px;
}

.plantFactRow .factIcon {
  font-size: 10px;
}

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

/* AI Tip section */
.aiTipSection {
  flex: 0 0 auto;
  max-width: 160px;
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

.aiTip .tipIcon {
  font-size: 10px;
  margin-right: 3px;
}

.aiTip.warning {
  border-left-color: #FF9800;
  background: #FFF8E1;
}

.aiTip.success {
  border-left-color: #4CAF50;
  background: #E8F5E9;
}

/* Ask AI Button */
.askAiBtn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 6px 10px;
  font-size: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.askAiBtn:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.askAiBtn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.askAiBtn .aiIcon {
  font-size: 10px;
}

/* AI Chat Modal */
#aiChatModal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 3000;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
}

#aiChatModal.vis {
  display: flex;
}

.aiChatContent {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 400px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
  animation: slideUpModal 0.3s ease-out;
}

@keyframes slideUpModal {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.aiChatHeader {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.aiChatHeader h3 {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.aiChatClose {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
}

.aiChatMessages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f5f5f5;
}

.aiMsg {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.4;
}

.aiMsg.bot {
  background: #fff;
  border: 1px solid #e0e0e0;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.aiMsg.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.aiMsg.loading {
  background: #fff;
  border: 1px solid #e0e0e0;
  align-self: flex-start;
}

.aiMsg.loading::after {
  content: '...';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.aiChatInput {
  padding: 10px 12px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  background: #fff;
}

.aiChatInput input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 8px 14px;
  font-size: 12px;
  outline: none;
}

.aiChatInput input:focus {
  border-color: #667eea;
}

.aiChatInput button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 14px;
  cursor: pointer;
}

/* Quick question chips */
.aiQuickQuestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #eee;
}

.quickQ {
  background: #E8F5E9;
  color: #1B5E20;
  border: 1px solid #A5D6A7;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 9px;
  cursor: pointer;
  transition: background 0.15s;
}

.quickQ:hover {
  background: #C8E6C9;
}

/* Default state (no plant selected) */
.infoDefault {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
}

.infoDefault .statsGrid {
  display: flex;
  gap: 8px;
}

.infoDefault .statItem {
  background: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  text-align: center;
}

.infoDefault .statVal {
  font-size: 14px;
  font-weight: bold;
  color: #1B9E31;
}

.infoDefault .statLbl {
  font-size: 7px;
  color: #666;
}

.infoDefault .tipsList {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

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

## 2. ADD HTML (after `#plantTray` div, before `</section>` of canvasArea)

```html
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
    <!-- Default state shown when no plant selected -->
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
    
    <!-- Plant preview shown when plant selected -->
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
    
    <!-- AI Tips section with Ask AI button -->
    <div class="aiTipSection" id="aiTipSection">
      <div class="aiTip" id="aiTip1"><span class="tipIcon">💡</span> <span id="aiTipText1">Add plants to get recommendations</span></div>
      <div class="aiTip" id="aiTip2" style="display:none;"><span class="tipIcon">🌿</span> <span id="aiTipText2"></span></div>
      <button class="askAiBtn" id="askAiBtn">
        <span class="aiIcon">✨</span> Ask AI for advice
      </button>
    </div>
  </div>
</div>

<!-- AI Chat Modal (add before closing </main>) -->
<div id="aiChatModal">
  <div class="aiChatContent">
    <div class="aiChatHeader">
      <h3>✨ Garden AI Assistant</h3>
      <button class="aiChatClose" id="aiChatClose">×</button>
    </div>
    <div class="aiChatMessages" id="aiChatMessages">
      <!-- Messages will be added here -->
    </div>
    <div class="aiQuickQuestions" id="aiQuickQuestions">
      <button class="quickQ" data-q="What plants pair well together?">🌸 Plant pairings</button>
      <button class="quickQ" data-q="How do I attract more butterflies?">🦋 Butterflies</button>
      <button class="quickQ" data-q="What should I add for fall color?">🍂 Fall color</button>
      <button class="quickQ" data-q="Is my design good for pollinators?">🐝 Pollinators</button>
    </div>
    <div class="aiChatInput">
      <input type="text" id="aiChatInputField" placeholder="Ask about your garden design...">
      <button id="aiChatSend">➤</button>
    </div>
  </div>
</div>
```

---

## 3. UPDATE PLANTS ARRAY (add these new fields to each plant)

```javascript
const PLANTS=[
  {name:'Lanceleaf Coreopsis',acr:'COR',size:12,
   img:'https://static.wixstatic.com/media/94bd1f_48d31eb0d72044c5a798b2fd8960256a~mv2.png',
   productImg:'https://static.wixstatic.com/media/94bd1f_441b6603b3e74b2c9ec595ca3bc21a7c~mv2.jpg', // NEW
   sciName:'Coreopsis lanceolata', // NEW
   bloom:[5,6,7,8],color:'#F6C300',height:'12–24″',spread:'12–18″',
   soil:'Well-drained; dry–medium',light:'Full sun',
   isKeystone:false, // NEW
   isGrass:false // NEW
  },
  // ... update all other plants similarly
];
```

### Full Plant Data with new fields:

| Plant | productImg | sciName | isKeystone | isGrass |
|-------|-----------|---------|------------|---------|
| Lanceleaf Coreopsis | 94bd1f_441b6603b3e74b2c9ec595ca3bc21a7c~mv2.jpg | Coreopsis lanceolata | false | false |
| Blazingstar | 94bd1f_866dca16b6444a3a88f005468821c479 | Liatris spicata | false | false |
| Purple Lovegrass | 94bd1f_8f658d4b079d4ac4a0cc986ca9356f06~mv2.jpg | Eragrostis spectabilis | false | **true** |
| Black-Eyed Susan | 94bd1f_d999bdf79f7f4395bdea532a6e0960d1~mv2.jpg | Rudbeckia fulgida | **true** | false |
| Purple Coneflower | 94bd1f_14557c6680704ccdb1388a3c9bb78bb1~mv2.jpg | Echinacea purpurea | **true** | false |
| Rough Goldenrod | 94bd1f_f0ae2d7f5bdf40be9bae834522028f05~mv2.jpg | Solidago rugosa | **true** | false |
| Smooth Aster | 94bd1f_ab0ec431fb7649729106b8d57fbfc17e~mv2.jpg | Symphyotrichum laeve | **true** | false |
| Blunt Mountain-Mint | 94bd1f_05477fc754bf4d58b3f73fcc91812c25~mv2.jpg | Pycnanthemum muticum | false | false |
| Butterfly Weed | (use same as img) | Asclepias tuberosa | **true** | false |

---

## 4. ADD JAVASCRIPT (add these functions and handlers)

```javascript
let showPlantImages = false;

// === INFO PANEL COLLAPSE ===
$('infoCollapseBtn').onclick=()=>{
  state.infoPanelCollapsed = !state.infoPanelCollapsed;
  $('infoPanel').classList.toggle('collapsed', state.infoPanelCollapsed);
  $('infoCollapseBtn').textContent = state.infoPanelCollapsed ? '▲' : '▼';
};

// === SHOW PLANT IMAGES TOGGLE ===
$('showImgChk').onchange=(e)=>{
  showPlantImages = e.target.checked;
  $('gardenCanvas').querySelectorAll('.plant').forEach(el=>{
    el.classList.toggle('show-img', showPlantImages);
  });
  toast(showPlantImages ? 'Plant images shown' : 'Plant images hidden');
};

// === UPDATE INFO PANEL ===
function updateInfoPanel(){
  const c = counts();
  const plantCount = state.plants.length;
  const speciesCount = Object.keys(c).length;
  const a = area();
  
  // Calculate coverage estimate
  const coveragePct = a > 0 ? Math.min(100, Math.round((plantCount * 0.8 / a) * 100)) : 0;
  
  // Update stats
  $('infoPlantCount').textContent = plantCount;
  $('infoCoverage').textContent = coveragePct + '%';
  $('infoSpecies').textContent = speciesCount;
  
  // Generate AI tips
  generateAITips(plantCount, speciesCount, coveragePct, c);
}

function generateAITips(plantCount, speciesCount, coverage, counts){
  const tip1 = $('aiTip1');
  const tip2 = $('aiTip2');
  const tipText1 = $('aiTipText1');
  const tipText2 = $('aiTipText2');
  
  // Check for keystone species
  const hasKeystone = Object.keys(counts).some(name => {
    const p = PLANTS.find(x=>x.name===name);
    return p && p.isKeystone;
  });
  
  // Check for grasses
  const hasGrass = Object.keys(counts).some(name => {
    const p = PLANTS.find(x=>x.name===name);
    return p && p.isGrass;
  });
  
  // Get bloom coverage
  const bloomMonths = new Set();
  Object.keys(counts).forEach(name => {
    const p = PLANTS.find(x=>x.name===name);
    if(p && p.bloom) p.bloom.forEach(m => bloomMonths.add(m));
  });
  
  // Primary tip
  if(plantCount === 0){
    tipText1.textContent = 'Select a plant below to start designing';
    tip1.className = 'aiTip';
  } else if(!hasKeystone){
    tipText1.textContent = 'Add a keystone species (🦋) for ecological impact';
    tip1.className = 'aiTip warning';
  } else if(coverage < 50){
    tipText1.textContent = `${coverage}% coverage — add more plants for weed suppression`;
    tip1.className = 'aiTip';
  } else if(coverage >= 75){
    tipText1.textContent = 'Great coverage! Plants will crowd out weeds';
    tip1.className = 'aiTip success';
  } else {
    tipText1.textContent = 'Looking good! Consider adding variety';
    tip1.className = 'aiTip';
  }
  
  // Secondary tip
  tip2.style.display = 'block';
  if(!hasGrass && plantCount > 0){
    tipText2.textContent = 'Add a grass for texture (try Purple Lovegrass)';
  } else if(bloomMonths.size < 3 && plantCount > 2){
    tipText2.textContent = 'Add plants for 3-season bloom coverage';
  } else if(speciesCount < 3 && plantCount > 4){
    tipText2.textContent = 'More variety = better ecosystem';
  } else if(plantCount > 0){
    tipText2.textContent = 'Group plants in 3s or 5s for natural look';
  } else {
    tip2.style.display = 'none';
  }
}

// === SHOW PLANT DETAILS WHEN SELECTED ===
function showPlantDetails(idx){
  const p = PLANTS[idx];
  if(!p || p.isBlank) {
    hidePlantDetails();
    return;
  }
  
  $('infoDefault').style.display = 'none';
  $('plantPreview').style.display = 'flex';
  
  // Use productImg if available, otherwise fall back to img
  $('previewImg').src = p.productImg || p.img;
  $('previewName').textContent = p.name;
  $('previewSciName').textContent = p.sciName || '';
  $('previewHeight').textContent = p.height || '—';
  $('previewLight').textContent = p.light || '—';
  
  // Format bloom months
  if(p.bloom && p.bloom.length > 0){
    const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const bloomStr = p.bloom.map(m => months[m]).join(', ');
    $('previewBloom').textContent = bloomStr;
  } else {
    $('previewBloom').textContent = '—';
  }
  
  // Show keystone badge if applicable
  $('keystoneRow').style.display = p.isKeystone ? 'block' : 'none';
  
  $('infoPanelTitle').textContent = p.name;
}

function hidePlantDetails(){
  $('infoDefault').style.display = 'flex';
  $('plantPreview').style.display = 'none';
  $('infoPanelTitle').textContent = 'Plant Info & Tips';
}

// === UPDATE selPlant FUNCTION ===
// Find the existing selPlant function and add this at the end:
function selPlant(i){
  state.selPlant=i;
  document.querySelectorAll('.pItem').forEach((e,j)=>e.classList.toggle('sel',j===i));
  $('hint').classList.remove('hid');
  const p = PLANTS[i];
  if(p.isBlank){
    $('hint').textContent=`👆 Tap garden to place blank marker`;
    hidePlantDetails();
  } else {
    $('hint').textContent=`👆 Tap garden to place ${p.name}`;
    showPlantDetails(i); // ADD THIS LINE
  }
}

// === MODIFY place() FUNCTION ===
// Add plant image to the plant element when placed:
function place(idx,x,y){
  const p=PLANTS[idx],sz=(p.size/12)*FT,r=sz/2;
  if(!inside(x,y,r)){toast('Place inside garden');return;}
  if(!allowOverlap&&overlap(x,y,r,null)){toast('Too close to another plant');return;}

  const el=document.createElement('div');
  el.className='plant' + (showPlantImages ? ' show-img' : '');
  el.id='p'+Date.now();
  el.style.width=sz+'px';el.style.height=sz+'px';
  el.style.left=(x-r)+'px';el.style.top=(y-r)+'px';
  el.style.borderColor=getPlantColor(idx);
  el.dataset.idx=idx;el.dataset.cx=x;el.dataset.cy=y;
  
  // ADD plant image element
  const imgUrl = p.productImg || p.img;
  el.innerHTML=`
    <span class="acr" style="color:${getPlantColor(idx)}">${p.acr}</span>
    ${imgUrl ? `<img class="plant-img" src="${imgUrl}" alt="${p.name}">` : ''}
  `;

  $('gardenCanvas').appendChild(el);
  state.plants.push({id:el.id,idx,name:p.name,cx:x,cy:y});
  makeDrag(el);makeDbl(el);
  toast(p.name+' placed');
  state.undo.push({el,data:{id:el.id,idx,name:p.name,cx:x,cy:y}});
  markDirty();
}

// === CALL updateInfoPanel() IN markDirty() ===
function markDirty(){
  state.dirty=true;
  state.saved=false;
  $('saveStat').textContent='Not Saved';
  $('saveStat').className='badge pend';
  updateInfoPanel(); // ADD THIS LINE
}
```

---

## 6. AI CHAT FUNCTIONALITY

Add this JavaScript for the "Ask AI" feature:

```javascript
// ============================================
// === AI CHAT SYSTEM ===
// ============================================

// Configuration - Replace with your API endpoint
const AI_CONFIG = {
  // Option A: Direct OpenAI (requires API key exposed - not recommended for production)
  // endpoint: 'https://api.openai.com/v1/chat/completions',
  // apiKey: 'sk-...',
  
  // Option B: Your Vercel backend (RECOMMENDED)
  endpoint: 'https://ecoplantia.vercel.app/api/ai/chat',
  
  // Option C: For testing without API
  useMockResponses: true  // Set to false when backend is ready
};

let chatHistory = [];

// === OPEN/CLOSE CHAT MODAL ===
$('askAiBtn').onclick = () => {
  $('aiChatModal').classList.add('vis');
  // Send initial context message
  if(chatHistory.length === 0){
    addBotMessage(getWelcomeMessage());
  }
};

$('aiChatClose').onclick = () => {
  $('aiChatModal').classList.remove('vis');
};

// Close on backdrop click
$('aiChatModal').onclick = (e) => {
  if(e.target === $('aiChatModal')){
    $('aiChatModal').classList.remove('vis');
  }
};

// === QUICK QUESTION CHIPS ===
document.querySelectorAll('.quickQ').forEach(btn => {
  btn.onclick = () => {
    const question = btn.dataset.q;
    sendMessage(question);
  };
});

// === SEND MESSAGE ===
$('aiChatSend').onclick = () => sendUserMessage();
$('aiChatInputField').onkeypress = (e) => {
  if(e.key === 'Enter') sendUserMessage();
};

function sendUserMessage(){
  const input = $('aiChatInputField');
  const msg = input.value.trim();
  if(!msg) return;
  
  input.value = '';
  sendMessage(msg);
}

async function sendMessage(userMsg){
  // Add user message to chat
  addUserMessage(userMsg);
  
  // Show loading indicator
  const loadingEl = addLoadingMessage();
  
  // Get AI response
  const response = await getAIResponse(userMsg);
  
  // Remove loading, add response
  loadingEl.remove();
  addBotMessage(response);
}

function addUserMessage(msg){
  const el = document.createElement('div');
  el.className = 'aiMsg user';
  el.textContent = msg;
  $('aiChatMessages').appendChild(el);
  scrollChatToBottom();
  chatHistory.push({ role: 'user', content: msg });
}

function addBotMessage(msg){
  const el = document.createElement('div');
  el.className = 'aiMsg bot';
  el.innerHTML = msg; // Allow HTML for formatting
  $('aiChatMessages').appendChild(el);
  scrollChatToBottom();
  chatHistory.push({ role: 'assistant', content: msg });
}

function addLoadingMessage(){
  const el = document.createElement('div');
  el.className = 'aiMsg loading';
  el.textContent = 'Thinking';
  $('aiChatMessages').appendChild(el);
  scrollChatToBottom();
  return el;
}

function scrollChatToBottom(){
  const container = $('aiChatMessages');
  container.scrollTop = container.scrollHeight;
}

// === GET DESIGN CONTEXT ===
function getDesignContext(){
  const c = counts();
  const plantList = Object.entries(c).map(([name, qty]) => {
    const p = PLANTS.find(x => x.name === name);
    return `${qty}x ${name}${p?.isKeystone ? ' (keystone)' : ''}${p?.isGrass ? ' (grass)' : ''}`;
  }).join(', ');
  
  const a = area();
  const plantCount = state.plants.length;
  const speciesCount = Object.keys(c).length;
  
  // Get bloom months
  const bloomMonths = new Set();
  Object.keys(c).forEach(name => {
    const p = PLANTS.find(x => x.name === name);
    if(p?.bloom) p.bloom.forEach(m => bloomMonths.add(m));
  });
  
  const hasKeystone = Object.values(c).some((_, i) => {
    const name = Object.keys(c)[i];
    return PLANTS.find(x => x.name === name)?.isKeystone;
  });
  
  const hasGrass = Object.keys(c).some(name => 
    PLANTS.find(x => x.name === name)?.isGrass
  );
  
  return {
    sqft: Math.round(a),
    dimensions: `${state.wFt}×${state.dFt} ft`,
    plantCount,
    speciesCount,
    plantList: plantList || 'No plants yet',
    bloomMonths: Array.from(bloomMonths).sort((a,b) => a-b),
    hasKeystone,
    hasGrass,
    shape: state.shape
  };
}

function getWelcomeMessage(){
  const ctx = getDesignContext();
  
  if(ctx.plantCount === 0){
    return `👋 Hi! I'm your garden design assistant.<br><br>` +
           `I see you have a <b>${ctx.dimensions}</b> ${ctx.shape} bed (${ctx.sqft} sq ft).<br><br>` +
           `Start adding plants and I can help with:<br>` +
           `• Plant pairings & combinations<br>` +
           `• Pollinator recommendations<br>` +
           `• Bloom timing & coverage<br><br>` +
           `What would you like to know?`;
  }
  
  return `👋 Hi! I see you're designing a <b>${ctx.dimensions}</b> garden with <b>${ctx.plantCount} plants</b> (${ctx.speciesCount} species).<br><br>` +
         `<b>Your plants:</b> ${ctx.plantList}<br><br>` +
         `${!ctx.hasKeystone ? '⚠️ Tip: Consider adding a keystone species for ecological impact.<br><br>' : ''}` +
         `How can I help improve your design?`;
}

// === AI RESPONSE (with mock fallback) ===
async function getAIResponse(userMsg){
  const ctx = getDesignContext();
  
  // Use mock responses for testing (or when API not configured)
  if(AI_CONFIG.useMockResponses){
    return getMockResponse(userMsg, ctx);
  }
  
  // Real API call
  try {
    const systemPrompt = `You are a native plant garden design assistant for Ecoplantia. 
You help users design pollinator-friendly gardens with native plants.
Be concise (2-3 sentences max per point). Use emoji sparingly.
Current design context:
- Garden: ${ctx.dimensions} (${ctx.sqft} sq ft) ${ctx.shape}
- Plants: ${ctx.plantList}
- Has keystone species: ${ctx.hasKeystone}
- Has grasses: ${ctx.hasGrass}
- Bloom months: ${ctx.bloomMonths.join(', ') || 'none yet'}

Available plants to recommend: Coneflower, Black-Eyed Susan, Smooth Aster, Goldenrod, 
Blazing Star, Coreopsis, Mountain Mint, Purple Lovegrass, Butterfly Weed.`;

    const response = await fetch(AI_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory.slice(-6), // Last 6 messages for context
          { role: 'user', content: userMsg }
        ],
        context: ctx
      })
    });
    
    if(!response.ok) throw new Error('API error');
    
    const data = await response.json();
    return data.message || data.choices?.[0]?.message?.content || 'Sorry, I had trouble understanding. Try again?';
    
  } catch(err) {
    console.error('AI Chat error:', err);
    return getMockResponse(userMsg, ctx); // Fallback to mock
  }
}

// === MOCK RESPONSES (for testing without API) ===
function getMockResponse(userMsg, ctx){
  const q = userMsg.toLowerCase();
  
  // Plant pairing questions
  if(q.includes('pair') || q.includes('combo') || q.includes('together')){
    if(ctx.plantList.includes('Coneflower')){
      return `Great choice with Coneflower! 🌸<br><br>` +
             `<b>Perfect pairings:</b><br>` +
             `• <b>Black-Eyed Susan</b> - blooms overlap for continuous summer color<br>` +
             `• <b>Smooth Aster</b> - takes over when Coneflower fades (fall bloom)<br>` +
             `• <b>Purple Lovegrass</b> - adds texture and movement`;
    }
    return `For a balanced design, try these combinations:<br><br>` +
           `<b>Summer backbone:</b> Coneflower + Black-Eyed Susan<br>` +
           `<b>Fall finale:</b> Goldenrod + Smooth Aster<br>` +
           `<b>Texture:</b> Add Purple Lovegrass between flowering plants`;
  }
  
  // Butterfly questions
  if(q.includes('butterfly') || q.includes('butterflies') || q.includes('monarch')){
    return `🦋 <b>Top butterfly plants:</b><br><br>` +
           `• <b>Butterfly Weed</b> - essential for Monarchs (host plant!)<br>` +
           `• <b>Coneflower</b> - attracts 16+ butterfly species<br>` +
           `• <b>Blazing Star</b> - Monarchs love it during migration<br><br>` +
           `${!ctx.plantList.includes('Butterfly Weed') ? '💡 I\'d recommend adding Butterfly Weed to your design!' : '✅ You already have Butterfly Weed - great choice!'}`;
  }
  
  // Pollinator questions
  if(q.includes('pollinator') || q.includes('bee') || q.includes('bees')){
    return `🐝 <b>Pollinator powerhouses:</b><br><br>` +
           `• <b>Mountain Mint</b> - #1 bee magnet, attracts 50+ species<br>` +
           `• <b>Goldenrod</b> - critical late-season nectar source<br>` +
           `• <b>Coneflower</b> - long bloom period = sustained food<br><br>` +
           `${ctx.hasKeystone ? '✅ Your keystone species are doing heavy lifting!' : '💡 Add a keystone species for maximum impact.'}`;
  }
  
  // Fall color questions
  if(q.includes('fall') || q.includes('autumn') || q.includes('september') || q.includes('october')){
    return `🍂 <b>Fall color champions:</b><br><br>` +
           `• <b>Smooth Aster</b> - purple blooms Sept-Oct<br>` +
           `• <b>Goldenrod</b> - golden yellow Aug-Oct<br>` +
           `• <b>Purple Lovegrass</b> - pink seed heads through fall<br><br>` +
           `${ctx.bloomMonths.includes(9) || ctx.bloomMonths.includes(10) ? '✅ You have fall coverage!' : '⚠️ Your garden needs more fall bloomers!'}`;
  }
  
  // Coverage/spacing questions
  if(q.includes('coverage') || q.includes('spacing') || q.includes('how many')){
    const recommendedCount = Math.round(ctx.sqft * 1.2);
    return `📐 <b>For your ${ctx.sqft} sq ft garden:</b><br><br>` +
           `• Recommended: <b>${recommendedCount-5} to ${recommendedCount+5} plants</b><br>` +
           `• You currently have: <b>${ctx.plantCount} plants</b><br><br>` +
           `${ctx.plantCount < recommendedCount - 5 ? '💡 Add more plants for better weed suppression and fuller look.' : '✅ Good plant density!'}`;
  }
  
  // General/default response
  return `Based on your ${ctx.dimensions} garden with ${ctx.plantCount} plants:<br><br>` +
         `${!ctx.hasKeystone ? '• Add a <b>keystone species</b> (Coneflower, Goldenrod, or Aster) for ecological impact<br>' : ''}` +
         `${!ctx.hasGrass ? '• Add a <b>grass</b> (Purple Lovegrass) for texture and year-round interest<br>' : ''}` +
         `${ctx.bloomMonths.length < 4 ? '• Diversify <b>bloom times</b> for 3-season color<br>' : ''}` +
         `<br>What specific aspect would you like help with?`;
}
```

---

## 7. BACKEND ENDPOINT (for Vercel)

---

## 5. WIDE MODE CSS ADDITIONS (add to wide-mode section)

```css
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

## Summary of Changes

1. **Info Panel** - Shows plant image, name, scientific name, and key facts when a plant is selected
2. **AI Tips** - Dynamic tips based on design state (coverage, keystone species, grasses, bloom)
3. **Show Images Toggle** - Toggle to show actual plant photos inside design circles
4. **Real-time Stats** - Plant count, coverage %, species count
5. **Keystone Badges** - Visual indicator for keystone species

The info panel appears below the plant tray and updates automatically as you design!

When the Vercel backend is ready, create this endpoint:

```javascript
// /api/ai/chat.js (Vercel serverless function)

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, context } = req.body;

    const systemPrompt = `You are a native plant garden design assistant for Ecoplantia. 
You help users design pollinator-friendly gardens with native plants.
Be concise (2-3 sentences max per point). Use simple HTML for formatting (<b>, <br>).
Use emoji sparingly for visual interest.

Current design context:
- Garden: ${context.dimensions} (${context.sqft} sq ft) ${context.shape}
- Plants: ${context.plantList}
- Has keystone species: ${context.hasKeystone}
- Has grasses: ${context.hasGrass}
- Bloom months: ${context.bloomMonths?.join(', ') || 'none yet'}

Available plants to recommend: 
- Coneflower (Echinacea purpurea) - keystone, 18" spacing
- Black-Eyed Susan (Rudbeckia fulgida) - keystone, 18" spacing  
- Smooth Aster (Symphyotrichum laeve) - keystone, 24" spacing
- Wrinkleleaf Goldenrod (Solidago rugosa) - keystone, 24" spacing
- Blazing Star (Liatris spicata) - 12" spacing
- Lanceleaf Coreopsis (Coreopsis lanceolata) - 12" spacing
- Mountain Mint (Pycnanthemum muticum) - 24" spacing
- Purple Lovegrass (Eragrostis spectabilis) - grass, 18" spacing
- Butterfly Weed (Asclepias tuberosa) - keystone, 24" spacing

Focus on ecological benefits, pollinator value, and practical design advice.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-8) // Keep last 8 messages for context
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const message = completion.choices[0].message.content;

    return res.status(200).json({ message });

  } catch (error) {
    console.error('AI Chat error:', error);
    return res.status(500).json({ 
      error: 'AI service error',
      message: 'Sorry, I had trouble processing that. Please try again.'
    });
  }
}
```

---

## Summary of Two-Tier System

### Tier 1: Instant Tips (Always Visible)
- **Coverage feedback**: "65% coverage — add more plants"
- **Missing elements**: "Add a keystone species" / "Add a grass"
- **Bloom gaps**: "Add plants for fall color"
- **Placement tips**: "Group in 3s or 5s"

These update automatically as the user designs - no API call needed.

### Tier 2: AI Chat (On Demand)
User taps **"✨ Ask AI for advice"** button to open chat modal:

```
┌─────────────────────────────────────────────┐
│  ✨ Garden AI Assistant              [×]    │
├─────────────────────────────────────────────┤
│                                             │
│  👋 Hi! I see you're designing a 8×4 ft    │
│  garden with 12 plants (5 species).         │
│                                             │
│  Your plants: 3x Coneflower, 2x Aster...   │
│                                             │
│  How can I help improve your design?        │
│                                             │
│                    What plants pair well? → │
│                                             │
│  Great choice with Coneflower! 🌸           │
│  Perfect pairings:                          │
│  • Black-Eyed Susan - overlapping bloom    │
│  • Smooth Aster - fall continuation        │
│                                             │
├─────────────────────────────────────────────┤
│ [🌸 Pairings] [🦋 Butterflies] [🍂 Fall]   │
├─────────────────────────────────────────────┤
│ [Ask about your garden design...    ] [➤]  │
└─────────────────────────────────────────────┘
```

### Quick Question Chips
Pre-built questions users can tap:
- 🌸 Plant pairings
- 🦋 Butterflies  
- 🍂 Fall color
- 🐝 Pollinators

### Mock Responses
The system works even WITHOUT an API connection using intelligent mock responses based on the design context. When the Vercel backend is ready, just set:

```javascript
AI_CONFIG.useMockResponses = false
```

And it will start calling your real API endpoint!
