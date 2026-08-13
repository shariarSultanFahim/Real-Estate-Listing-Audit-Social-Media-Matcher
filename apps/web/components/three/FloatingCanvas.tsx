"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function FloatingCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Create floating particles / nodes
    const particleCount = 45;
    const geometry = new THREE.IcosahedronGeometry(0.6, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    const instancedMesh = new THREE.InstancedMesh(geometry, material, particleCount);
    const dummy = new THREE.Object3D();

    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 30,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,
      scale: 0.5 + Math.random() * 1.2,
    }));

    let animationFrameId: number;
    const timer = new THREE.Timer();

    const animate = () => {
      timer.update();
      const elapsed = timer.getElapsed();

      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotX += 0.005;
        p.rotY += 0.008;

        if (p.x > 35) p.x = -35;
        if (p.x < -35) p.x = 35;
        if (p.y > 25) p.y = -25;
        if (p.y < -25) p.y = 25;

        dummy.position.set(p.x, p.y + Math.sin(elapsed + i) * 0.5, p.z);
        dummy.rotation.set(p.rotX, p.rotY, 0);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(i, dummy.matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />;
}
