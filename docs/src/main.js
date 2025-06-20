// src/main.js
import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';
import { SceneManager }   from './sceneManager.js';
import { setupEditor }    from './editor.js';

// Define Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-canvas',  // make sure your index.html has <div id="phaser-canvas"></div>
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
  // Load image assets here
  // e.g. this.load.image('hero', 'assets/hero.png');
  //      this.load.image('tree', 'assets/tree.png');
  // Make sure any `key` referenced in scene.json is preloaded above.

  // Load the JSON manifest
  sceneManager = new SceneManager(this);
  sceneManager.preload();
}

// 5) Create function: build the scene and editor
function create() {
  // Instantiate sprites from scene.json
  sceneManager.create();

  // Now wire up the editor controls (selection, add/remove, move, scale, push-to-AI)
  setupEditor(sceneManager, this);
}

// 6) (Optional) update loop, if you need per-frame logic
function update(time, delta) {
  // currently empty; tools handle their own events
}
