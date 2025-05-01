<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const container = ref<HTMLDivElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let animationFrameId: number | null = null;
let clock: THREE.Clock | null = null;
let originalPositions: THREE.Float32BufferAttribute | null = null;
let starField: THREE.Points | null = null;
let starGeometry: THREE.BufferGeometry | null = null;
let starMaterial: THREE.PointsMaterial | null = null;

// Mouse position state
const mouse = ref({ x: 0, y: 0 });
// Mouse click state
const isMouseDown = ref(false);

const handleMouseMove = (event: MouseEvent) => {
  if (container.value) {
    // Normalize mouse position to range [-0.5, 0.5]
    mouse.value.x = (event.clientX / window.innerWidth) - 0.5;
    mouse.value.y = (event.clientY / window.innerHeight) - 0.5;
  }
};

// Handle mouse down
const handleMouseDown = () => {
  isMouseDown.value = true;
};

// Handle mouse up
const handleMouseUp = () => {
  isMouseDown.value = false;
};

const initThree = () => {
  if (!container.value) return;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(75, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

  // Starfield
  starGeometry = new THREE.BufferGeometry();
  const starCount = 1500; // Reduced star count
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;

    // Position stars in a large cube volume
    starPositions[i3] = (Math.random() - 0.5) * 100;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 100;
    starPositions[i3 + 2] = (Math.random() - 1) * 100; // Spread mostly in front

    const colorVariance = Math.random() * 0.2 + 0.8;
    starColors[i3] = colorVariance;
    starColors[i3 + 1] = colorVariance;
    starColors[i3 + 2] = colorVariance;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  starMaterial = new THREE.PointsMaterial({
    size: 0.04, // Reduced size
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.6 // Reduced opacity
  });

  starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // Clock for animation timing
  clock = new THREE.Clock();

  // Animation loop
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    const delta = clock?.getDelta() ?? 0.016;
    // const elapsedTime = clock?.getElapsedTime() ?? 0;

    // Determine animation speed based on mouse click state
    const normalSpeed = 2;
    const acceleratedSpeed = 10;
    const starSpeed = isMouseDown.value ? acceleratedSpeed : normalSpeed;

    if (starField) {
      const starPositionsAttr = starField.geometry.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < starPositionsAttr.count; i++) {
        const z = starPositionsAttr.getZ(i);

        // Move star towards camera
        let newZ = z + starSpeed * delta;

        // If star moved past camera, reset its position far away
        if (newZ > camera.position.z) {
          newZ = Math.random() * -50 - 50; // Reset far behind the initial spread
        }
        starPositionsAttr.setZ(i, newZ);
      }
      starPositionsAttr.needsUpdate = true;

      // Parallax effect
      const parallaxFactor = 0.5;
      starField.rotation.y = mouse.value.x * parallaxFactor;
      starField.rotation.x = mouse.value.y * parallaxFactor;
    }

    renderer?.render(scene, camera);
  };

  animate();

  // Handle Resize
  const handleResize = () => {
    if (container.value && renderer) {
      const width = container.value.clientWidth;
      const height = container.value.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove); // Add mouse listener
  window.addEventListener('mousedown', handleMouseDown); // Add mouse down listener
  window.addEventListener('mouseup', handleMouseUp);   // Add mouse up listener

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove); // Remove mouse listener
    window.removeEventListener('mousedown', handleMouseDown); // Remove mouse down listener
    window.removeEventListener('mouseup', handleMouseUp);   // Remove mouse up listener
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (renderer) {
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    }
    if (starGeometry) starGeometry.dispose();
    if (starMaterial) starMaterial.dispose();
    originalPositions = null; // Clear reference
    starField = null; // Clear reference
  });
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    initThree();
  }
});

</script>

<style scoped>
div {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}
</style>
