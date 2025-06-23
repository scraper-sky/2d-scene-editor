// src/tools/ai.js

/**
 * Sends the current scene + a user instruction to your proxy,
 * strips any Markdown fences from the AI’s response, parses it,
 * and then reloads the scene.
 *
 * @param {SceneManager} sceneManager
 * @param {string} userInstruction
 */
export async function pushToAI(sceneManager, userInstruction) {

    // Gather current scene defs
    const sceneDefs = Object.values(sceneManager.getTransformMap());

    // Call to the proxy server
    const resp = await fetch(
        'https://my-2d-scene-ai-9afbd022dbd8.herokuapp.com/push-ai',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneDefs: Object.values(sceneManager.getTransformMap()),
            instruction: document.getElementById('aiInstruction').value
          })
        }
      );

  
    if (!resp.ok) {
      console.error('Proxy error', await resp.text());
      return;
    }
  
    const { updatedJson } = await resp.json();
    // updatedJson might look like: "```json\n[ ... ]```"
  
    // Strip Markdown fences
    const jsonText = updatedJson
      .replace(/```(?:json)?\r?\n?/gi, '')  // remove leading ``` or ```json
      .replace(/```$/g, '')                 // remove trailing ```
      .trim();
  
    // Parse the clean JSON
    let newArray;
    try {
      newArray = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI JSON:', jsonText, e);
      return;
    }
  
    // Reload the scene and re-enable interactivity
    sceneManager.loadScene(newArray);
    Object.values(sceneManager.sprites)
      .forEach(o => o.setInteractive({ draggable: true }));
  }
  