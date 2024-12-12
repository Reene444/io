import { Canvas , useLoader} from '@react-three/fiber';
import { Physics, RigidBody , Collider} from '@react-three/rapier';
import { Gltf, Environment, Fisheye, KeyboardControls,useGLTF,Text3D } from '@react-three/drei';
import { useEffect, useState ,Suspense, lazy,useRef } from 'react';
import Controller from 'ecctrl';
import { ghostModel, innModel, nightEnvironmentModel } from 'some-3d-models';
import { Html } from '@react-three/drei';
import LoadingModel from './components/LoadingModel';
const HeliBallModel = lazy(() => import('./components/HeliBallModel'));
const RaichuModel = lazy(() => import('./components/RaichuModel'));
const BallModel = lazy(() => import('./components/BallModel'));
const GithubTextModel = lazy(() => import( './components/GithubTextModel'));
export default function App() {
 
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
  ];

  const [players, setPlayers] = useState({}); // 存储其他玩家的状态
  const [socket, setSocket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]); // 存储聊天消息
  const [inputMessage, setInputMessage] = useState(''); // 当前输入的消息
  const playerRef = useRef();
  // 当前玩家的唯一 ID
  const playerId = `player-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    // 初始化 WebSocket 连接
    const ws = new WebSocket("ws://localhost:8089/ws");
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected');
      // 向服务器注册玩家 ID
      ws.send(JSON.stringify({ type: 'register', id: playerId }));
    };
    ws.onclose = (event) => {
      console.error('WebSocket closed:', event.code, event.reason);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    // 监听 WebSocket 消息
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data); // 修复这里，解析消息数据
      if (data.type === 'register') {
        // 新玩家加入
        console.log('New player registered:', data.id);
        setPlayers((prev) => ({
          ...prev,
          [data.id]: { position: [0, 0, 0], rotation: [0, 0, 0] }, // 初始化新玩家状态
        }));
      } else if (data.type === 'update') {
        // 更新玩家状态
        setPlayers((prev) => ({
          ...prev,
          [data.id]: data.state, // 更新玩家状态
        }));
      }
      console.log('WebSocket message:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // 关闭 WebSocket 时清理
 //   return () => ws.close();
  }, []);

  // 处理当前玩家的移动，并发送状态到后端
  const handlePlayerMovement = (state) => {
    console.log('Player movement detected:', state);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'move',
          id: playerId, // 当前玩家的唯一 ID
          state, // 当前玩家的位置和其他状态
        })
      );
      console.log('Message sent to server:', state);
    } else {
      console.log('WebSocket is not ready');
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      let movementState = {};
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movementState = { action: 'forward' };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movementState = { action: 'backward' };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movementState = { action: 'leftward' };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movementState = { action: 'rightward' };
          break;
        case 'Space':
          movementState = { action: 'jump' };
          break;
        case 'Shift':
          movementState = { action: 'run' };
          break;
        default:
          return; // 不处理其他按键
      }
      handlePlayerMovement(movementState); // 调用回调函数
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
  const handleSendMessage = () => {
    if (inputMessage.trim() && socket && socket.readyState === WebSocket.OPEN) {
      const chatMessage = { type: 'chat', message: inputMessage, id: playerId };
      socket.send(JSON.stringify(chatMessage));
      setInputMessage(''); // 清空输入框
    }
  };

  return (
    <>
   
    <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
    <Suspense fallback={
      <Html center>
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
          <Canvas >
          <ambientLight intensity={0.3} /> 
           <pointLight position={[0, 5, 0]} intensity={1.5} decay={2} /> 
          <LoadingModel scale={0.4}/>
          </Canvas>
          </div>
        </Html>

    }>
        <Environment files={nightEnvironmentModel} ground={{ scale: 100 }} />
        <directionalLight intensity={0.8} castShadow shadow-bias={-0.0004} position={[-20, 20, 30]}>
          <orthographicCamera attach="shadow-camera" args={[-20, -20, -30, -20]} />
          
        </directionalLight>
        
        <ambientLight intensity={0.7} />
         
        <Physics  timeStep="vary" >
       
          <HeliBallModel position={[-6,1.3,-1]} scale={5} rotation={[0,0,0]}/>
          <RaichuModel position={[-2,1,15]} scale={5} rotation={[-Math.PI/5,-Math.PI*28/29,0]}/>

        <KeyboardControls map={keyboardMap}>
            <Controller maxVelLimit={5} onUpdate={handlePlayerMovement}>
              {/* 当前玩家的模型 */}
              {/* <Suspense fallback={null}> */}
              <Gltf castShadow receiveShadow scale={0.315} position={[0, -0.5, 0]}  src={ghostModel}  />
      {/* </Suspense>  */}
            </Controller>
          </KeyboardControls>
     
      
          <RigidBody type="fixed" colliders="trimesh">
            {/* 场景模型 */}
            <boxGeometry args={[10, 1, 10]} />
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} scale={0.11} src={innModel}  position={[0, 0, 0]}  />
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, Math.PI ]} scale={0.11} src={innModel}   position={[-12.3, 0, 0]} />
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, Math.PI ]} scale={0.11} src={innModel}   position={[-12.3, 2, 17.5]} />
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, Math.PI ]} scale={0.11} src={innModel}   position={[-12.3, -3, -17.5]} />
          </RigidBody>

          <RigidBody type="dynamic" colliders="ball">
          <BallModel  scale={0.61} position={[0,0,0]}/>
           </RigidBody>
    
                   {/* <GithubTextModel  rotation={[0,-Math.PI*15/18,0]} scale={1} position={[1.3,0,5]}  /> */}

          {/* <ShiBaModel rotation={[0,Math.PI*15/16,0]} scale={0.61} position={[-13.7,1.4,15.5]}/> */}

          {/* <MiniMap target={playerRef.current || { position: { x: 0, y: 0, z: 0 } }} /> */}

      
          {/* 渲染其他玩家 */}
          {/* {Object.keys(players).map((id) => (
            <Gltf
              key={id}
              castShadow
              receiveShadow
              scale={0.315}
              position={players[id]?.position || [0, 0, 0]} // 确保 position 存在
              rotation={players[id]?.rotation || [0, 0, 0]} // 确保 rotation 存在
              src={ghostModel}
            />
          ))} */}

        </Physics>
        

      </Suspense>
    </Canvas>

    </>
  );
}
