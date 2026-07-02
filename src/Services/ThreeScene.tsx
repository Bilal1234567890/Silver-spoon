import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827); // dark bg

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Object: Icosahedron with wireframe
    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Wireframe overlay
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ca3af,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    mesh.add(wireframeMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x4f46e5, 0.5);
    backLight.position.set(-1, -0.5, -1);
    scene.add(backLight);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = containerRef.current!.clientWidth;
      const h = containerRef.current!.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-80 md:h-96 rounded-xl" />;
};

export default ThreeScene;