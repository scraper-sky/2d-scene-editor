import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';

/**
 * Enables drag on a given sprite and hooks into sceneManager.
 * @param {Phaser.Scene} scene 
 * @param {Object} sceneManager 
 * @param {Phaser.GameObjects.Sprite} sprite 
 */

export function enableMoveTool(scene, sceneManager, sprite){
    sprite.setInteractive({ draggable: true}); //mark the sprite as draggable so it can respond to pointer events
    scene.input.setDraggable(sprite); //register's this object within the scene's Drag plugin 

    scene.input.on('dragend', (pointer, obj) => { //listen for dragend event in the entire scene 
        const { x, y} = obj; //pulls new x and y coordinates directly off the sprite after it's been moved by Phaser
        sceneManager.updateTransform(obj.name, {x, y}); //calls into sceneManager and passes sprite's names and new updated locations
    })
}