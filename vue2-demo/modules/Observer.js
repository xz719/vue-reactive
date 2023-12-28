import defineReactive from "./defineReactive";
import { proxyPrototype } from "./array";
import Dep from "./Dep";
import { def } from "./utils";
import observe from "./observe";

// Observer 类
export class Observer {
  constructor(value) {
    this.value = value;
    // 声明该数据对应的 dep 实例
    this.dep = new Dep();
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      // 如果是数组类型数据的话就特殊处理
      // 代理原型
      Object.setPrototypeOf(value, proxyPrototype);
      // 监听数组内容
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  // 遍历下一层属性，执行defineReactive
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }

  observeArray(arr) {
    // 对数组内部的对象类型数据进行监听
    arr.forEach((i) => observe(i));
  }
}
