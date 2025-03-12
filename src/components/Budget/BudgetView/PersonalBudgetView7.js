import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PersonalBudgetView7 = ({ transactions }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 3;

    const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      wireframe: true,
      emissive: 0x0088ff,
      emissiveIntensity: 0.5,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Generate category spikes based on transaction amounts
    const categoryColors = {
      Income: 0x00ff00,
      Savings: 0xff0000,
      Housing: 0xffff00,
      Transport: 0x0000ff,
      Expenses: 0xff8800,
      Debits: 0x8800ff,
    };

    transactions.forEach((txn, index) => {
      const category = txn.category || "Unknown";
      const amount = Math.abs(txn.credit_amount || txn.debit_amount || 0) / 1000;
      const spikeGeometry = new THREE.CylinderGeometry(0.02, 0.02, amount, 32);
      const spikeMaterial = new THREE.MeshStandardMaterial({ color: categoryColors[category] || 0xffffff });
      const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      spike.position.set(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi));
      spike.lookAt(0, 0, 0);
      
      scene.add(spike);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [transactions]);

  return <div ref={mountRef} className="w-full h-[500px] bg-black rounded-lg shadow-lg" />;
};

export default PersonalBudgetView7;
