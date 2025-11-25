import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}

export default function Property3DViewer({ modelUrl }) {
  if (!modelUrl) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
        <p className="text-white text-xl">3D Model Not Available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls enableZoom={true} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
