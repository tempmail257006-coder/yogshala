import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, ChevronRight, Info } from 'lucide-react';

interface YOGSHALAInstructor3DProps {
  poseId: string;
  poseName: string;
  instructions: string[];
  isActive: boolean;
  onToggleActive: () => void;
  onNext: () => void;
  onReset: () => void;
}

// A high-quality human model from a reliable source
const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb';

const InstructorModel = ({ poseId, isActive }: { poseId: string; isActive: boolean }) => {
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, scene);
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    if (names.length > 0) {
      const actionName = names[0]; // Default to first animation if available
      const action = actions[actionName];
      
      if (action) {
        if (isActive) {
          action.reset().fadeIn(0.5).play();
        } else {
          action.fadeOut(0.5);
        }
      }
    }

    // Apply pose-specific transformations if we don't have real animations
    // This is a fallback to simulate the poses using rotations
    if (group.current) {
      // Reset
      group.current.rotation.set(0, 0, 0);
      group.current.position.set(0, -1, 0);

      switch (poseId) {
        case 'tadasana': // Mountain
          group.current.rotation.y = Math.PI;
          break;
        case 'vrikshasana': // Tree
          group.current.rotation.y = Math.PI;
          // Simulate tree pose by rotating a leg if we could access bones
          break;
        case 'adho_mukha_svanasana': // Downward Dog
          group.current.rotation.x = -Math.PI / 4;
          group.current.position.y = -0.5;
          break;
        case 'virabhadrasana_1':
        case 'virabhadrasana_2':
          group.current.rotation.y = Math.PI / 2;
          break;
        case 'bhujangasana': // Cobra
          group.current.rotation.x = Math.PI / 4;
          group.current.position.y = -1.5;
          break;
        default:
          group.current.rotation.y = Math.PI;
      }
    }
  }, [poseId, isActive, actions, names]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1.2} />
    </group>
  );
};

const YOGSHALAInstructor3D: React.FC<YOGSHALAInstructor3DProps> = ({
  poseId,
  poseName,
  instructions,
  isActive,
  onToggleActive,
  onNext,
  onReset
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setCurrentStep(0);
  }, [poseId]);

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-inner">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={null}>
            <InstructorModel poseId={poseId} isActive={isActive} />
            <Environment preset="city" />
            <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          </Suspense>
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
          />
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Info */}
        <div className="flex justify-between items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={poseName}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg pointer-events-auto"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{poseName}</h3>
            <p className="text-xs text-primary font-medium uppercase tracking-wider">3D Instructor Mode</p>
          </motion.div>

          <div className="flex flex-col space-y-2 pointer-events-auto">
            <button 
              onClick={onReset}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Instructions & Controls */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${poseId}-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl pointer-events-auto"
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                  {currentStep + 1}
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                    {instructions[currentStep]}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-1">
                      {instructions.map((_, i) => (
                        <div 
                          key={i}
                          className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-6 bg-primary' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentStep((prev) => (prev + 1) % instructions.length)}
                      className="text-xs font-bold text-primary flex items-center space-x-1 hover:underline"
                    >
                      <span>Next Step</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center space-x-4 pointer-events-auto">
            <button 
              onClick={onToggleActive}
              className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={onNext}
              className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-md active:scale-95 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State Overlay */}
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 z-50">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500 animate-pulse">Summoning Instructor...</p>
        </div>
      }>
        <div className="hidden" />
      </Suspense>
    </div>
  );
};

export default YOGSHALAInstructor3D;
