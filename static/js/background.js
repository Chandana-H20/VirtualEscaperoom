// static/js/background.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background-canvas');
    if (!canvas || typeof THREE === 'undefined') {
        if (!canvas) console.warn("Background JS: Canvas element #background-canvas not found.");
        if (typeof THREE === 'undefined') console.warn("Background JS: THREE.js library not loaded before background.js.");
        return; // Exit if canvas or THREE is missing
    }

    console.log("Background JS: Canvas and THREE found. Initializing complex background...");

    let scene, camera, renderer, clock;
    let particles, particlesGeometry;
    let shapesGroup; // To hold rotating shapes
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function init() {
        try {
            // Scene
            scene = new THREE.Scene();
            // scene.fog = new THREE.FogExp2(0x03050a, 0.05); // Subtle fog matching dark bg

            // Clock
            clock = new THREE.Clock();

            // Camera
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
            camera.position.z = 100; // Start further back
            camera.position.y = 20;
            camera.rotation.x = -0.1; // Slight downward look

            // Renderer
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,      // Transparent background
                antialias: true   // Smoother edges (can impact performance)
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
            renderer.setClearColor(0x000000, 0); // Ensure transparency

            // --- Particle System ---
            const particleCount = 15000; // Adjust count for performance
            particlesGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            const color1 = new THREE.Color(0x00e5ff); // Electric Blue (Primary Theme)
            const color2 = new THREE.Color(0xff00ff); // Magenta (Secondary Theme)

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;

                // Position particles in a large sphere or box
                const radius = 800;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                positions[i3] = radius * Math.sin(phi) * Math.cos(theta); // x
                positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
                positions[i3 + 2] = radius * Math.cos(phi); // z

                // Lerp colors between primary and secondary based on position (example)
                const lerpFactor = (positions[i3 + 2] + radius) / (2 * radius); // 0 to 1 based on z
                const particleColor = new THREE.Color().lerpColors(color1, color2, Math.random() * 0.5 + lerpFactor * 0.5); // Mix random and position based

                colors[i3] = particleColor.r;
                colors[i3 + 1] = particleColor.g;
                colors[i3 + 2] = particleColor.b;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 1.5,
                sizeAttenuation: true, // Points smaller further away
                vertexColors: true,    // Use colors defined in geometry
                blending: THREE.AdditiveBlending, // Brighter where points overlap
                transparent: true,
                opacity: 0.8,
                depthWrite: false // Helps with transparency sorting issues
            });

            particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);

            // --- Wireframe Shapes ---
            shapesGroup = new THREE.Group();
            const shapeMaterial = new THREE.MeshBasicMaterial({
                color: 0x00BFFF, // Theme primary color
                wireframe: true,
                transparent: true,
                opacity: 0.25
            });

            // Example shapes (add more or different ones)
            const shape1 = new THREE.Mesh(new THREE.IcosahedronGeometry(50, 1), shapeMaterial); // Larger shape
            shape1.position.set(-150, 0, -200);
            shapesGroup.add(shape1);

            const shape2Material = shapeMaterial.clone(); // Use cloned material for different colors/opacity
            shape2Material.color.set(0xff00ff); // Magenta
            shape2Material.opacity = 0.2;
            const shape2 = new THREE.Mesh(new THREE.TorusKnotGeometry(30, 8, 100, 12), shape2Material);
            shape2.position.set(150, 50, -150);
            shapesGroup.add(shape2);

            const shape3Material = shapeMaterial.clone();
            shape3Material.color.set(0xffa500); // Orange accent
            shape3Material.opacity = 0.15;
            const shape3 = new THREE.Mesh(new THREE.OctahedronGeometry(40, 0), shape3Material);
             shape3.position.set(0, -50, -100);
            shapesGroup.add(shape3);


            scene.add(shapesGroup);


            // --- Event Listeners ---
            window.addEventListener('resize', onWindowResize, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);

        } catch (error) {
            console.error("Error initializing Three.js background:", error);
            if (canvas) canvas.style.display = 'none'; // Hide canvas on error
        }
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) * 0.1; // Adjust multiplier for sensitivity
        mouseY = (event.clientY - windowHalfY) * 0.1;
    }

    function animate() {
        // Schedule next frame
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // --- Particle Animation ---
        // Option 1: Rotate the whole system
        if (particles) {
             particles.rotation.y += delta * 0.02;
             particles.rotation.x += delta * 0.01;
        }
        // Option 2: Animate individual particles (more intensive)
        /*
        if (particlesGeometry) {
            const positions = particlesGeometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                // Add subtle movement (e.g., sine wave based on time and initial position)
                positions[i+1] += Math.sin(elapsedTime * 0.5 + positions[i] * 0.1) * 0.1;
            }
            particlesGeometry.attributes.position.needsUpdate = true;
        }
        */

        // --- Shapes Animation ---
        if (shapesGroup) {
            shapesGroup.rotation.y += delta * 0.05;
            shapesGroup.rotation.x -= delta * 0.03;

            // Animate individual shapes within the group
            shapesGroup.children.forEach((shape, index) => {
                shape.rotation.x += delta * 0.1 * (index % 2 === 0 ? 1 : -1); // Alternate direction
                shape.rotation.y += delta * 0.08;
            });
        }


        // --- Camera Animation ---
        // Subtle mouse follow
        camera.position.x += (mouseX - camera.position.x) * 0.01 * delta * 60; // Smoothed follow
        camera.position.y += (-mouseY - camera.position.y + 20) * 0.005 * delta * 60; // Follow Y, maintain slight elevation offset (+20)

        // Slow drift/oscillation independent of mouse
        // camera.position.z += Math.sin(elapsedTime * 0.1) * 0.1;
        // camera.position.x += Math.cos(elapsedTime * 0.08) * 0.05;

        // Ensure camera always looks towards the center (or a focal point)
        camera.lookAt(scene.position); // Looks at 0,0,0

        // Render the scene
        renderer.render(scene, camera);
    }

    // Start everything
    init();
    // Only start animation loop if init was successful
    if (scene && camera && renderer) {
        animate();
        console.log("Complex Three.js background initialized and animating.");
    } else {
         console.error("Three.js initialization failed, animation not started.");
    }
});