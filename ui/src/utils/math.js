export function isPrime(n) {
  if (n <= 2) {
    return n >= 0 && n % 2 === 0;
  }

  for (let x = 2; x < n; x++) {
    if (n % x === 0) {
      return false;
    }
  }
  return true;
}

export function nextPrime(num) {
  // eslint-disable-next-line no-empty
  while (!isPrime(++num)) {}
  return num;
}
