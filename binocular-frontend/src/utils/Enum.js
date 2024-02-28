/**
 * creates a readonly enum
 *
 * @type {Readonly<{}>}
 */
export function createEnum(plainEnum) {
  return Object.freeze(
    (() => {
      if (Array.isArray(plainEnum)) {
        plainEnum = plainEnum.reduce((data, key, i) => {
          data[key] = i ? Math.pow(2, i) : 0;
          return data;
        }, []);
      }

      const data = Object.keys(plainEnum).reduce((item, key) => {
        item[key.replace(/\s+/g, '')] = { value: plainEnum[key], name: key };
        return item;
      }, {});

      data.valueOf = (value) => {
        const foundKey = Object.keys(data).find(
          (key) =>
            value &&
            (data[key] === value ||
              data[key].name.toUpperCase().replace(/\s+/g, '') === `${value}`.replace(/\s+/g, '').toUpperCase() ||
              data[key].value === value),
        );
        return foundKey ? data[foundKey] : data.None;
      };

      Object.defineProperty(data, 'getAvailable', {
        get: function () {
          return Object.keys(data)
            .filter((key) => data[key].value)
            .map((key) => data[key].name);
        },
      });

      Object.defineProperty(data, 'values', {
        get: function () {
          return Object.keys(data)
            .filter((key) => data[key].value)
            .map((key) => data[key]);
        },
      });

      return data;
    })(),
  );
}
