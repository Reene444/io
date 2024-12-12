import React, { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { HeilBall } from 'some-3d-models'
const HeliBallModel = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  // 加载 GLB 文件
  const { scene, animations } = useGLTF(HeilBall)

  // 创建 AnimationMixer 用于控制动画
  const mixer = useRef(null)

  // 获取并控制加载的动画
  const { actions } = useAnimations(animations, scene)

  // 在组件加载时启动动画
  useEffect(() => {
    if (actions) {
      // 打印 actions 中包含的动画名称
      console.log('Available actions:', actions)

      // 假设 GLB 中的动画名称是 "Armature|ArmatureAction"，你需要根据日志中的名称来选择动画
      if (actions['Take 001']) {
        actions['Take 001'].play() // 播放指定动画
      }
    }
  }, [actions])

  // 在每帧更新动画，不需要手动调用 update
  useFrame(() => {
    if (mixer.current) {
      mixer.current.update() // 这里不再需要调用 .update(delta)
    }
  })

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />
}
useGLTF.preload(HeilBall)
export default HeliBallModel
