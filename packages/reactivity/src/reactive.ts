import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

export function reactive(target) {
  return createReactiveObject(target)
}

/**
 * 保存 target 响应式对象之间的关联关系
 * target => proxy
 */
const reactiveMap = new WeakMap()

/**
 * 保存所有使用 reactive 创建出来的响应式对象
 */
const reactiveSet = new WeakSet()

function createReactiveObject(target) {
  /**
   * reactive 必须接收一个对象
   */
  if (!isObject(target)) {
    /**
     * 不是对象就原样返回
     */
    return target
  }

  /**
   * 如果这个 target 已经是响应式对象了，就直接返回
   */
  if (reactiveSet.has(target)) {
    return target
  }

  const existingProxy = reactiveMap.get(target)

  if (existingProxy) {
    /**
     * 如果这个 target 之前使用 reactive 创建过响应式对象，就直接返回之前的响应式对象
     */
    return existingProxy
  }

  const proxy = new Proxy(target, mutableHandlers)

  /**
   * 保存 target 和 proxy 之间的关联关系
   * target => proxy
   */
  reactiveMap.set(target, proxy)

  // 保存响应式对象到 reactiveSet
  reactiveSet.add(proxy)

  return proxy
}



/**
 * 判断 target 是否是响应式对象，只要看 reactiveSet 里面有没有
 * @param target
 * @returns
 */
export function isReactive(target) {
  return reactiveSet.has(target)
}
