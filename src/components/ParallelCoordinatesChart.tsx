import { useMemo } from "react";
import { motion } from "framer-motion";

interface ParallelCoordinatesChartProps {
  participants: { id: number; name: string; independentCost: number }[];
  allocations: {
    scrb: number[];
    shapley: number[];
    nucleolus: number[];
    equal: number[];
  };
}

const ParallelCoordinatesChart = ({
  participants,
  allocations,
}: ParallelCoordinatesChartProps) => {
  const width = 600;
  const height = 350;
  const padding = { top: 50, right: 40, bottom: 40, left: 40 };

  const methods = useMemo(() => [
    { key: 'scrb', name: 'SCRB', color: 'hsl(var(--primary))', values: allocations.scrb },
    { key: 'shapley', name: 'Shapley', color: 'hsl(var(--interactive))', values: allocations.shapley },
    { key: 'nucleolus', name: 'Nucleolus', color: 'hsl(var(--accent))', values: allocations.nucleolus },
    { key: 'equal', name: 'Equal', color: 'hsl(var(--muted-foreground))', values: allocations.equal },
  ], [allocations]);

  // Calculate axis positions
  const axisPositions = useMemo(() => {
    const chartWidth = width - padding.left - padding.right;
    return participants.map((_, i) => 
      padding.left + (i / (participants.length - 1)) * chartWidth
    );
  }, [participants.length]);

  // Calculate Y scale
  const yScale = useMemo(() => {
    const allValues = [
      ...allocations.scrb,
      ...allocations.shapley,
      ...allocations.nucleolus,
      ...allocations.equal,
    ];
    const minVal = Math.min(0, ...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    
    return (value: number) => {
      const chartHeight = height - padding.top - padding.bottom;
      return padding.top + chartHeight - ((value - minVal) / range) * chartHeight;
    };
  }, [allocations]);

  // Generate path for each method
  const generatePath = (values: number[]) => {
    return values.map((val, i) => {
      const x = axisPositions[i];
      const y = yScale(val);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const allValues = [
      ...allocations.scrb,
      ...allocations.shapley,
      ...allocations.nucleolus,
      ...allocations.equal,
    ];
    const minVal = Math.min(0, ...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    const step = range / 4;
    
    return Array.from({ length: 5 }, (_, i) => minVal + i * step);
  }, [allocations]);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={width - padding.left - padding.right}
          height={height - padding.top - padding.bottom}
          fill="hsl(var(--muted) / 0.1)"
          rx={8}
        />

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeDasharray={i === 0 ? "0" : "4 4"}
              opacity={0.5}
            />
            <text
              x={padding.left - 8}
              y={yScale(tick)}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Vertical axes for each participant */}
        {participants.map((p, i) => (
          <g key={p.id}>
            <line
              x1={axisPositions[i]}
              x2={axisPositions[i]}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="hsl(var(--border))"
              strokeWidth={2}
            />
            <text
              x={axisPositions[i]}
              y={padding.top - 12}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="hsl(var(--foreground))"
            >
              {p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}
            </text>
            <text
              x={axisPositions[i]}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize={10}
              fill="hsl(var(--muted-foreground))"
            >
              P{p.id}
            </text>
          </g>
        ))}

        {/* Method lines */}
        {methods.map((method, methodIndex) => (
          <motion.g key={method.key}>
            <motion.path
              d={generatePath(method.values)}
              fill="none"
              stroke={method.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: methodIndex * 0.15 }}
            />
            {/* Data points */}
            {method.values.map((val, i) => (
              <motion.g key={i}>
                <motion.circle
                  cx={axisPositions[i]}
                  cy={yScale(val)}
                  r={5}
                  fill={method.color}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: methodIndex * 0.15 + 0.5 + i * 0.05 }}
                />
                {/* Value label on hover */}
                <title>{`${method.name}: ${val.toFixed(2)}`}</title>
              </motion.g>
            ))}
          </motion.g>
        ))}

        {/* Legend */}
        <g transform={`translate(${width - padding.right - 80}, ${padding.top})`}>
          {methods.map((method, i) => (
            <g key={method.key} transform={`translate(0, ${i * 20})`}>
              <line
                x1={0}
                x2={20}
                y1={0}
                y2={0}
                stroke={method.color}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <circle cx={10} cy={0} r={3} fill={method.color} />
              <text
                x={26}
                y={0}
                alignmentBaseline="middle"
                fontSize={10}
                fontWeight={500}
                fill="hsl(var(--foreground))"
              >
                {method.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default ParallelCoordinatesChart;
