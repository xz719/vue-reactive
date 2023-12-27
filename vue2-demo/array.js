// array.js
import { arrayPrototype, proxyPrototype } from "./public";

// 需要监听的方法
const reactiveMethods = [
    'push',
    'pop',
    'unshift',
    'shift',
    'splice',
    'reverse',
    'sort',
]

// 代理原型
reactiveMethods.forEach((method) => {
    // 取出原方法
    const originalMethod = arrayPrototype[method]
    // 在我们的代理原型上定义该方法的响应式版本
    Object.defineProperty(proxyPrototype, method, {
        value: function reactiveMethod(...args) {
            // 首先确保调用不受影响
            const result = originalMethod.apply(this, args)
            // 获取数组对象的 Observer 类实例
            const ob = this.__ob__
            // 对三种方法特殊处理
            let appended = null
            switch (method) {
                case 'push':
                case 'unshift':
                    appended = args
                    break;
                case 'splice':
                    // splice 方法中，第三个以及以后的参数是新增的数据
                    appended = args.slice(2)
            }
            // 如果有新增的数据，则对这些新增的数据进行劫持
            if (appended) ob.observerArray(appended)
            // 通过dep实例派发更新
            ob.dep.notify()
            return result
        },
        enumerable: false,
    	writable: true,
    	configurable: true
    })
})