
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KernelSize } from 'postprocessing'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { TwitterText } from 'some-3d-models';
const TwitterTextModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '0xffa500', onClickUrl = 'https://github.com/Reene444' }) => {
  const { scene } = useGLTF(TwitterText);
  const rigidBodyRef = useRef();
  const modelRef = useRef();
  const emissiveMaterialRef = useRef();

  useEffect(() => {
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        // Create a glowing material
        const emissiveMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff, // Base color
          emissive: new THREE.Color(color), // Emissive color
          emissiveIntensity: 1, // Emissive intensity
          transparent: true,
          opacity: 0.4,
        });

        child.material = emissiveMaterial;
        emissiveMaterialRef.current = emissiveMaterial;
      }
    });
  }, [color]);

  // Pulsing effect
  useFrame((state) => {
    if (emissiveMaterialRef.current) {
      const time = state.clock.getElapsedTime();
      emissiveMaterialRef.current.emissiveIntensity = 1.5 + Math.sin(time * 2) * 0.5;
    }
  });

  const handleClick = () => {
    if (onClickUrl) {
      window.open(onClickUrl, '_blank', 'noopener,noreferrer,width=800,height=600,top=100,left=100');
    }
  };

  const handleCollisionEnter = (e) => {
    if (rigidBodyRef.current) {
      // const impulse = [0, 1, 0]; // Upward impulse
      // rigidBodyRef.current.applyImpulse(impulse, true);
      if (onClickUrl) {
      window.open(onClickUrl, '_blank', 'noopener,noreferrer,width=800,height=600,top=100,left=100');
    }
    }
  };

  return (
      <>
    <RigidBody type="fixed" colliders="trimesh" ref={rigidBodyRef} onCollisionEnter={handleCollisionEnter}>
      <primitive
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
          {/* <EffectComposer multisampling={1}>
        <Bloom kernelSize={3} luminanceThreshold={0} luminanceSmoothing={0.4} intensity={0.6} />
        <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0} luminanceSmoothing={0} intensity={0.5} />
      </EffectComposer> */}
    </>
  );
};

useGLTF.preload(TwitterText);

export default TwitterTextModel;
