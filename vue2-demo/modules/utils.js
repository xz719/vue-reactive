export function def(obj, key, value, enumerable = false) {
  Object.defineProperty(obj, key, {
    value,
    enumerable,
    writable: true,
    configurable: true,
  });
}

// 工具函数，返回一个用于根据指定访问路径，取出某一对象下的指定属性的函数
export function parsePath(expression) {
  const segments = expression.split(".");
  return function (obj) {
    for (let key of segments) {
      if (!obj) return;
      obj = obj[key];
    }
    return obj;
  };
}

// 工具函数，判断一个值是否是对象
export function isObject(target) {
  return typeof target === "object" && target !== null;
}
