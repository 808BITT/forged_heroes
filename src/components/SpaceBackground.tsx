import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';



interface CreateNebulaParams {
  color: number;
  position: THREE.Vector3;
  size: number;
  seedOffset: number;
}

interface SpaceDust extends THREE.Mesh {
  rotation: THREE.Euler;
}

// Utility function to generate a reproducible random number based on a seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [seed] = useState<number>(() => {
    // Try to load the seed from localStorage, or create a new one
    const savedSeed = localStorage.getItem('spaceBackgroundSeed');
    if (savedSeed) {
      return parseFloat(savedSeed);
    } else {
      const newSeed = Math.random() * 10000;
      localStorage.setItem('spaceBackgroundSeed', newSeed.toString());
      return newSeed;
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Get the start time from localStorage, or set a new one
    let startTime = localStorage.getItem('spaceBackgroundTime');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('spaceBackgroundTime', startTime);
    }
    startTime = parseFloat(startTime).toString();

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup with a wider field of view for more immersion
    const camera = new THREE.PerspectiveCamera(
      85,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 5;

    // Renderer setup with improved quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "highp",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
    containerRef.current.appendChild(renderer.domElement);

    // Create a richer star field using the saved seed
    const createStarField = () => {
      // Main distant stars (tiny, numerous)
      const starCount = 5000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);

      let seedVal = seed;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Use seeded random for consistency across refreshes
        seedVal = seedVal + 1;
        const r1 = seededRandom(seedVal);
        seedVal = seedVal + 1;
        const r2 = seededRandom(seedVal);
        seedVal = seedVal + 1;
        const r3 = seededRandom(seedVal);

        // Distribute stars in a sphere around camera
        const radius = r1 * 1000 + 200;
        const theta = r2 * Math.PI * 2;
        const phi = Math.acos((r3 * 2) - 1);

        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = radius * Math.cos(phi);

        // Vary the star sizes slightly for more natural look
        seedVal = seedVal + 1;
        starSizes[i] = seededRandom(seedVal) * 0.5 + 0.1;
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

      // Create a custom shader for stars with proper rendering
      const starMaterial = new THREE.PointsMaterial({
        size: 0.1,
        transparent: true,
        opacity: 1.0,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      return stars;
    };

    // Create nebulae with beautiful colors using the saved seed
    const createNebulae = () => {
      const nebulaCount = 4;
      const nebulae: THREE.Points[] = [];

      // Helper to create a single nebula
      const createNebula = (
        { color, position, size, seedOffset }: CreateNebulaParams
      ): THREE.Points => {
        // Create a particle system for each nebula
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const baseColor = new THREE.Color(color);
        const center = new THREE.Vector3(position.x, position.y, position.z);

        let seedVal = seed + seedOffset;
        for (let i = 0; i < particleCount; i++) {
          seedVal = seedVal + 1;
          const r1 = seededRandom(seedVal);
          seedVal = seedVal + 1;
          const r2 = seededRandom(seedVal);
          seedVal = seedVal + 1;
          const r3 = seededRandom(seedVal);

          // Create a cloud-like distribution
          const offset = new THREE.Vector3(
            (r1 - 0.5) * size,
            (r2 - 0.5) * size,
            (r3 - 0.5) * size
          );

          // Apply a gaussian-like falloff for density
          const distance = offset.length();
          const falloff = Math.max(0, 1 - (distance / (size * 0.5)) ** 2);

          seedVal = seedVal + 1;
          if (seededRandom(seedVal) > falloff * 0.8) continue;

          const pos = center.clone().add(offset);
          const i3 = i * 3;

          positions[i3] = pos.x;
          positions[i3 + 1] = pos.y;
          positions[i3 + 2] = pos.z;

          // Vary the colors slightly
          const colorVariation = 0.2;
          seedVal = seedVal + 1;
          const particleColor = baseColor.clone().multiplyScalar(
            1 - colorVariation + seededRandom(seedVal) * colorVariation * 2
          );

          colors[i3] = particleColor.r;
          colors[i3 + 1] = particleColor.g;
          colors[i3 + 2] = particleColor.b;

          // Vary the sizes too for more natural look
          seedVal = seedVal + 1;
          sizes[i] = (seededRandom(seedVal) * 0.5 + 0.5) * 3;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Create a custom shader for better-looking nebulae
        const material = new THREE.PointsMaterial({
          size: 3,
          transparent: true,
          opacity: 0.4,
          vertexColors: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          sizeAttenuation: true
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        return points;
      };

      // Create different colored nebulae in various positions
      const nebulaColors = [
        0x3366ff, // Blue
        0x9966ff, // Purple
        0xff6699, // Pink
        0x66ccff  // Light blue
      ];

      for (let i = 0; i < nebulaCount; i++) {
        let seedVal = seed + 9000 + (i * 1000);

        seedVal = seedVal + 1;
        const posX = (seededRandom(seedVal) - 0.5) * 100;
        seedVal = seedVal + 1;
        const posY = (seededRandom(seedVal) - 0.5) * 100;
        seedVal = seedVal + 1;
        const posZ = (seededRandom(seedVal) - 0.5) * 100;

        const position = new THREE.Vector3(posX, posY, posZ);

        seedVal = seedVal + 1;
        const size = seededRandom(seedVal) * 30 + 20;
        const nebula = createNebula({
          color: nebulaColors[i],
          position: position,
          size: size,
          seedOffset: 10000 + (i * 1000)
        });
        nebulae.push(nebula);
      }

      return nebulae;
    };

    // Function to create space dust
    const createSpaceDust = (): SpaceDust | null => {
      const dustGeometry = new THREE.SphereGeometry(50, 20, 20);
      const dustMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.1,
      });

      const dust = new THREE.Mesh(dustGeometry, dustMaterial) as unknown as SpaceDust;
      scene.add(dust);
      return dust.geometry ? dust : null;
    };

    // Create all space elements
    const starField = createStarField();
    const nebulae = createNebulae();
    const spaceDust = createSpaceDust();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Save the time for continuity between refreshes
    localStorage.setItem('spaceBackgroundTime', startTime.toString());

    // Animation with smooth camera movement and persistence
    const animate = () => {
      // Calculate time based on real elapsed time since first visit
      const currentTime = Date.now() / 1000;
      const elapsedTime = currentTime - parseFloat(startTime);
      const time = elapsedTime * 0.05; // slow down the overall rotation

      requestAnimationFrame(animate);

      // Subtle camera movement for a floating effect
      camera.position.x = Math.sin(time * 0.3) * 2;
      camera.position.y = Math.sin(time * 0.5) * 2;

      // Always look at the center
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      // Rotate all the elements at different speeds and directions
      if (starField) {
        starField.rotation.y = time * 0.01;
        starField.rotation.x = time * 0.005;
      }

      if (spaceDust) {
        spaceDust.rotation.y = time * 0.015;
      }

      if (nebulae) {
        nebulae.forEach((nebula, i) => {
          nebula.rotation.x = time * 0.01 * (i % 2 ? 1 : -1);
          nebula.rotation.y = time * 0.008 * ((i + 1) % 2 ? 1 : -1);
          nebula.rotation.z = time * 0.005 * (i % 3 ? 1 : -1);
        });
      }

      if (spaceDust) {
        spaceDust.rotation.y = elapsedTime * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Clean up THREE.js objects
      scene.clear();
      renderer.dispose();
    };
  }, [seed]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        background: 'linear-gradient(to bottom, #070921 0%, #050316 100%)'
      }}
    />
  );
}