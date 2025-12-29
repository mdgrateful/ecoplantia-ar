const fs = require('fs');

// Read the original file
let content = fs.readFileSync('C:/Users/carba/Downloads/ecoplantia-designer-v11.html', 'utf8');

console.log('Applying AI Panel patch to ecoplantia-designer-v11.html (v2)...\n');

// CHANGE 1: Add CSS Variable --info-panel to :root (with 4-space indent)
const change1Old = `    :root {
      --top: 44px;
      --bottom: 50px;
      --tray: 56px;
      --ctrl: 40px;
      --side: 0px;
      --scale: 1;
    }`;

const change1New = `    :root {
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

// CHANGE 2: Add Wide Mode CSS Variable (search for pattern)
const wideModePat = /body\.wide-mode \{\s*--top: 28px;\s*--bottom: 0px;\s*--tray: 44px;\s*--ctrl: 28px;\s*--side: 36px;\s*\}/;
if (wideModePat.test(content)) {
  content = content.replace(wideModePat, `body.wide-mode {
      --top: 28px;
      --bottom: 0px;
      --tray: 44px;
      --ctrl: 28px;
      --side: 36px;
      --info-panel: 70px;
    }`);
  console.log('✓ CHANGE 2: Added --info-panel to body.wide-mode');
} else {
  console.log('✗ CHANGE 2: Could not find body.wide-mode block');
}

// CHANGE 8: Update PLANTS Array - match actual format
const plantsMatch = content.match(/const PLANTS=\[\s*\{name:'Lanceleaf Coreopsis'[\s\S]*?\{name:'Toolbox'[^\}]+\}\s*\];/);
if (plantsMatch) {
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
      {name:'Toolbox',acr:'TBX',size:18,isBlank:true,
       sciName:'',isKeystone:false,isGrass:false,
       light:'',bloom:'',
       img:'',productImg:''}
    ];`;
  content = content.replace(plantsMatch[0], newPlants);
  console.log('✓ CHANGE 8: Updated PLANTS array with extended data');
} else {
  console.log('✗ CHANGE 8: Could not find PLANTS array');
}

// CHANGE 10: Add Info Panel Functions - look for summary or a good insertion point
const summaryPatterns = [
  '// ===== SUMMARY =====',
  '// SUMMARY',
  'function summary(',
  'function showSummary('
];

let insertPoint = null;
for (const pat of summaryPatterns) {
  if (content.includes(pat)) {
    insertPoint = pat;
    break;
  }
}

const infoPanelFunctions = `// ===== AI INFO PANEL =====
    function updateInfoPanel() {
      if (!$('infoPlantCount')) return; // Guard if panel not yet created
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
      if (!tip1) return;

      tip1.className = 'aiTip';
      tip2.style.display = 'none';

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
          tipText2.textContent = 'Add keystone species for wildlife!';
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
      if (!$('infoDefault')) return;
      if (!plant || plant.isBlank) {
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
      $('previewBloom').textContent = plant.bloom || '';

      const keystoneRow = $('keystoneRow');
      keystoneRow.style.display = plant.isKeystone ? 'block' : 'none';
    }

    function hidePlantDetails() {
      if (!$('infoDefault')) return;
      $('infoDefault').style.display = 'flex';
      $('plantPreview').style.display = 'none';
    }

    function togglePlantImages(show) {
      showPlantImages = show;
      document.querySelectorAll('.plant').forEach(el => {
        el.classList.toggle('show-img', show);
      });
    }

    `;

if (insertPoint) {
  content = content.replace(insertPoint, infoPanelFunctions + insertPoint);
  console.log('✓ CHANGE 10: Added Info Panel functions before ' + insertPoint);
} else {
  // Insert before </script>
  content = content.replace('</script>', infoPanelFunctions + '</script>');
  console.log('✓ CHANGE 10: Added Info Panel functions before </script>');
}

// CHANGE 11: Update selPlant Function - match actual format
const selPlantMatch = content.match(/function selPlant\(i\)\{[\s\S]*?\$\('hint'\)\.classList\.remove\('hid'\);/);
if (selPlantMatch) {
  const newSelPlant = selPlantMatch[0] + `
      // Update info panel with selected plant details
      if (i >= 0 && i < PLANTS.length) {
        showPlantDetails(PLANTS[i]);
      } else {
        hidePlantDetails();
      }`;
  content = content.replace(selPlantMatch[0], newSelPlant);
  console.log('✓ CHANGE 11: Updated selPlant function');
} else {
  console.log('✗ CHANGE 11: Could not find selPlant function');
}

// CHANGE 12: Look for plant innerHTML pattern
const plantInnerPatterns = [
  /el\.innerHTML=`<span class="acr">\$\{p\.acr\}<\/span>`;/,
  /el\.innerHTML\s*=\s*`<span class="acr">\$\{[^}]+\}<\/span>`;/
];

let change12Done = false;
for (const pat of plantInnerPatterns) {
  if (pat.test(content)) {
    content = content.replace(pat, 'el.innerHTML=`<span class="acr">${p.acr}</span><img class="plant-img" src="${p.productImg || p.img || \'\'}" alt="${p.name}">`;\n      if (showPlantImages) el.classList.add(\'show-img\');');
    console.log('✓ CHANGE 12: Updated place function to include image');
    change12Done = true;
    break;
  }
}
if (!change12Done) {
  console.log('✗ CHANGE 12: Could not find plant innerHTML pattern');
}

// CHANGE 13: Look for placed.push pattern
const placedPushPat = /placed\.push\(\{[^}]+\}\);/;
const placedPushMatch = content.match(placedPushPat);
if (placedPushMatch) {
  content = content.replace(placedPushMatch[0], placedPushMatch[0] + '\n      updateInfoPanel();');
  console.log('✓ CHANGE 13: Added updateInfoPanel after placing');
} else {
  console.log('✗ CHANGE 13: Could not find placed.push');
}

// CHANGE 14: Look for delete filter pattern
const deletePat = /placed\s*=\s*placed\.filter\([^)]+\);/;
const deleteMatch = content.match(deletePat);
if (deleteMatch) {
  content = content.replace(deleteMatch[0], deleteMatch[0] + '\n        updateInfoPanel();');
  console.log('✓ CHANGE 14: Added updateInfoPanel after deleting');
} else {
  console.log('✗ CHANGE 14: Could not find placed.filter for delete');
}

// CHANGE 18: Look for undo state restoration
const undoPat = /placed\s*=\s*state\.placed\.map\([^)]+\);/;
const undoMatch = content.match(undoPat);
if (undoMatch) {
  content = content.replace(undoMatch[0], undoMatch[0] + '\n      updateInfoPanel();');
  console.log('✓ CHANGE 18: Added updateInfoPanel after undo');
} else {
  // Try alternate pattern
  const undoPat2 = /placed\s*=\s*[^;]+placed[^;]*;/;
  console.log('✗ CHANGE 18: Could not find undo restoration pattern');
}

// Write the patched file
const outputPath = 'C:/Users/carba/Downloads/ecoplantia-designer-v11-patched.html';
fs.writeFileSync(outputPath, content);
console.log('\n✅ Patched file saved to: ' + outputPath);
