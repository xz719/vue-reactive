import Dep from "./Dep";
import observe from "./observe";

// 数据劫持
export default function defineReactive(data, key, value = data[key]) {
  const dep = new Dep();
  // 对当前属性的下一层属性进行劫持，并拿到当前数据对应的Observer实例
  let childOb = observe(value);
  // 对当前属性进行拦截
  Object.defineProperty(data, key, {
    get: function reactiveGetter() {
      // 收集依赖
      dep.depend();
      if (childOb) {
        childOb.dep.depend();
        // 新增
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value;
    },
    set: function reactiveSetter(newValue) {
      if (newValue === value) return;
      value = newValue;
      // 触发依赖，并更新Observer实例
      childOb = observe(newValue);
      dep.notify();
    },
  });
}

function dependArray(array) {
  for (let e of array) {
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}
