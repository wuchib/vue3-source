import { hasChanged, isFunction } from '@vue/shared'
import { ReactiveFlags } from './ref'
import { Link, Dependency, Sub, link, startTrack, endTrack } from './system'
import { activeSub, setActiveSub } from './effect'

class ComputedRefImpl implements Dependency, Sub {
  // computed 也是一个 ref
  [ReactiveFlags.IS_REF] = true

  // 保存 fn 的返回值
  _value

  // region 作为 dep,要关联 subs, 等我更新了，我要通知他们重新执行
  /**
   * 订阅者链表的头节点 head
   */
  subs: Link
  /**
   * 订阅者链表的尾节点 tail
   */
  subsTail: Link

  // region 作为 sub, 我要知道那些 dep 被我收集了
  // 订阅者
  deps: Link | undefined
  // 订阅者链表的尾节点 tail
  depsTail: Link | undefined

  tracking = false

  // 计算属性，脏不脏，如果 dirty 为 true，表示计算属性是脏的， get value 的时候需要执行 update
  dirty = true

  constructor(
    public fn, // getter
    private setter, // setter
  ) {}

  get value() {
    if (this.dirty) {
      this.update()
    }

    if (activeSub) {
      link(this, activeSub)
    }
    console.log('computed', this)

    return this._value
  }

  set value(newValue) {
    if (this.setter) {
      this.setter(newValue)
    } else {
      console.warn('computed is readonly')
    }
  }

  update() {
    /**
     * 实现 sub 的功能，为了在执行 fn 期间，收集 fn 执行过程中访问到的响应式数据
     * 建立 dep 和 sub 之间的关系
     */

    const preSub = activeSub

    // 每次执行 fn 之 前，把 this 放在 activeSub 上
    setActiveSub(this)
    startTrack(this)
    try {
      // 拿到旧值
      const oldValue = this._value
      this._value = this.fn()
      // 如果值发生变化，就返回 true，否则返回 false
      return hasChanged(this._value, oldValue)
    } finally {
      endTrack(this)
      // 执行完毕后，恢复之前的 activeSub
      setActiveSub(preSub)
    }

    this._value = this.fn()
  }
}

/**
 * 计算属性
 * @param getterOrOptions 有可能是一个函数，也有可能是一个对象
 * @returns {ComputedRefImpl}
 */
export function computed(getterOrOptions) {
  let getter
  let setter

  if (isFunction(getterOrOptions)) {
    /**
     * const c = computed(() => state.a + 1)
     */
    getter = getterOrOptions
  } else {
    /**
     * const c = computed({
     *  get: () => state.a + 1,
     *  set: (val) => { ... }
     * })
     */
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
