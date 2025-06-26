
/**
 * Adds a new sprite to the scene and updates the transform map.
 * @param {Phaser.Scene} scene 
 * @param {Object} sceneManager  //sceneManager instance
 * @param {string} key          // asset key to use
 * @param {number} x 
 * @param {number} y
 */
export function addSprite(scene, sceneManager, key, x = 0, y = 0) {
  if (!key) return;

  // create unique ID and spawn
  const id = sceneManager.generateId(key);
  const sprite = scene.add.sprite(x, y, key).setName(id);

  // scale to a reasonable max dimension
  const { width: w, height: h } = scene.textures.get(key).getSourceImage();
  const maxDim = Math.max(w, h);
  if (maxDim > 100) {
    const s = 100 / maxDim;
    sprite.setScale(s);
  }

  // make draggable 
  sprite.setInteractive({ draggable: true });

  // register in sceneManager
  sceneManager.registerObject(sprite, {
    id,
    type: 'sprite',
    key,
    position: [x, y, 0],
    rotation: [0, 0, 0],
    scale:    [sprite.scaleX, sprite.scaleY, 1]
  });

  return sprite;
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
