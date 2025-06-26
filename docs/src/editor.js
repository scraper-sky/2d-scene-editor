import { addSprite, removeSprite } from './tools/addRemove.js';
import { enableMoveTool }          from './tools/move.js';
import { scaleSprite }             from './tools/scale.js';
import { saveSceneJSON, loadSceneJSON } from './tools/saveLoad.js';
import { pushToAI } from './ai.js';

/**
 * Hooks up UI buttons and canvas interactions to your scene tools.
 *
 * @param {SceneManager} sceneManager 
 * @param {Phaser.Scene} scene         
 */
export function setupEditor(sceneManager, scene) {
  let selectedId = null;

  // Keep an in-memory list of uploaded assets
  const uploaded = [];
  const uploadInput = document.getElementById('uploadAsset');
  const assetMenu   = document.getElementById('asset-menu');

  // Build or rebuild the asset-menu UI
  function updateAssetMenu() {
    assetMenu.innerHTML = '';
    uploaded.forEach(({ key, dataURL }) => {
      const btn = document.createElement('button');
      btn.title = key;
      btn.innerHTML = `<img src="${dataURL}">`;
      btn.onclick = () => {
        const { width, height } = scene.scale.gameSize;
        const sprite = addSprite(
          scene, sceneManager, key,
          width / 2, height / 2
        );
        sprite.setTint(0x00ff00);
      };
      assetMenu.appendChild(btn);
    });
    localStorage.setItem('uploadedAssets', JSON.stringify(uploaded));
  }

  // Load persisted uploads on startup
  const saved = JSON.parse(localStorage.getItem('uploadedAssets') || '[]');
  if (saved.length) {
    saved.forEach(({ key, dataURL }) => {
      scene.textures.addBase64(key, dataURL);
      uploaded.push({ key, dataURL });
    });
    updateAssetMenu();
  }

  // Handle new file uploads
  uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const key = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result;
      scene.textures.addBase64(key, dataURL);
      uploaded.push({ key, dataURL });
      updateAssetMenu();
    };
    reader.readAsDataURL(file);
    uploadInput.value = '';
  });

  // Make all loaded objects interactive so clicks register
  Object.values(sceneManager.sprites).forEach(obj => {
    // for sprites and primitives alike
    obj.setInteractive({ draggable: true });
  });

  // Global drag handler
  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // set the sprite to where the pointer is
    gameObject.x = dragX;
    gameObject.y = dragY;
  
    // persist into sceneManager
    sceneManager.updateTransform(gameObject.name, {
      x: dragX,
      y: dragY
    });
  });

  // Canvas click → select sprite or primitive under pointer
  scene.input.on('gameobjectdown', (pointer, gameObject) => {
    // clear previous highlight
    Object.values(sceneManager.sprites).forEach(o => {
      o.setAlpha(1);  // reset all to full opacity
    });

    // highlight the clicked object
    selectedId = gameObject.name;
    gameObject.setAlpha(0.5);

    // sprite?
    if (typeof gameObject.setTint === 'function') {
      gameObject.setTint(0xff0000);
    }
    // primitive?
    else if (typeof gameObject.setFillStyle === 'function') {
      gameObject.setFillStyle(0xff0000);
    }
  });

  // Add button → prompt for asset key, then add at center
  document.getElementById('addButton').addEventListener('click', () => {
    const key = prompt('Enter asset key (must be preloaded):');
    if (!key) return;
    const { centerX, centerY } = scene.cameras.main;
    addSprite(scene, sceneManager, key, centerX, centerY);

    // make new sprite interactive and auto-select it
    const newId = `${key}${sceneManager.idCounters[key] - 1}`;
    const newObj = sceneManager.getSpriteById(newId);
    newObj.setInteractive({ draggable: true });
    newObj.emit('pointerdown');
  });

  // Remove button → delete selected object
  document.getElementById('removeButton').addEventListener('click', () => {
    if (!selectedId) return;
    removeSprite(scene, sceneManager, selectedId);
    selectedId = null;
  });

  // Move button → enable dragging on the selected object
  document.getElementById('moveButton').addEventListener('click', () => {
    if (!selectedId) return;
    const obj = sceneManager.getSpriteById(selectedId);
    enableMoveTool(scene, sceneManager, obj);
  });

  // Scale button → prompt for factor and apply to selected
  document.getElementById('scaleButton').addEventListener('click', () => {
    if (!selectedId) return;
    const f = parseFloat(prompt('Scale factor (e.g. 1.1 or 0.8):'));
    if (isNaN(f)) return;
    scaleSprite(sceneManager, selectedId, f);
  });

  // Push-to-AI stub
  document.getElementById('pushAiButton').addEventListener('click', async () => {
    const instr = document.getElementById('aiInstruction').value.trim();
    if (!instr) {
      return alert('Please enter an instruction above.');
    }
    // disable the button while we wait
    const btn = document.getElementById('pushAiButton');
    btn.disabled = true;
    btn.textContent = 'Thinking…';

    try {
      await pushToAI(sceneManager, instr);
    } catch (e) {
      console.error('AI push failed', e);
      alert('AI call failed, see console.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Push to AI';
    }
  });

  // Save Scene → download current scene.json
  document.getElementById('saveButton').addEventListener('click', () => {
    saveSceneJSON(sceneManager);
  });

  // Load Scene → open file picker
  document.getElementById('loadButton').addEventListener('click', () => {
    document.getElementById('loadInput').click();
  });
  // When a file is chosen, read & apply it
  document.getElementById('loadInput').addEventListener('change', (e) => {
    loadSceneJSON(e, sceneManager);
  });
}
