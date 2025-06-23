//here the code does a live-tracked storing of object positions, rotation, scale, and other metadata
export class SceneManager{
  /**
 * @param {Phaser.Scene} scene  The Phaser.Scene instance
 */
constructor(scene){
  this.scene = scene;
  this.transformMap = {}; //holds the live/latest transform data for each object by its id
  this.sprites = {}; //reference to phaser sprites by id
}

/** Calls in preload(): loads scene.json into Phaser's cache */
preload() {
  // Always load the manifest
  this.scene.load.json('sceneData', 'scene.json');

  // Once in cache, queue up only valid sprite keys
  this.scene.load.on('filecomplete-json-sceneData', () => {
    const defs = this.scene.cache.json.get('sceneData') || [];

    // Gather unique keys for sprite entries only
    const spriteKeys = Array.from(new Set(
      defs
        .filter(d => d.type === 'sprite' && typeof d.key === 'string' && d.key.length)
        .map(d => d.key)
    ));

    // Queue each sprite image for loading
    spriteKeys.forEach(key => {
      this.scene.load.image(key, `assets/${key}.png`);
    });

    // Restart the loader so Phaser fetches these images
    this.scene.load.start();
  });
}

/** Calls in create(): reads sceneData and spawns each sprite  */
create() {
  // Grab the parsed JSON array
  const data = this.scene.cache.json.get('sceneData');
  if (!Array.isArray(data)) {
    console.error('sceneData must be an array of object definitions');
    return;
  }

  data.forEach(def => {
    const {
      id,
      type,
      x, y,
      rotation = 0,
      scale = 1
    } = def;

    let obj;

    // Branch on type
    if (type === 'sprite') {
      // Sprite: use the preloaded texture key
      obj = this.scene.add.sprite(x, y, def.key);
    } else if (type === 'primitive') {
      // Primitive: draw a shape with Graphics-like API
      if (def.shape === 'circle') {
        // add.ellipse takes (x, y, width, height, fillColor)
        obj = this.scene.add.ellipse(x, y, def.radius * 2, def.radius * 2, def.fillColor);
      } else if (def.shape === 'rectangle') {
        // add.rectangle takes (x, y, width, height, fillColor)
        obj = this.scene.add.rectangle(x, y, def.width, def.height, def.fillColor);
      } else {
        console.warn(`Unknown primitive shape: ${def.shape}`);
        return;
      }
    } else {
      console.warn(`Unknown type: ${type}`);
      return;
    }

    // setup
    obj
      .setName(id)                         // name = unique id
      .setScale(scale);                    // uniform scale
    obj.rotation = Phaser.Math.DegToRad(rotation);

    // Record references & transforms
    this.sprites[id] = obj;
    // store all def fields so transformMap can drive full re-render or AI sync
    this.transformMap[id] = { ...def };
  });
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