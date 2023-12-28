// Dep 类
// 准备一个全局变量用于为dep实例添加id
let uuid = 0;

// Dep 类
export default class Dep {
  constructor() {
    this.subs = [];
    this.id = uuid++; // 为每一dep实例加上唯一标识id
  }
  // 依赖收集
  depend() {
    if (Dep.target) {
      // 调用Dep.target指向的watcher实例身上的方法，让watcher实例自己决定是否订阅该dep实例
      Dep.target.addDep(this);
    }
  }
  // 通知更新
  notify() {
    const subs = [...this.subs];
    subs.forEach((s) => s.update());
  }
  // 添加订阅
  addSub(sub) {
    this.subs.push(sub);
  }
  // 清除无用订阅
  removeSub(sub) {
    remove(this.subs, sub);
  }
}

// 全局变量 Dep.target
Dep.target = null;

// 用于暂存 Dep.target 指向的栈
const targetStack = [];

// 入栈
export function pushTarget(_target) {
  targetStack.push(Dep.target); // 保存当前 Dep.target
  Dep.target = _target;
}

// 出栈
export function popTarget() {
  Dep.target = targetStack.pop();
}

// 工具函数，用于删除数组中的指定元素
function remove(arr, item) {
  if (!arr.length) return;
  const index = arr.indexOf(item);
  if (index > -1) {
    return arr.splice(index, 1);
  }
}
