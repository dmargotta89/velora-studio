import { ContactShadows, Html, OrbitControls, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { paletteAtmosphere, percentToWorld, worldToPercent } from "../lib/spatial";
import type { StudioModel } from "../lib/useStudio";
import type { PaletteId, Placement, Product } from "../types";
import { FurnitureMesh3D } from "./FurnitureMesh3D";

const HOME_POS = new THREE.Vector3(0.8, 1.55, 3.7);
const HOME_LOOK = new THREE.Vector3(0, 0.7, -0.8);

function ScanWall({ src }: { src: string }) {
  const texture = useTexture(src);
  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  return (
    <mesh position={[0, 1.62, -3.28]} receiveShadow>
      <planeGeometry args={[6.15, 3.28]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  );
}

function RoomShell({ palette }: { palette: PaletteId }) {
  const look = paletteAtmosphere[palette];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.4]} receiveShadow>
        <planeGeometry args={[7.2, 6.6]} />
        <meshStandardMaterial color={look.floor} roughness={0.82} />
      </mesh>
      <mesh position={[-3.35, 1.7, -0.5]} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 6.4]} />
        <meshStandardMaterial color={look.wall} roughness={0.9} />
      </mesh>
      <mesh position={[3.35, 1.7, -0.5]} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 6.4]} />
        <meshStandardMaterial color={look.wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.38, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.2, 6.6]} />
        <meshStandardMaterial color={look.wall} roughness={1} />
      </mesh>
      <mesh position={[3.28, 1.7, 0.2]}>
        <planeGeometry args={[0.02, 1.6]} />
        <meshStandardMaterial color={look.key} emissive={look.key} emissiveIntensity={0.55} />
      </mesh>
      <ambientLight intensity={palette === "ink-brass" ? 0.42 : 0.62} color={look.ambient} />
      <directionalLight
        castShadow
        position={[-2.2, 4.4, 3.2]}
        intensity={palette === "ink-brass" ? 1.1 : 1.4}
        color={look.key}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <hemisphereLight args={[look.key, look.floor, 0.28]} />
    </group>
  );
}

function WalkCamera({
  active,
  focus,
}: {
  active: boolean;
  focus: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const look = useRef(HOME_LOOK.clone());
  const goal = useRef(HOME_POS.clone());
  const target = useRef(HOME_LOOK.clone());

  useEffect(() => {
    if (active) return;
    camera.position.copy(HOME_POS);
    camera.lookAt(HOME_LOOK);
  }, [active, camera]);

  useFrame((_, dt) => {
    if (!active || !focus) return;
    const k = 1 - Math.exp(-dt * 2.1);
    const [x, , z] = focus;
    goal.current.set(
      THREE.MathUtils.clamp(x * 0.35, -1.8, 1.8),
      1.48,
      THREE.MathUtils.clamp(z + 1.85, -1.1, 3.85),
    );
    target.current.set(x, 0.62, z);
    camera.position.lerp(goal.current, k);
    look.current.lerp(target.current, k);
    camera.lookAt(look.current);
  });
  return null;
}

function Piece({
  placement,
  product,
  selected,
  walking,
  onSelect,
  onDragStart,
}: {
  placement: Placement;
  product: Product;
  selected: boolean;
  walking: boolean;
  onSelect: () => void;
  onDragStart: () => void;
}) {
  const [x, , z] = percentToWorld(placement.x, placement.y);
  const yaw = (placement.rotation * Math.PI) / 180;

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, yaw, 0]}
      scale={placement.scale}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onSelect();
        onDragStart();
      }}
    >
      <FurnitureMesh3D key={product.id} product={product} selected={selected} walking={walking} />
      {selected || walking ? (
        <Html position={[0, 1.15, 0]} center distanceFactor={7} style={{ pointerEvents: "none" }}>
          <div className="spatial-label">
            <b>{product.name}</b>
            <span>
              {product.retailer}
              {walking ? " · PREVIEW" : ""}
            </span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function DragController({
  dragId,
  studio,
  onEnd,
}: {
  dragId: string | null;
  studio: StudioModel;
  onEnd: () => void;
}) {
  const { camera, gl } = useThree();
  const dragIdRef = useRef(dragId);
  const onEndRef = useRef(onEnd);
  const studioRef = useRef(studio);
  dragIdRef.current = dragId;
  onEndRef.current = onEnd;
  studioRef.current = studio;

  useEffect(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    function move(event: PointerEvent) {
      const id = dragIdRef.current;
      if (!id) return;
      const rect = gl.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        const next = worldToPercent(hit.x, hit.z);
        studioRef.current.movePlacement(id, next.x, next.y);
      }
    }

    function end() {
      if (dragIdRef.current) onEndRef.current();
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, [camera, gl]);

  return null;
}

function StageScene({
  studio,
  walkIndex,
}: {
  studio: StudioModel;
  walkIndex: number;
}) {
  const room = studio.state.room;
  const [dragId, setDragId] = useState<string | null>(null);
  const walkItem = studio.placedProducts[walkIndex];
  const focus = useMemo(() => {
    if (!studio.walkthrough || !walkItem) return null;
    return percentToWorld(walkItem.placement.x, walkItem.placement.y);
  }, [studio.walkthrough, walkItem]);

  if (!room) return null;

  return (
    <>
      <group
        onPointerDown={() => {
          if (!dragId) studio.selectPlacement(null);
        }}
      >
        <RoomShell palette={studio.state.taste.palette} />
        <Suspense fallback={null}>
          <ScanWall src={room.imageSrc} />
        </Suspense>
      </group>
      {studio.placedProducts.map(({ placement, product }) => (
        <Piece
          key={placement.id}
          placement={placement}
          product={product}
          selected={studio.state.selectedId === placement.id}
          walking={Boolean(
            studio.walkthrough && walkItem?.placement.id === placement.id,
          )}
          onSelect={() => studio.selectPlacement(placement.id)}
          onDragStart={() => setDragId(placement.id)}
        />
      ))}
      <DragController
        dragId={dragId}
        studio={studio}
        onEnd={() => setDragId(null)}
      />
      <ContactShadows
        position={[0, 0.02, -0.4]}
        opacity={0.32}
        scale={8}
        blur={2.2}
        far={4}
        resolution={512}
      />
      <WalkCamera active={studio.walkthrough} focus={focus} />
      <OrbitControls
        makeDefault
        enabled={!studio.walkthrough && !dragId}
        enablePan={false}
        minPolarAngle={Math.PI * 0.38}
        maxPolarAngle={Math.PI * 0.5}
        minDistance={2.4}
        maxDistance={7.2}
        target={[0, 0.7, -0.8]}
      />
    </>
  );
}

export function SpatialStage({
  studio,
  walkIndex,
}: {
  studio: StudioModel;
  walkIndex: number;
}) {
  return (
    <Canvas
      className="spatial-stage"
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0.8, 1.55, 3.7], fov: 46, near: 0.1, far: 40 }}
      onPointerMissed={() => studio.selectPlacement(null)}
    >
      <color attach="background" args={["#1c1713"]} />
      <StageScene studio={studio} walkIndex={walkIndex} />
    </Canvas>
  );
}
