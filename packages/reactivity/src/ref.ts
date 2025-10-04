import { activeSub } from './effect'
import { link, Link, propagate } from './system'

enum ReactiveFlags {
  IS_REF = '__v_isRef',
}

/**
 * RefImpl类
 */
class RefImpl {
  // 保存实际的值
  _value: any;

  // 标识,证明是一个ref
  [ReactiveFlags.IS_REF] = true

  /**
   * 订阅者链表的头节点 head
   */
  subs: Link
  /**
   * 订阅者链表的尾节点 tail
   */
  subsTail: Link

  constructor(value) {
    this._value = value
  }
  get value() {
    // 收集依赖
    if (activeSub) {
      trackRef(this)
    }
    return this._value
  }
  set value(newValue) {
    // 触发更新
    this._value = newValue
    triggerRef(this)
  }
}

export function ref(value) {
  return new RefImpl(value)
}



/**
 *  收集依赖
 */
export function trackRef(dep) {
  if (activeSub) {
    link(dep, activeSub)
  }
}

/**
 * 触发 ref 关联的 effect 重新执行
 */
export function triggerRef(dep) {
  if (dep.subs) {
    propagate(dep.subs)
  }
}

/**
 * 是否是一个ref
 * @param value 传入的值
 * @returns
 */
export function isRef(value): boolean {
  return !!value?.[ReactiveFlags.IS_REF]
}