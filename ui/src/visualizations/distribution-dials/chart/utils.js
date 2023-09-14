//given a circle at (0,0) and specified radius, get the coordinates of a point on the outside line for the specified angle
export function getCoordinatesForAngle(r, angle) {
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  return [x, y];
}

export function getAngle(percent) {
  //for some reason, d3 starts drawing 90° off (clockwise), so we add a 3/4 turn
  const max = 2 * Math.PI;
  return (max * percent + max * 0.75) % max;
}
