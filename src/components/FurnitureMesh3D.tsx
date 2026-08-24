import type { Product } from "../types";

export function FurnitureMesh3D({
  product,
  selected,
  walking,
}: {
  product: Product;
  selected?: boolean;
  walking?: boolean;
}) {
  const fill = product.swatch;
  const line = product.accent;
  const glow = selected || walking ? 0.28 : 0;
  const highlight = walking ? line : fill;

  return (
    <group>
      {product.category === "rug" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
          <planeGeometry args={[2.35, 1.55]} />
          <meshStandardMaterial
            color={fill}
            roughness={0.9}
            emissive={highlight}
            emissiveIntensity={glow * 0.4}
          />
        </mesh>
      )}
      {product.category === "sofa" && (
        <>
          <mesh position={[0, 0.22, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[2.05, 0.42, 0.82]} />
            <meshStandardMaterial color={fill} roughness={0.72} emissive={highlight} emissiveIntensity={glow} />
          </mesh>
          <mesh position={[0, 0.52, -0.3]} castShadow>
            <boxGeometry args={[2.05, 0.55, 0.22]} />
            <meshStandardMaterial color={fill} roughness={0.7} />
          </mesh>
          <mesh position={[-0.9, 0.4, 0.08]} castShadow>
            <boxGeometry args={[0.22, 0.32, 0.7]} />
            <meshStandardMaterial color={line} roughness={0.65} />
          </mesh>
          <mesh position={[0.9, 0.4, 0.08]} castShadow>
            <boxGeometry args={[0.22, 0.32, 0.7]} />
            <meshStandardMaterial color={line} roughness={0.65} />
          </mesh>
        </>
      )}
      {product.category === "chair" && (
        <>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.16, 0.62]} />
            <meshStandardMaterial color={fill} roughness={0.7} emissive={highlight} emissiveIntensity={glow} />
          </mesh>
          <mesh position={[0, 0.52, -0.22]} castShadow>
            <boxGeometry args={[0.62, 0.48, 0.14]} />
            <meshStandardMaterial color={fill} roughness={0.7} />
          </mesh>
          <mesh position={[-0.2, 0.14, 0.2]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0.2, 0.14, 0.2]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[-0.2, 0.14, -0.2]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0.2, 0.14, -0.2]} castShadow>
            <boxGeometry args={[0.08, 0.28, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
        </>
      )}
      {product.category === "table" && (
        <>
          <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.52, 0.52, 0.06, 28]} />
            <meshStandardMaterial color={fill} roughness={0.45} emissive={highlight} emissiveIntensity={glow} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.38, 12]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
            <meshStandardMaterial color={fill} />
          </mesh>
        </>
      )}
      {product.category === "bed" && (
        <>
          <mesh position={[0, 0.28, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.32, 2.05]} />
            <meshStandardMaterial color={fill} roughness={0.8} emissive={highlight} emissiveIntensity={glow} />
          </mesh>
          <mesh position={[0, 0.62, -0.92]} castShadow>
            <boxGeometry args={[1.7, 0.7, 0.12]} />
            <meshStandardMaterial color={line} roughness={0.6} />
          </mesh>
        </>
      )}
      {product.category === "desk" && (
        <>
          <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 0.06, 0.62]} />
            <meshStandardMaterial color={fill} roughness={0.5} emissive={highlight} emissiveIntensity={glow} />
          </mesh>
          <mesh position={[-0.58, 0.36, 0.22]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0.58, 0.36, 0.22]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[-0.58, 0.36, -0.22]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0.58, 0.36, -0.22]} castShadow>
            <boxGeometry args={[0.08, 0.72, 0.08]} />
            <meshStandardMaterial color={line} />
          </mesh>
        </>
      )}
      {product.category === "lamp" && (
        <>
          <mesh position={[0, 0.04, 0]} receiveShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.05, 16]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.3, 8]} />
            <meshStandardMaterial color={line} metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.42, 0]} castShadow>
            <coneGeometry args={[0.22, 0.28, 16, 1, true]} />
            <meshStandardMaterial
              color={fill}
              roughness={0.6}
              emissive={fill}
              emissiveIntensity={0.35 + glow}
            />
          </mesh>
          <pointLight position={[0, 1.25, 0]} intensity={0.45} distance={3.5} color={fill} />
        </>
      )}
      {product.category === "plant" && (
        <>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.24, 12]} />
            <meshStandardMaterial color={line} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshStandardMaterial color={fill} roughness={0.85} emissive={highlight} emissiveIntensity={glow} />
          </mesh>
          <mesh position={[0.12, 1.0, -0.05]} castShadow>
            <sphereGeometry args={[0.2, 14, 10]} />
            <meshStandardMaterial color={fill} roughness={0.85} />
          </mesh>
        </>
      )}
    </group>
  );
}
