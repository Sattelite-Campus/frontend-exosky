export function setupSceneChange(scene1, scene2, switchCallback) {
    // Add a button to switch scenes
    const button = document.createElement('button');
    button.innerHTML = "Switch Scene";
    button.style.position = 'absolute';
    button.style.top = '20px';
    button.style.left = '20px';
    document.body.appendChild(button);

    // Track the current scene
    let activeScene = scene1;

    // On button click, switch the scene
    button.addEventListener('click', () => {
        if (activeScene === scene1) {
            activeScene = scene2;
        } else {
            activeScene = scene1;
        }
        console.log('Switched scene');
        switchCallback(activeScene);
    });
}
