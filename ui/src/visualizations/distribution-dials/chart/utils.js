//given a circle at (0,0) and specified radius, get the coordinates of a point on the outside line for the specified angle
export function getCoordinatesForAngle(r, angle) {
  const x = r * Math.cos(angle);
  const y = r * Math.sin(angle);
  return [x, y];
}

export function getAngle(percent) {
  const max = 2 * Math.PI;
  return max * percent;
}

export function getAngleAdjusted(percent) {
  //for some reason, d3 starts drawing 90° off (clockwise), so we add a 3/4 turn
  const max = 2 * Math.PI;
  return (max * percent + max * 0.75) % max;
}

export function getCoordinatesForBucket(currentBucket, bucketsNum, currentValue, maxValue, innerRadius, outerRadius) {
  //give it half a bucketsize more so the point ends up in the middle of the bucket and not directly on the line
  const percent = (0.5 + currentBucket) / bucketsNum;
  const rad = innerRadius + ((0.0 + currentValue) / maxValue) * (outerRadius - innerRadius);
  return getCoordinatesForAngle(rad, getAngleAdjusted(percent));
}

export function getInverseCoordinatesForBucket(currentBucket, bucketsNum, currentValue, maxValue, innerRadius, outerRadius) {
  //give it half a bucketsize more so the point ends up in the middle of the bucket and not directly on the line
  const percent = (0.5 + currentBucket) / bucketsNum;
  const rad = outerRadius - ((0.0 + currentValue) / maxValue) * (outerRadius - innerRadius);
  return getCoordinatesForAngle(rad, getAngleAdjusted(percent));
}

export function getCoordinatesForRadius(currentBucket, bucketsNum, radius) {
  //point ends up directly on the line
  const percent = currentBucket / bucketsNum;
  return getCoordinatesForAngle(radius, getAngleAdjusted(percent));
}

export function getOuterCoordinatesForBucket(currentBucket, bucketsNum, outerRadius) {
  //give it half a bucketsize more so the point ends up in the middle of the bucket and not directly on the line
  const percent = (0.5 + currentBucket) / bucketsNum;
  return getCoordinatesForAngle(outerRadius, getAngleAdjusted(percent));
}
