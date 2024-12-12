import React from 'react'
import { useGLTF } from '@react-three/drei'
import { Ball } from 'some-3d-models'
const BallModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  // 加载 GLB 文件
  const { scene } = useGLTF(Ball)

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />
}
useGLTF.preload(Ball)
export default BallModel
