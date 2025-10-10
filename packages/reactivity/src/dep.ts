import { activeSub } from './effect';
import { link, Link, propagate } from './system';

/**
 * 绑定 target 的 key 关联的所有的 Dep
 * obj = { a: 0 }
 * target = {
 *    [obj]:{
 *     a: Dep
 *    }
 * }
 */
export const targetMap = new WeakMap()

export class Dep {
  subs: Link;
  subTail: Link;
  constructor() { }
}

export function track(target, key) {
  if (!activeSub) {
    return
  }
  /**
   * 找 depsMap = {
   *  a: Dep,
   *  b: Dep
   * }
   */
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    /**
     * 没有 depsMap, 就是之前没有收集过这个对象的任何 key
     * 那就创建一个新的， 保存 target 和 depsMap 之间的关联关系
     */
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  /**
   * 找 dep => Dep
   */
  let dep = depsMap.get(key)

  if (!dep) {
    /**
     * 第一次收集这个对象，没找到，创建一个新的，并且保存到 depsMap 中
     */
    dep = new Dep()
    depsMap.set(key, dep)
  }

  link(dep, activeSub)

  console.log('dep =>', dep)
}export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    /**
     * depsMap 不存在，说明这个对象没有被收集过任何依赖
     */
    return
  }
  const dep = depsMap.get(key)
  if (!dep) {
    /**
     * dep 不存在，说明这个对象的 key 没有被收集过依赖
     */
    return
  }
  /**
   * 触发更新，通知所有的 sub 重新执行
   */
  propagate(dep.subs)
}

