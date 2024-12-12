import React from 'react'
import { useGLTF } from '@react-three/drei'
import { Shiba } from 'some-3d-models'
const ShiBaModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  // 加载 GLB 文件
  const { scene } = useGLTF(Shiba)

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />
}

useGLTF.preload(Shiba)

export default ShiBaModel
