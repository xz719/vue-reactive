// public.js
// 定义两个全局变量
export const arrayPrototype = Array.prototype	// 保存数组的原型
// 增加代理原型 proxyPrototype 且 proxyPrototype.__proto__ === arrayProrotype
export const proxyPrototype = Object.create(arrayPrototype)