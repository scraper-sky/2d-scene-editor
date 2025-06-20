import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';

//here the code does a live-tracked storing of object positions, rotation, scale, and other metadata

export class SceneManager{
    /**
   * @param {Phaser.Scene} scene  The Phaser.Scene instance
   */
  constructor(scene){
    this.scene = scene;
    this.transformMap = {}; //holds the live/latest transform data for each object by its id
    this.sprite = {}; //reference to phaser sprites by id
  }

  /** Calls in preload(): loads scene.json into Phaser's cache */
  preload(){
    this.scene.load.json('sceneData', 'scene.json'); 
  }

  /** Calls in create(): reads sceneData and spawns each sprite  */
  create(){
    //grabs the parsed JSON array from cache
    const data = this.scene.cache.get('sceneData');

     //check and ensure an array of definitions
    if(!Array.isArray(data)){
        console.error('sceneData must be an array of object definitions')
        return;
    }

    data.forEach(def =>{
        const {id, 
            key, 
            x, y, 
            rotation = 0,
            scale = 1
        } = def;

        // spawn the sprite at defined locations
        const sprite = this.scene.add.sprite(x, y, key)
        .setName(id)
        .setScale(scale);
      sprite.rotation = Phaser.Math.DegToRad(rotation);

      // Store references for future lookup
      this.sprites[id] = sprite;
      this.transformMap[id] = { x, y, rotation, scale };

    })
  }
    /**
   * Generate a new unique ID for a given baseKey.
   * E.g. generateId('tree') → 'tree1', then 'tree2', etc.
   */
  generateId(baseKey) {
    if (!this.idCounters[baseKey]) {
      this.idCounters[baseKey] = 1;
    }
    let candidate;
    do {
      candidate = `${baseKey}${this.idCounters[baseKey]}`;
      this.idCounters[baseKey]++;
    } while (this.sprites[candidate]);
    return candidate;
  }

  /**
   * Register a newly created sprite into our maps.
   * Used by addRemove.addSprite().
   */
  registerSprite(sprite, { x, y, rotation = 0, scale = 1 }) {
    const id = sprite.name;
    this.sprites[id] = sprite;
    this.transformMap[id] = { x, y, rotation, scale };
  }

  /**
   * Merge a partial update into an object's transform.
   * Also applies the change to the live sprite.
   */
  updateTransform(id, patches) {
    const sprite = this.sprites[id];
    if (!sprite) {
      console.warn(`No sprite found with id=${id}`);
      return;
    }

    // Update live object
    if (patches.x !== undefined)      sprite.x = patches.x;
    if (patches.y !== undefined)      sprite.y = patches.y;
    if (patches.rotation !== undefined) {
      sprite.rotation = Phaser.Math.DegToRad(patches.rotation);
    }
    if (patches.scale !== undefined)  sprite.setScale(patches.scale);

    // Merge into our map
    this.transformMap[id] = {
      ...this.transformMap[id],
      ...patches
    };
  }

  /** Retrieve the Phaser sprite by its ID */
  getSpriteById(id) {
    return this.sprites[id];
  }

  /** Remove an object from both our maps */
  unregisterId(id) {
    delete this.sprites[id];
    delete this.transformMap[id];
  }

  /** Get the full transform map (for saving or AI payload) */
  getTransformMap() {
    return { ...this.transformMap };
  }
}
