'use-strict';

const HatchPattern = (color, id) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width="4" height="4">
    <path
      d="M-1,1 l2,-2
                    M0,4 l4,-4
                    M3,5 l2,-2"
      style={{ stroke: color, strokeWidth: 1 }}
    />
  </pattern>
);

export default HatchPattern;
