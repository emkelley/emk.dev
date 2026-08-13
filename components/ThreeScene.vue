<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const container = ref<HTMLDivElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let animationFrameId: number | null = null;
let clock: THREE.Clock | null = null;
let starField: THREE.Points | null = null;
let starGeometry: THREE.BufferGeometry | null = null;
let starMaterial: THREE.PointsMaterial | null = null;
let camera: THREE.PerspectiveCamera | null = null;

const mouse = { x: 0, y: 0 };
let isMouseDown = false;
let reduceMotion = false;

const handleMouseMove = (event: MouseEvent) => {
  mouse.x = event.clientX / window.innerWidth - 0.5;
  mouse.y = event.clientY / window.innerHeight - 0.5;
};

const handleMouseDown = () => {
  isMouseDown = true;
};

const handleMouseUp = () => {
  isMouseDown = false;
};

const handleResize = () => {
  if (!container.value || !renderer || !camera) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const dispose = () => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mousedown", handleMouseDown);
  window.removeEventListener("mouseup", handleMouseUp);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  starGeometry?.dispose();
  starMaterial?.dispose();
  renderer?.dispose();
  if (renderer?.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  renderer = null;
  starField = null;
  starGeometry = null;
  starMaterial = null;
  camera = null;
  clock = null;
};

const initThree = () => {
  if (!container.value) return;

  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value.appendChild(renderer.domElement);

  starGeometry = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * 100;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 100;
    starPositions[i3 + 2] = (Math.random() - 1) * 100;

    const colorVariance = Math.random() * 0.2 + 0.8;
    starColors[i3] = colorVariance;
    starColors[i3 + 1] = colorVariance;
    starColors[i3 + 2] = colorVariance;
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

  starMaterial = new THREE.PointsMaterial({
    size: 0.04,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
  });

  starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  clock = new THREE.Clock();

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    if (starField && camera && !reduceMotion) {
      const delta = clock?.getDelta() ?? 0.016;
      const starSpeed = isMouseDown ? 10 : 2;
      const positions = starField.geometry.attributes.position as THREE.BufferAttribute;

      for (let i = 0; i < positions.count; i++) {
        let newZ = positions.getZ(i) + starSpeed * delta;
        if (newZ > camera.position.z) {
          newZ = Math.random() * -50 - 50;
        }
        positions.setZ(i, newZ);
      }
      positions.needsUpdate = true;

      starField.rotation.y = mouse.x * 0.5;
      starField.rotation.x = mouse.y * 0.5;
    }

    renderer?.render(scene, camera!);
  };

  animate();

  window.addEventListener("resize", handleResize);
  if (!reduceMotion) {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
  }
};

onMounted(() => {
  if (typeof window !== "undefined") initThree();
});

onUnmounted(() => {
  dispose();
});
</script>

<style scoped>
div {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}
</style>
