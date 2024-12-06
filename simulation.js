// Make sure you have a font loader
const fontLoader = new THREE.FontLoader();

// Load a font (you can use a URL for a font file)
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {

    // Create 3D Text for "A" and "B"
    const textGeometryA = new THREE.TextGeometry('A', {
        font: font,
        size: 0.3,  // Adjust the size of the text to fit well on the electron surface
        height: 0.05,  // Thinner letters by reducing the height
        curveSegments: 4  // Fewer curve segments to make it look thinner
    });

    const textGeometryB = new THREE.TextGeometry('B', {
        font: font,
        size: 0.3,
        height: 0.05,  // Thinner letters by reducing the height
        curveSegments: 4  // Fewer curve segments to make it look thinner
    });

    // Create materials for the text (Black color)
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Create Meshes for the text
    const textMeshA = new THREE.Mesh(textGeometryA, textMaterial);
    const textMeshB = new THREE.Mesh(textGeometryB, textMaterial);

    // Center the text geometries
    textGeometryA.center();
    textGeometryB.center();

    // Position the text meshes on the surface of the electrons, ensuring they are centered
    // Electron 1 (A): Position on the surface of the left electron
    textMeshA.position.set(-2.85, 0.1, 0.3);  // Position slightly on the surface of electron1

    // Electron 2 (B): Position on the surface of the right electron
    textMeshB.position.set(2.85, 0.1, 0.3);   // Position slightly on the surface of electron2

    // Add text meshes to the scene
    scene.add(textMeshA);
    scene.add(textMeshB);
});


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000); // Reduced FOV to 30 for a tighter view
const renderer = new THREE.WebGLRenderer();

// Get the container element
const container = document.getElementById('simulation-container');

// Set the renderer size to match the container size initially
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Create electrons (2 spheres)
const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const electronMaterial1 = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Red for first electron
const electronMaterial2 = new THREE.MeshBasicMaterial({ color: 0xFF0000 }); // Red for second electron
const electron1 = new THREE.Mesh(electronGeometry, electronMaterial1);
const electron2 = new THREE.Mesh(electronGeometry, electronMaterial2);

// Set electron positions (make sure they aren't too far apart)
electron1.position.set(-3, 0, 0);  // Position the first electron
electron2.position.set(3, 0, 0);   // Position the second electron

// Add electrons to the scene
scene.add(electron1);
scene.add(electron2);

// Create photon (a small sphere)
const photonGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const photonMaterial = new THREE.MeshBasicMaterial({ color: 0xFF00FF }); // Pink photon
const photon = new THREE.Mesh(photonGeometry, photonMaterial);

// Photon start and target positions (between the electrons)
const startPos1 = electron1.position.clone();
const endPos1 = electron2.position.clone();
const startPos2 = electron2.position.clone();
const endPos2 = electron1.position.clone();

// Add photon to the scene
scene.add(photon);

// Animation settings
let photonSpeed = 0.1;
let photonDirection1 = new THREE.Vector3().subVectors(endPos1, startPos1).normalize();
let photonDirection2 = new THREE.Vector3().subVectors(endPos2, startPos2).normalize();
let photonPosition = startPos1.clone();

let photonEmitter = 1;  // 1: electron1 emits, 2: electron2 emits

// Function to emit photon and change colors of electrons
function emitPhoton() {
    if (photonEmitter === 1) {
        // Change emitting electron (electron1) to green
        electron1.material.color.set(0x6B8E23); // Green for emitting electron
        electron2.material.color.set(0x8B0000); // Red for receiving electron
        photonDirection1 = new THREE.Vector3().subVectors(endPos1, startPos1).normalize();
    } else {
        // Change emitting electron (electron2) to green
        electron2.material.color.set(0x6B8E23); // Green for emitting electron
        electron1.material.color.set(0x8B0000); // Red for receiving electron
        photonDirection2 = new THREE.Vector3().subVectors(endPos2, startPos2).normalize();
    }
}

// Reset electron colors
function resetElectronColors() {
    electron1.material.color.set(0xFF0000); // Red for emitting electron
    electron2.material.color.set(0xFF0000); // Red for receiving electron
}

// Set up camera
camera.position.set(0, 1, 5);  // Adjusted camera position to reduce vertical space
camera.aspect = container.offsetWidth / container.offsetHeight;
camera.updateProjectionMatrix();

// Animate the photon moving
function animate() {
    requestAnimationFrame(animate);

    // Move photon based on the current direction
    if (photonEmitter === 1) {
        photonPosition.addScaledVector(photonDirection1, photonSpeed);
    } else {
        photonPosition.addScaledVector(photonDirection2, photonSpeed);
    }
    photon.position.copy(photonPosition);

    // Check if the photon reached its destination (electron2 or electron1)
    if (photonEmitter === 1 && photonPosition.distanceTo(endPos1) < 0.1) {
        // Reset photon position and trigger color change
        photonPosition.copy(startPos2);
        photonEmitter = 2;  // Now electron2 will emit a photon

        // Emit photon from electron2
        emitPhoton();
    } else if (photonEmitter === 2 && photonPosition.distanceTo(endPos2) < 0.1) {
        // Reset photon position and trigger color change
        photonPosition.copy(startPos1);
        photonEmitter = 1;  // Now electron1 will emit a photon

        // Emit photon from electron1
        emitPhoton();
    }

    // Render the scene
    renderer.render(scene, camera);
}

animate();

// Adjust for window resizing
window.addEventListener('resize', function() {
    // Update renderer size based on container size
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    
    // Update camera aspect ratio for resizing
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
});

