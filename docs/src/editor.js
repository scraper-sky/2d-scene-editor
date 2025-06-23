import { addSprite, removeSprite } from './tools/addRemove.js';
import { enableMoveTool }          from './tools/move.js';
import { scaleSprite }             from './tools/scale.js';

/**
 * Hooks up UI buttons and canvas interactions to your scene tools.
 *
 * @param {SceneManager} sceneManager 
 * @param {Phaser.Scene} scene         
 */
export function setupEditor(sceneManager, scene) {
  let selectedId = null;

  // Make all loaded objects interactive so clicks register
  Object.values(sceneManager.sprites).forEach(obj => {
    // for sprites and primitives alike
    obj.setInteractive({ draggable: true });
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
    console.log('Push to AI clicked; will call ai.pushToAI()');
  });
}
