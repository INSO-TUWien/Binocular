'use-strict';

const DotsPattern = (color, id) => (
  <pattern id={id} width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(0.07)">
    <circle id={`circle_${id}`} data-color="outline" fill="none" stroke={color} strokeWidth="67.36" r=".5"></circle>
    <use href={`#circle_${id}`} y="100"></use>
    <use href={`#circle_${id}`} x="100"></use>
    <use href={`#circle_${id}`} x="100" y="100"></use>
    <use href={`#circle_${id}`} x="50" y="50"></use>
  </pattern>
);

export default DotsPattern;
