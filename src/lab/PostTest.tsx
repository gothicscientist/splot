import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Minimal custom post: scene -> render target -> full-screen quad (vignette) -> screen.
export const PostTest: React.FC = () => {
  const { gl, scene, camera, size } = useThree();
  const dpr = gl.getPixelRatio();
  const w = Math.round(size.width * dpr), h = Math.round(size.height * dpr);
  const rt = useMemo(() => {
    const t = new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.HalfFloatType });
    t.depthTexture = new THREE.DepthTexture(w, h);
    return t;
  }, [w, h]);
  const { quadScene, quadCam, mat } = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { tColor: { value: null }, tDepth: { value: null } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `uniform sampler2D tColor; uniform sampler2D tDepth; varying vec2 vUv;
        void main(){ vec4 c = texture2D(tColor, vUv); float d = length(vUv-0.5)*1.4; c.rgb *= mix(1.0, 0.55, smoothstep(0.4,1.0,d));
          gl_FragColor = vec4(c.rgb, 1.0);
          #include <colorspace_fragment>
        }`,
      depthTest: false, depthWrite: false,
    });
    const quadScene = new THREE.Scene();
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { quadScene, quadCam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), mat };
  }, []);
  useFrame(() => {
    gl.setRenderTarget(rt);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    mat.uniforms.tColor.value = rt.texture;
    mat.uniforms.tDepth.value = rt.depthTexture;
    gl.render(quadScene, quadCam);
  }, 1);
  return null;
};
