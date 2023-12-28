import { parsePath, isObject } from "./utils";
import { pushTarget, popTarget } from "./Dep";

// Watcher 类
export default class Watcher {
  // 此时第二个参数可能为依赖属性的路径字符串，也可能为一个渲染函数
  constructor(data, expOrFn, cb) {
    this.deps = []; // 上次取值时，已经收集过该watcher的dep实例
    this.depIds = new Set(); // 上次取值时，已经收集过该watcher的dep实例的id集合
    this.newDeps = []; // 本次取值时，需要收集该watcher的dep实例
    this.newDepIds = new Set(); // 本次取值时，需要收集该watcher的dep实例的id集合

    this.data = data; // 要实现响应式的对象
    if (typeof expOrFn === "function") {
      // 传入的是一个渲染函数
      this.getter = expOrFn;
    } else {
      // 传入的是依赖属性的访问路径，通过工具函数处理，得到一个取值函数
      this.getter = parsePath(expOrFn);
    }
    this.cb = cb; // 依赖的回调
    this.value = this.get(); // 访问目标属性以触发getter从而发起依赖收集流程
  }

  // 访问当前实例依赖的属性，并将自身加入响应式对象的依赖中
  get() {
    pushTarget(this);
    // 注意，当 getter 为渲染函数时，是没有返回值的，即 value 为 undefined
    const value = this.getter.call(this.data, this.data);
    popTarget();
    this.clearUpDeps();
    return value;
  }

  // 收到更新通知后，进行更新，并触发依赖回调
  update() {
    // 原本的逻辑是，先将旧值存下来，然后通过工具函数去取新值，然后再触发回调函数。
    // const oldValue = this.value;
    // this.value = parsePath(this.data, this.expression);
    // this.cb.call(this.data, this.value, oldValue);

    // 现在需要先通过 get 方法获取新值，且这个值可能是 undefined
    const newValue = this.get();
    /* 
          只有当:
            1. 新值与当前 watcher 实例中存放的旧值 this.value 不等时
            2. 该值为对象类型时
          才触发回调函数。
  
          当传入的是一个渲染函数时，newValue 是 undefined，this.value 也是 undefined，自然不会进入下面的逻辑
  
          那么对于渲染 watcher，在哪里触发更新呢？
  
          实际上，在前面重新执行 get 方法的时候，就会通过 this.getter.call 完成渲染函数的调用！
      */
    if (newValue !== this.value || isObject(newValue)) {
      const oldValue = this.value;
      this.value = newValue;
      this.cb.call(this.data, this.value, oldValue);
    }
  }

  // 决定是否订阅某一dep实例
  addDep(dep) {
    const id = dep.id;
    // 本次取值过程中，处理过当前dep实例，则进入
    if (!this.newDepIds.has(id)) {
      this.newDeps.push(dep);
      this.newDepIds.add(id);
      // 若上次取值时，没有订阅过该dep实例，则订阅该dep实例
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  // 交换deps、depIds与newDeps、newDepIds的内容，并清空newDeps、newDepIds
  cleanUpDeps() {
    // 交换depIds和newDepIds
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    // 清空newDepIds
    this.newDepIds.clear();
    // 交换deps和newDeps
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    // 清空newDeps
    this.newDeps.length = 0;
  }
}
