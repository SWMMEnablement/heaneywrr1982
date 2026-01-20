import { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TetrahedronVisualizationProps {
  participants: { id: number; name: string; independentCost: number }[];
  allocations: {
    scrb: number[];
    shapley: number[];
    nucleolus: number[];
    equal: number[];
  };
  grandCoalitionCost: number;
}

// Convert 4D barycentric coordinates to 3D Cartesian (tetrahedron vertices)
const barycentricToCartesian = (coords: number[]): [number, number, number] => {
  // Regular tetrahedron vertices
  const vertices: [number, number, number][] = [
    [1, 1, 1],      // P1 - top front right
    [-1, -1, 1],    // P2 - bottom back right
    [-1, 1, -1],    // P3 - bottom front left
    [1, -1, -1],    // P4 - top back left
  ];
  
  const [a, b, c, d] = coords;
  const total = a + b + c + d;
  const normalized = [a/total, b/total, c/total, d/total];
  
  return [
    normalized[0] * vertices[0][0] + normalized[1] * vertices[1][0] + normalized[2] * vertices[2][0] + normalized[3] * vertices[3][0],
    normalized[0] * vertices[0][1] + normalized[1] * vertices[1][1] + normalized[2] * vertices[2][1] + normalized[3] * vertices[3][1],
    normalized[0] * vertices[0][2] + normalized[1] * vertices[1][2] + normalized[2] * vertices[2][2] + normalized[3] * vertices[3][2],
  ];
};

// Tetrahedron wireframe component
const TetrahedronWireframe = () => {
  const vertices: [number, number, number][] = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1],
  ];

  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 3], [2, 3],
  ];

  const lineGeometries = useMemo(() => {
    return edges.map(([start, end]) => {
      const points = [
        new THREE.Vector3(...vertices[start]),
        new THREE.Vector3(...vertices[end]),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, []);

  return (
    <group>
      {lineGeometries.map((geometry, i) => (
        <primitive key={i} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.4 }))} />
      ))}
      {/* Faces with transparency */}
      <mesh>
        <tetrahedronGeometry args={[1.73, 0]} />
        <meshBasicMaterial color="#888" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Allocation point component
const AllocationPoint = ({ 
  position, 
  color, 
  label, 
  values,
  isHovered,
  onHover,
}: { 
  position: [number, number, number]; 
  color: string; 
  label: string;
  values: number[];
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isHovered ? 1.3 : 1;
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {isHovered && (
        <Html distanceFactor={4} center>
          <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap">
            <p className="font-semibold text-xs" style={{ color }}>{label}</p>
            <p className="text-xs text-muted-foreground">
              [{values.map(v => v.toFixed(2)).join(', ')}]
            </p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Vertex labels
const VertexLabel = ({ position, label }: { position: [number, number, number]; label: string }) => {
  return (
    <Text
      position={[position[0] * 1.2, position[1] * 1.2, position[2] * 1.2]}
      fontSize={0.15}
      color="#888"
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>
  );
};

// Auto-rotating group
const AutoRotate = ({ children, speed = 0.3 }: { children: React.ReactNode; speed?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });
  
  return <group ref={groupRef}>{children}</group>;
};

// Main scene component
const Scene = ({ 
  allocations, 
  grandCoalitionCost,
  participants,
  autoRotate,
}: {
  allocations: TetrahedronVisualizationProps['allocations'];
  grandCoalitionCost: number;
  participants: TetrahedronVisualizationProps['participants'];
  autoRotate: boolean;
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const points = useMemo(() => {
    if (grandCoalitionCost === 0) return [];
    
    return [
      { 
        key: 'scrb', 
        label: 'SCRB', 
        color: '#4f46e5', 
        values: allocations.scrb,
        position: barycentricToCartesian(allocations.scrb),
      },
      { 
        key: 'shapley', 
        label: 'Shapley', 
        color: '#0891b2', 
        values: allocations.shapley,
        position: barycentricToCartesian(allocations.shapley),
      },
      { 
        key: 'nucleolus', 
        label: 'Nucleolus', 
        color: '#059669', 
        values: allocations.nucleolus,
        position: barycentricToCartesian(allocations.nucleolus),
      },
      { 
        key: 'equal', 
        label: 'Equal', 
        color: '#6b7280', 
        values: allocations.equal,
        position: barycentricToCartesian(allocations.equal),
      },
    ];
  }, [allocations, grandCoalitionCost]);

  const vertices: [number, number, number][] = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1],
  ];

  const content = (
    <>
      <TetrahedronWireframe />
      
      {/* Vertex labels */}
      {participants.map((p, i) => (
        <VertexLabel 
          key={p.id} 
          position={vertices[i]} 
          label={p.name.length > 6 ? p.name.slice(0, 6) + '…' : p.name} 
        />
      ))}
      
      {/* Allocation points */}
      {points.map((point) => (
        <AllocationPoint
          key={point.key}
          position={point.position}
          color={point.color}
          label={point.label}
          values={point.values}
          isHovered={hoveredPoint === point.key}
          onHover={(hovered) => setHoveredPoint(hovered ? point.key : null)}
        />
      ))}

      {/* Centroid reference */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#999" transparent opacity={0.5} />
      </mesh>
    </>
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {autoRotate ? (
        <AutoRotate speed={0.2}>{content}</AutoRotate>
      ) : (
        content
      )}
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        autoRotate={false}
      />
    </>
  );
};

const TetrahedronVisualization = ({
  participants,
  allocations,
  grandCoalitionCost,
}: TetrahedronVisualizationProps) => {
  const [autoRotate, setAutoRotate] = useState(true);

  if (participants.length !== 4) {
    return null;
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif">
              <Box className="w-5 h-5 text-interactive" />
              3D Simplex Visualization
              <Badge variant="outline" className="ml-2 text-xs">4-Player</Badge>
            </CardTitle>
            <CardDescription>
              Interactive tetrahedron showing allocation methods in 4D barycentric space
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
              className="gap-1"
            >
              {autoRotate ? <Eye className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
              {autoRotate ? 'Manual' : 'Auto-rotate'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-lg overflow-hidden bg-gradient-to-b from-muted/20 to-muted/5 border border-border">
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              Loading 3D visualization...
            </div>
          }>
            <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
              <Scene 
                allocations={allocations} 
                grandCoalitionCost={grandCoalitionCost}
                participants={participants}
                autoRotate={autoRotate}
              />
            </Canvas>
          </Suspense>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          {[
            { label: 'SCRB', color: 'bg-primary' },
            { label: 'Shapley', color: 'bg-interactive' },
            { label: 'Nucleolus', color: 'bg-accent' },
            { label: 'Equal', color: 'bg-muted-foreground/50' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-3">
          Drag to rotate • Scroll to zoom • Hover points for details
        </p>
      </CardContent>
    </Card>
  );
};

export default TetrahedronVisualization;
