'use strict';

import { isPrime, nextPrime } from '../src/utils/math';
import { expect } from 'chai';

describe('isPrime', function () {
  it('should return true or false depending on if n is a prime number', function () {
    expect(isPrime(17)).to.equal(true);
    expect(isPrime(29)).to.equal(true);
    expect(isPrime(43)).to.equal(true);
    expect(isPrime(11)).to.equal(true);
    expect(isPrime(31)).to.equal(true);

    expect(isPrime(20)).to.equal(false);
    expect(isPrime(50)).to.equal(false);
    expect(isPrime(63)).to.equal(false);
    expect(isPrime(91)).to.equal(false);
    expect(isPrime(100)).to.equal(false);
  });
});

describe('nextPrime', function () {
  it('should return the next prime number after n', function () {
    expect(nextPrime(17)).to.equal(19);
    expect(nextPrime(29)).to.equal(31);
    expect(nextPrime(43)).to.equal(47);
    expect(nextPrime(11)).to.equal(13);
    expect(nextPrime(31)).to.equal(37);

    expect(nextPrime(20)).to.equal(23);
    expect(nextPrime(50)).to.equal(53);
    expect(nextPrime(63)).to.equal(67);
    expect(nextPrime(91)).to.equal(97);
    expect(nextPrime(100)).to.equal(101);
  });
});
