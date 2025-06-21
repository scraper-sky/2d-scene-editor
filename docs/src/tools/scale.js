
/**
 * Scales the selected sprite up/down and updates the map.
 * @param {Phaser.Scene} scene 
 * @param {Object} sceneManager 
 * @param {string} id 
 * @param {number} factor    // e.g. 1.1 to grow 10%, 0.9 to shrink
 */
export function scaleSprite(sceneManager, id, factor){ //set scaling for sprite
    const sprite = sceneManager.getSpriteById(id); //obtain sprite
    const newScale = sprite.scale * factor; //set its scale by a certain factor
    sprite.setScale(newScale); //update scale of the sprite
    sceneManager.updateTransform(id, {scale: newScale}); //update scale of the sprite relative to the scene
}