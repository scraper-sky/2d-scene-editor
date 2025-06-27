// sceneManager.js

export class SceneManager {
  constructor(scene) {
    this.scene        = scene;
    this.transformMap = {};  // id → full def
    this.sprites      = {};  // id → Phaser GameObject
    this.idCounters   = {};  // for generateId
  }

  preload() {
    this.scene.load.json('sceneData','scene.json');
    this.scene.load.on('filecomplete-json-sceneData', () => {
      const defs = this.scene.cache.json.get('sceneData')||[];
      // load only sprite textures
      const keys = [...new Set(defs.filter(d=>d.type==='sprite').map(d=>d.key))];
      keys.forEach(k=> this.scene.load.image(k,`assets/${k}.png`));
      this.scene.load.start();
    });
  }

  /** initial scene build */
  create() {
    const data = this.scene.cache.json.get('sceneData');
    if (!Array.isArray(data)) return console.error('sceneData must be an array');
    data.forEach(def => {
      const obj = this._makeObjectFromDef(def);
      if (!obj) return;
      // add to scene graph & register
      this.scene.add.existing(obj);
      this.sprites[def.id]      = obj;
      this.transformMap[def.id] = { ...def };
    });
  }

  /** completely replace scene */
  loadScene(defs) {
    // destroy old
    Object.values(this.sprites).forEach(o=>o.destroy());
    this.sprites = {};
    this.transformMap = {};
    // spawn new
    defs.forEach(def => {
      const obj = this._makeObjectFromDef(def);
      if (!obj) return;
      this.scene.add.existing(obj);
      this.sprites[def.id]      = obj;
      this.transformMap[def.id] = { ...def };
    });
  }

  /** private: turn a def → Phaser object (but don’t register yet) */
  _makeObjectFromDef(def) {
    let obj;
    const { id, type, x, y, rotation=0, scale=1 } = def;

    if (type === 'sprite') {
      obj = this.scene.add.sprite(x,y,def.key);

    } else if (type === 'primitive') {
      switch(def.shape) {
        case 'circle':
          obj = this.scene.add.ellipse(x, y, def.radius*2, def.radius*2, def.fillColor);
          break;

        case 'rectangle':
          obj = this.scene.add.rectangle(x, y, def.width, def.height, def.fillColor);
          break;

        case 'triangle': {
          // top point in middle, then bottom-left/bottom-right
          const pts = [
            def.width/2, 0,
            0,           def.height,
            def.width,   def.height
          ];
          obj = this.scene.add.polygon(x, y, pts, def.fillColor);
          break;
        }

        default:
          console.warn(`Unknown primitive shape: ${def.shape}`);
          return null;
      }

    } else {
      console.warn(`Unknown type: ${type}`);
      return null;
    }

    // common transforms
    obj.setName(id)
       .setScale(scale);
    obj.rotation = Phaser.Math.DegToRad(rotation);
    return obj;
  }

  /**
   * Public helper: create & register a primitive in one call
   * @param {Object} def  Must include id/type/shape/... etc
   */
  createPrimitive(def) {
    const obj = this._makeObjectFromDef(def);
    if (!obj) return null;
    this.scene.add.existing(obj);
    this.sprites[def.id]      = obj;
    this.transformMap[def.id] = { ...def };
    return obj;
  }

  /** generate unique IDs */
  generateId(baseKey) {
    this.idCounters[baseKey] = (this.idCounters[baseKey]||0) + 1;
    let id = `${baseKey}${this.idCounters[baseKey]}`;
    while (this.sprites[id]) {
      this.idCounters[baseKey]++;
      id = `${baseKey}${this.idCounters[baseKey]}`;
    }
    return id;
  }

  /** update live transform */
  updateTransform(id, patches) {
    const def = this.transformMap[id];
    const obj = this.sprites[id];
    if (!def || !obj) return console.warn(`No object ${id}`);
    const merged = { ...def, ...patches };
    this.transformMap[id] = merged;
    // reapply
    obj.setPosition(merged.x, merged.y);
    obj.setScale(merged.scale);
    obj.rotation = Phaser.Math.DegToRad(merged.rotation);
  }

  unregisterId(id) {
    const o = this.sprites[id];
    if (o) o.destroy();
    delete this.sprites[id];
    delete this.transformMap[id];
  }

  getTransformMap() {
    return { ...this.transformMap };
  }
}
