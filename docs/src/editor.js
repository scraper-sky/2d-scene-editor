// src/editor.js
import { addSprite, removeSprite } from './tools/addRemove.js';
import { enableMoveTool }          from './tools/move.js';
import { scaleSprite }             from './tools/scale.js';

/**
 * Hooks up UI buttons and canvas interactions to your scene tools.
 *
 * @param {SceneManager} sceneManager  Your scene manager instance
 * @param {Phaser.Scene} scene         The active Phaser scene
 */
export function setupEditor(sceneManager, scene) {
  // 1) Make all loaded sprites interactive so clicks register
  Object.keys(sceneManager.getTransformMap()).forEach(id => {
    const s = sceneManager.getSpriteById(id);
    s.setInteractive();
  });

  let selectedId = null;

  // 2) Canvas click → select sprite under pointer
  scene.input.on('gameobjectdown', (pointer, gameObject) => {
    // clear previous highlight
    Object.keys(sceneManager.getTransformMap()).forEach(id => {
      sceneManager.getSpriteById(id).clearTint();
    });
    // highlight new selection
    selectedId = gameObject.name;
    gameObject.setTint(0xff0000);
  });

  // 3) Add button → prompt for asset key, then add at center
  document.getElementById('addButton').addEventListener('click', () => {
    const key = prompt('Enter asset key (must be preloaded):');
    if (!key) return;
    // place new sprite at screen center
    const { centerX, centerY } = scene.cameras.main;
    addSprite(scene, sceneManager, key, centerX, centerY);
    // make it interactive and select it
    const newId = `${key}${sceneManager.idCounters[key]-1}`; 
    const newSprite = sceneManager.getSpriteById(newId);
    newSprite.setInteractive();
    // reuse selection logic
    newSprite.emit('pointerdown');
  });

  // 4) Remove button → delete selected sprite
  document.getElementById('removeButton').addEventListener('click', () => {
    if (!selectedId) return;
    removeSprite(scene, sceneManager, selectedId);
    selectedId = null;
  });

  // 5) Move button → enable dragging on the selected sprite
  document.getElementById('moveButton').addEventListener('click', () => {
    if (!selectedId) return;
    const sprite = sceneManager.getSpriteById(selectedId);
    enableMoveTool(scene, sceneManager, sprite);
  });

  // 6) Scale button → prompt for factor and apply to selected
  document.getElementById('scaleButton').addEventListener('click', () => {
    if (!selectedId) return;
    const f = parseFloat(prompt('Scale factor (e.g. 1.1 or 0.8):'));
    if (isNaN(f)) return;
    scaleSprite(sceneManager, selectedId, f);
  });

  // 7) Push-to-AI button → stub for later ai.js integration
  document.getElementById('pushAiButton').addEventListener('click', () => {
    // we’ll flesh this out once ai.js is ready
    console.log('Push to AI clicked; will call ai.pushToAI()');
  });
}
