import { endTrack, Link, startTrack, Sub } from './system'

// 用来保存当前正在执行的effect函数
export let activeSub

export function setActiveSub(sub) {
  activeSub = sub
}

export class ReactiveEffect implements Sub {
  /**
   * 依赖项链表的头节点
   */
  deps: Link | undefined

  /**
   * 依赖项链表的尾节点
   */
  depsTail: Link | undefined

  tracking = false

  dirty = false

  constructor(public fn) {}

  run() {
    // 先把上一个 activeSub 保存起来, 用来处理嵌套的逻辑
    const preSub = activeSub
    // 每次执行 fn 之前，把 this 放在 activeSub 上
    setActiveSub(this)
    startTrack(this)
    // this.depsTail = undefined
    try {
      return this.fn()
    } finally {
      endTrack(this)

      // 执行完毕后，恢复之前的 activeSub
      activeSub = preSub
    }
  }

  /**
   * 通知更新的方法，如果依赖的数据发生了变化，就会调用这个方法
   */
  notify() {
    this.scheduler()
  }

  /**
   * 默认调用 run 方法，如果用户传了 scheduler 就调用用户的
   */
  scheduler() {
    this.run()
  }
}

export function effect(fn, options) {
  const e = new ReactiveEffect(fn)

  Object.assign(e, options)

  e.run()

  /**
   * 绑定函数的 this 指向 ReactiveEffect 实例
   */
  const runner = e.run.bind(e)

  /**
   * 把 effect 挂载到 runner 上，这样用户就可以通过 runner.effect 拿到 ReactiveEffect 实例
   */
  runner.effect = e
  return runner
}
