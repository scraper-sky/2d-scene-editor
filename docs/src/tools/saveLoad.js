// src/tools/saveLoad.js

/**
 * Prompt‐download the current scene JSON.
 * @param {SceneManager} sceneManager
 */
export function saveSceneJSON(sceneManager) {
    // getTransformMap() returns { id1: def1, id2: def2, … }
    //flat Array so loadScene(defsArray) works
    const defsArray = Object.values(sceneManager.getTransformMap());
  
    const dataStr = JSON.stringify(defsArray, null, 2);
    const blob    = new Blob([dataStr], { type: 'application/json' });
    const a       = document.createElement('a');
    a.href        = URL.createObjectURL(blob);
    a.download    = 'scene.json';
    a.click();
  }
  
  
  /**
   * Read a JSON file from an <input> change event and apply it via sceneManager.loadScene()
   * @param {Event} event
   * @param {SceneManager} sceneManager
   */
  export function loadSceneJSON(event, sceneManager) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        sceneManager.loadScene(json);
      } catch (e) {
        console.error('Invalid scene JSON:', e);
      }
    };
    reader.readAsText(file);
  }
  