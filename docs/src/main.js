// src/main.js
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
  sceneManager = new SceneManager(this);

  // load the JSON manifest
  this.load.json('sceneData', 'scene.json');

  // once the manifest’s arrived, pull every unique key and queue its image
  this.load.on('filecomplete-json-sceneData', () => {
    const defs = this.cache.json.get('sceneData') || [];
    const keys = Array.from(new Set(defs.map(d => d.key)));
    keys.forEach(key => {
      this.load.image(key, `assets/${key}.png`);
    });
    // restart the loader so it actually fetches those images
    this.load.start();
  });

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
