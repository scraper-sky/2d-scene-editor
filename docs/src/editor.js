import { addSprite, removeSprite } from './tools/addRemove.js';
import { enableMoveTool }          from './tools/move.js';
import { scaleSprite }             from './tools/scale.js';
import { saveSceneJSON, loadSceneJSON } from './tools/saveLoad.js';
import { pushToAI }                from './ai.js';

/**
 * Hook up UI buttons and canvas interactions to scene tools.
 *
 * @param {SceneManager} sceneManager 
 * @param {Phaser.Scene} scene         
 */
export function setupEditor(sceneManager, scene) {
  let selectedId = null;

  // ————————————————————————————————
  // Asset-upload menu
  // ————————————————————————————————
  const uploaded   = [];
  const uploadInput= document.getElementById('uploadAsset');
  const assetMenu  = document.getElementById('asset-menu');

  function updateAssetMenu() {
    assetMenu.innerHTML = '';
    uploaded.forEach(({ key, dataURL }) => {
      const btn = document.createElement('button');
      btn.title = key;
      btn.innerHTML = `<img src="${dataURL}">`;
      btn.onclick = () => {
        const { width, height } = scene.scale.gameSize;
        const sprite = addSprite(scene, sceneManager, key, width/2, height/2);
        sprite.setTint(0x00ff00);
      };
      assetMenu.appendChild(btn);
    });
    localStorage.setItem('uploadedAssets', JSON.stringify(uploaded));
  }

  // load persisted uploads
  JSON.parse(localStorage.getItem('uploadedAssets') || '[]')
    .forEach(({ key, dataURL }) => {
      scene.textures.addBase64(key, dataURL);
      uploaded.push({ key, dataURL });
    });
  if (uploaded.length) updateAssetMenu();

  uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const key = file.name;
      const dataURL = reader.result;
      scene.textures.addBase64(key, dataURL);
      uploaded.push({ key, dataURL });
      updateAssetMenu();
    };
    reader.readAsDataURL(file);
    uploadInput.value = '';
  });

  // ————————————————————————————————
  // Make everything draggable & selectable
  // ————————————————————————————————
  Object.values(sceneManager.sprites)
    .forEach(obj => obj.setInteractive({ draggable: true }));

  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    sceneManager.updateTransform(gameObject.name, { x: dragX, y: dragY });
  });

  scene.input.on('gameobjectdown', (_p, gameObject) => {
    Object.values(sceneManager.sprites).forEach(o => o.setAlpha(1));
    selectedId = gameObject.name;
    gameObject.setAlpha(0.5);
    if (typeof gameObject.setTint === 'function') {
      gameObject.setTint(0xff0000);
    } else if (typeof gameObject.setFillStyle === 'function') {
      gameObject.setFillStyle(0xff0000);
    }
  });

  // ————————————————————————————————
  // Primitive-button DRY-up
  // ————————————————————————————————
  const primitiveButtons = [
    { btnId: 'addCircle',    shape: 'circle',    props: { radius: 30, fillColor: 0xff0000 } },
    { btnId: 'addRectangle', shape: 'rectangle', props: { width: 80, height: 60, fillColor: 0x00aa00 } },
    { btnId: 'addTriangle',  shape: 'triangle',  props: { width: 80, height: 60, fillColor: 0x0000ff } },
  ];

  primitiveButtons.forEach(({ btnId, shape, props }) => {
    document.getElementById(btnId).addEventListener('click', () => {
      const def = {
        id:       sceneManager.generateId(shape),
        type:     'primitive',
        shape,
        ...props,
        x:        scene.scale.width  / 2,
        y:        scene.scale.height / 2,
        rotation: 0,
        scale:    1
      };
      const obj = sceneManager.createPrimitive(def);
      if (obj) obj.setInteractive({ draggable: true });
    });
  });

  // ————————————————————————————————
  // Sprite-button
  // ————————————————————————————————
  document.getElementById('addButton').addEventListener('click', () => {
    const key = prompt('Enter asset key (must be preloaded):');
    if (!key) return;
    const { centerX, centerY } = scene.cameras.main;
    const sprite = addSprite(scene, sceneManager, key, centerX, centerY);
    sprite.setInteractive({ draggable: true });
    sprite.emit('pointerdown');
  });

  // ————————————————————————————————
  // Remove / Move / Scale / AI / Save / Load
  // ————————————————————————————————
  document.getElementById('removeButton').addEventListener('click', () => {
    if (!selectedId) return;
    removeSprite(scene, sceneManager, selectedId);
    selectedId = null;
  });

  document.getElementById('moveButton').addEventListener('click', () => {
    if (!selectedId) return;
    enableMoveTool(scene, sceneManager, sceneManager.getSpriteById(selectedId));
  });

  document.getElementById('scaleButton').addEventListener('click', () => {
    if (!selectedId) return;
    const f = parseFloat(prompt('Scale factor (e.g. 1.1 or 0.8):'));
    if (isNaN(f)) return;
    scaleSprite(sceneManager, selectedId, f);
  });

  document.getElementById('pushAiButton').addEventListener('click', async () => {
    const instr = document.getElementById('aiInstruction').value.trim();
    if (!instr) return alert('Please enter an instruction above.');
    const btn = document.getElementById('pushAiButton');
    btn.disabled = true; btn.textContent = 'Thinking…';
    try {
      await pushToAI(sceneManager, instr);
    } catch (e) {
      console.error('AI push failed', e);
      alert('AI call failed, see console.');
    } finally {
      btn.disabled = false; btn.textContent = 'Push to AI';
    }
  });

  document.getElementById('saveButton').addEventListener('click', () => {
    saveSceneJSON(sceneManager);
  });

  document.getElementById('loadButton').addEventListener('click', () => {
    document.getElementById('loadInput').click();
  });
  document.getElementById('loadInput').addEventListener('change', e => {
    loadSceneJSON(e, sceneManager);
  });
}
