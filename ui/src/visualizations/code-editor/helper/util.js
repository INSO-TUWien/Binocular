export function shortenString(text, length) {
  if (text.length > length) {
    return text.substring(0, 15);
  }
}

// changed from existing code: https://gist.github.com/scwood/e58380174bd5a94174c9f08ac921994f
export function largestRemainderRound(numbers, desiredTotal, decimalPlaces) {
  const multiplier = Math.pow(10, decimalPlaces);
  numbers.forEach((number, i) => (numbers[i] *= multiplier));
  desiredTotal *= multiplier;
  const result = numbers
    .map(function(number, index) {
      return {
        floor: Math.floor(number),
        remainder: getRemainder(number),
        index: index
      };
    })
    .sort(function(a, b) {
      return b.remainder - a.remainder;
    });

  const lowerSum = result.reduce(function(sum, current) {
    return sum + current.floor;
  }, 0);

  const delta = desiredTotal - lowerSum;
  for (let i = 0; i < delta; i++) {
    result[i].floor++;
  }

  return result
    .sort(function(a, b) {
      return a.index - b.index;
    })
    .map(function(result) {
      return result.floor / multiplier;
    });
}

function getRemainder(number) {
  const remainder = number - Math.floor(number);
  return remainder.toFixed(4);
}
