// src/main.js
import { SceneManager }   from './sceneManager.js';
import { setupEditor }    from './editor.js';

// Define Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-canvas',  // make sure index.html has <div id="phaser-canvas"></div>
  scene: {
    preload,
    create,
    update: () => {}
  }
};

// Create the Phaser.Game instance
const game = new Phaser.Game(config);

// Local reference to our SceneManager
let sceneManager;

// Preload function: load assets and the scene manifest
function preload() {
  // Instantiate the SceneManager so it can register its loader hooks
  sceneManager = new SceneManager(this);

  // SceneManager.preload() will load scene.json and on filecomplete-json-sceneData, queue only sprite image loads
  sceneManager.preload();

}

// Create function: build the scene and editor
function create() {
  // Instantiate sprites from scene.json
  sceneManager.create();
  console.log("Loaded scene:", sceneManager.getTransformMap());
  // Now wire up the editor controls (selection, add/remove, move, scale, push-to-AI)
  setupEditor(sceneManager, this);
}

// update loop for per-frame logic (optional)
function update(time, delta) {
  // currently empty; tools handle their own events
}