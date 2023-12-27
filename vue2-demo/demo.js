// demo.js
import { arrayPrototype, proxyPrototype } from "./public";
// observer 方法
function observer (value) {
    if (!isObject(value)) {
        return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else {
        ob = new Observer(value);
    }
    return ob
}

// Observer 类
export class Observer {
  constructor(value) {
    this.value = value
    // 声明该数据对应的 dep 实例
    this.dep = new Dep()
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // 如果是数组类型数据的话就特殊处理
      // 代理原型
      Object.setPrototypeOf(value, proxyPrototype)
      // 监听数组内容
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  // 遍历下一层属性，执行defineReactive
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  observeArray(arr) {
    // 对数组内部的对象类型数据进行监听
    arr.forEach((i) => observe(i))
  }
}

// def 方法，用于为当前正在拦截的数据添加 __ob__ 属性
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

// 数据劫持
function defineReactive(data, key, value = data[key]) {
  const dep = new Dep()
  // 对当前属性的下一层属性进行劫持，并拿到当前数据对应的Observer实例
  let childOb = observe(value)
  // 对当前属性进行拦截
  Object.defineProperty(data, key, {
    get: function reactiveGetter() {
        // 收集依赖
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          // 新增
          if (Array.isArray(value)) {
              dependArray(value)
          }
        }
        return value
    },
    set: function reactiveSetter(newValue) {
      if (newValue === value) return
      value = newValue
      // 触发依赖，并更新Observer实例
      childOb = observe(newValue)
      dep.notify()
    }
  })
}

function dependArray(array) {
  for (let e of array) {
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}

// Dep 类
class Dep {
  constructor() {
    this.subs = []
  }
  // 依赖收集
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target)
    }
  }
  // 通知更新
  notify() {
    const subs = [...this.subs]
    subs.forEach((s) => s.update())
  }
  // 添加订阅
  addSub(sub) {
    this.subs.push(sub)
  }
}

// 全局变量 Dep.target
Dep.target = null

// 用于暂存 Dep.target 指向的栈
const targetStack = []

// 入栈
function pushTarget (_target) {
    targetStack.push(Dep.target)	// 保存当前 Dep.target
    Dep.target = _target
}
        
// 出栈
function popTarget () {
    Dep.target = targetStack.pop()
}

// Watcher 类
class Watcher {
  constructor(data, expression, cb) {
      this.data = data;	    // 要实现响应式的对象
      this.expression = expression;	// 依赖属性的访问路径
      this.cb = cb;	    // 依赖的回调
      this.value = this.get() // 访问目标属性以触发getter从而发起依赖收集流程
  }
  // 访问当前实例依赖的属性，并将全局变量指向自身
  get() {
    pushTarget(this)
    const value = parsePath(this.data, this.expression)
    popTarget()
    return value
  }
  // 收到更新通知后，进行更新，并触发依赖回调
  update() {
    const oldValue = this.value
    this.value = parsePath(this.data, this.expression)
    this.cb.call(this.data, this.value, oldValue)
  }
}

// 工具函数，用于根据指定访问路径，取出某一对象下的指定属性
function parsePath(obj, expression) {
  const segments = expression.split('.')
  for (let key of segments) {
    if (!obj) return
    obj = obj[key]
  }
  return obj
}