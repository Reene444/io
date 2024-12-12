import React, { useRef, useEffect, Suspense } from "react";
import { useGLTF, Environment, PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { RigidBody, TrimeshCollider } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { KernelSize } from 'postprocessing'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useFrame } from '@react-three/fiber';
import { GithubText } from "some-3d-models";
import * as THREE from 'three'
const GithubTextModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const { scene } = useGLTF(GithubText);
  const rigidBodyRef = useRef();
  const modelRef = useRef();
  const emissiveMaterialRef = useRef();
  useEffect(() => {
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        // 创建可发光的材质
        const emissiveMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,  // 基础颜色
          emissive: new THREE.Color(0xffa500), // 发光颜色
          emissiveIntensity: 1, // 发光强度
          transparent: true,
          opacity: 1
        });

        child.material = emissiveMaterial;
        emissiveMaterialRef.current = emissiveMaterial;
      }
    });
  },[]);
  // 脉动效果
  useFrame((state, delta) => {
    if (emissiveMaterialRef.current) {
      const time = state.clock.getElapsedTime();
      emissiveMaterialRef.current.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.5;
    }
  });
  const handleClick = () => {
    window.open("https://github.com/Reene444", "_blank");
  };

  const handleCollisionEnter = (e) => {
    console.log("Collision detected:", e);
    if (!rigidBodyRef.current) return;

    const impulse = [0, 1, 0]; // Upward impulse
    rigidBodyRef.current.applyImpulse(impulse, true);
    window.open("https://github.com/Reene444", "_blank", "noopener,noreferrer,width=800,height=600,top=100,left=100");
  };

  return (
    <>



    <RigidBody type="fixed" colliders="trimesh" ref={rigidBodyRef} onCollisionEnter={handleCollisionEnter}>
      <primitive
       color="0xffa500"
        ref={modelRef}
        object={scene}
        position={position}
        rotation={rotation}
        scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
        onClick={handleClick}
        castShadow
        receiveShadow
      />
    </RigidBody>
    <EffectComposer multisampling={1}>
          <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
          <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0} luminanceSmoothing={0} intensity={0.5} />
        </EffectComposer>

    </>
  );
};


export default GithubTextModel;

useGLTF.preload(GithubText);
