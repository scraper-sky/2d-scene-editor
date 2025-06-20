import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';

/**
 * Adds a new sprite to the scene and updates the transform map.
 * @param {Phaser.Scene} scene 
 * @param {Object} sceneManager  // your sceneManager instance
 * @param {string} key          // asset key to use
 * @param {number} x 
 * @param {number} y
 */
export function addSprite(scene, sceneManager, key, x = 0, y = 0) { //mark these functions exportable 
  const id = sceneManager.generateId(key); //we add independent identifiers based on asset key
  if (!sprite) return;
  const sprite = scene.add.sprite(x, y, key) //spawns new phaser sprite using loaded texture from key
    .setName(id); //later lookups by name the generated ID
  sceneManager.registerSprite(sprite, { x, y, rotation: 0, scale: 1 }); 
}

/**
 * Removes the currently selected sprite from scene and map.
 * @param {Phaser.Scene} scene 
 * @param {Object} sceneManager 
 * @param {string} id           // id of sprite to remove
 */
export function removeSprite(scene, sceneManager, id) {
  const sprite = scene.children.getByName(id); //obtain sprite identifier
  if (!sprite) return;
  sprite.destroy(); //delete it 
  sceneManager.unregisterId(id); //unregister its identifier
}
