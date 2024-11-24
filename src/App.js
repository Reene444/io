import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Gltf, Environment, Fisheye, KeyboardControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import Controller from 'ecctrl';
import { ghostModel, innModel, nightEnvironmentModel } from 'some-3d-models';
import { Html } from '@react-three/drei';
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
    <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
      <Fisheye zoom={0.4}>
        <Environment files={nightEnvironmentModel} ground={{ scale: 100 }} />
        <directionalLight intensity={0.7} castShadow shadow-bias={-0.0004} position={[-20, 20, 20]}>
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>
        <ambientLight intensity={0.2} />
        <Physics timeStep="vary">
          <KeyboardControls map={keyboardMap}>
            <Controller maxVelLimit={5} onUpdate={handlePlayerMovement}>
              {/* 当前玩家的模型 */}
              <Gltf castShadow receiveShadow scale={0.315} position={[0, -0.55, 0]} src={ghostModel} />
            </Controller>
          </KeyboardControls>
          <RigidBody type="fixed" colliders="trimesh">
            {/* 场景模型 */}
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} scale={0.11} src={innModel} />
          </RigidBody>
          {/* 渲染其他玩家 */}
          {Object.keys(players).map((id) => (
            <Gltf
              key={id}
              castShadow
              receiveShadow
              scale={0.315}
              position={players[id]?.position || [0, 0, 0]} // 确保 position 存在
              rotation={players[id]?.rotation || [0, 0, 0]} // 确保 rotation 存在
              src={ghostModel}
            />
          ))}
        </Physics>{/* 悬空对话框 */}
        <Html position={[0, 2, 0]} center>
          <div
            style={{
              width: '300px',
              padding: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h3>Chat</h3>
            <div
              style={{
                maxHeight: '150px',
                overflowY: 'auto',
                marginBottom: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '5px',
                borderRadius: '5px',
              }}
            >
              {chatMessages.map((msg, index) => (
                <p key={index}>{msg}</p>
              ))}
            </div>
            <input
              type="text"
              style={{
                width: '80%',
                padding: '5px',
                marginBottom: '5px',
                borderRadius: '5px',
              }}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button
              style={{
                padding: '5px 10px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor: '#00bfff',
                color: 'white',
              }}
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
          </Html>
      </Fisheye>
    </Canvas>
  );
} 