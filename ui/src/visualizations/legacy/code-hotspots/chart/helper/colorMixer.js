'use strict';

export default class ColorMixer {
  static mix(colorA, colorB, amount) {
    if (amount === 0) {
      return '#FFFFFF';
    }
    const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount)
      .toString(16)
      .padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount)
      .toString(16)
      .padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount)
      .toString(16)
      .padStart(2, '0');
    return '#' + r + g + b;
  }

  static rainbow(numOfSteps, step) {
    let r, g, b;
    const h = step / numOfSteps;
    const i = ~~(h * 6);
    const f = h * 6 - i;
    const q = 1 - f;
    switch (i % 6) {
      case 0:
        r = 1;
        g = f;
        b = 0;
        break;
      case 1:
        r = q;
        g = 1;
        b = 0;
        break;
      case 2:
        r = 0;
        g = 1;
        b = f;
        break;
      case 3:
        r = 0;
        g = q;
        b = 1;
        break;
      case 4:
        r = f;
        g = 0;
        b = 1;
        break;
      case 5:
        r = 1;
        g = 0;
        b = q;
        break;
      default:
        break;
    }
    return (
      '#' +
      ('00' + (~~(r * 255)).toString(16)).slice(-2) +
      ('00' + (~~(g * 255)).toString(16)).slice(-2) +
      ('00' + (~~(b * 255)).toString(16)).slice(-2) +
      'AA'
    );
  }
}
