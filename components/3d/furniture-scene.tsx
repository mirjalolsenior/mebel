"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Text3D, Float } from "@react-three/drei"
import { Suspense } from "react"

function FurnitureModel() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2, 0.2, 1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[1.5, -0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-1.5, -0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, -0.6, 0.8]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </Float>
  )
}

function Logo3D() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
      <Text3D font="/fonts/Geist_Bold.json" size={0.5} height={0.1} position={[-1.5, 0, 0]}>
        SHERDOR
        <meshStandardMaterial color="#06b6d4" />
      </Text3D>
    </Float>
  )
}

interface FurnitureSceneProps {
  showLogo?: boolean
  className?: string
}

export default function FurnitureScene({ showLogo = false, className = "w-full h-64" }: FurnitureSceneProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />

          {showLogo ? <Logo3D /> : <FurnitureModel />}

          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
        </Suspense>
      </Canvas>
    </div>
  )
}
