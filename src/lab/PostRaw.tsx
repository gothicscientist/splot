import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, RenderPass, EffectPass, BloomEffect, VignetteEffect, DepthOfFieldEffect, ToneMappingEffect, ToneMappingMode, BlendFunction } from "postprocessing";

// The raw postprocessing EffectComposer driven from our own priority-1 useFrame (no R3F wrapper).
export const PostRaw: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    c.addPass(new RenderPass(scene, camera));
    const dof = new DepthOfFieldEffect(camera, { focusDistance: 0.0, focalLength: 0.05, bokehScale: 5.0, height: 960 });
    dof.target = new THREE.Vector3(0, 1.3, 0);
    c.addPass(new EffectPass(camera, dof));
    c.addPass(new EffectPass(camera, new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, mipmapBlur: true }), new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), new VignetteEffect({ offset: 0.3, darkness: 0.55 })));
    return c;
  }, [gl, scene, camera]);
  useEffect(() => { composer.setSize(size.width, size.height); }, [composer, size]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame((_, delta) => { composer.render(delta); }, 1);
  return null;
};
