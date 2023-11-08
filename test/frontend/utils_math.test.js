'use strict';

import { isPrime, nextPrime } from '../../ui/src/utils/math';

describe('isPrime', function () {
  it('should return true or false depending on if n is a prime number', function () {
    expect(isPrime(17)).toBe(true);
    expect(isPrime(29)).toBe(true);
    expect(isPrime(43)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(31)).toBe(true);

    expect(isPrime(20)).toBe(false);
    expect(isPrime(50)).toBe(false);
    expect(isPrime(63)).toBe(false);
    expect(isPrime(91)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });
});

describe('nextPrime', function () {
  it('should return the next prime number after n', function () {
    expect(nextPrime(17)).toBe(19);
    expect(nextPrime(29)).toBe(31);
    expect(nextPrime(43)).toBe(47);
    expect(nextPrime(11)).toBe(13);
    expect(nextPrime(31)).toBe(37);

    expect(nextPrime(20)).toBe(23);
    expect(nextPrime(50)).toBe(53);
    expect(nextPrime(63)).toBe(67);
    expect(nextPrime(91)).toBe(97);
    expect(nextPrime(100)).toBe(101);
  });
});
