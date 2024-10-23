import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Gltf, Environment, Fisheye, KeyboardControls } from '@react-three/drei'
import Controller from 'ecctrl'
import { ghostModel, innModel ,nightEnvironmentModel} from 'some-3d-models';

export default function App() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ]
  return (
    <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
      <Fisheye zoom={0.4}>
        <Environment files={nightEnvironmentModel} ground={{ scale: 100 }} />
        <directionalLight intensity={0.7} castShadow shadow-bias={-0.0004} position={[-20, 20, 20]}>
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>
        <ambientLight intensity={0.2} />
        <Physics timeStep="vary">
          <KeyboardControls map={keyboardMap}>
            <Controller maxVelLimit={5}>
              <Gltf castShadow receiveShadow scale={0.315} position={[0, -0.55, 0]} src={ghostModel} />
            </Controller>
          </KeyboardControls>
          <RigidBody type="fixed" colliders="trimesh">
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} scale={0.11} src={innModel}/>
          </RigidBody>
        </Physics>
      </Fisheye>
    </Canvas>
  )
}
