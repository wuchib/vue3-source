import { ReactiveEffect } from './effect'

/**
 * 依赖项
 */
interface Dep {
  // 订阅者链表的头节点 head
  subs: Link | undefined
  // 订阅者链表的尾节点 tail
  subsTail: Link | undefined
}

interface Sub {
  // 订阅者
  deps: Link | undefined
  // 订阅者链表的尾节点 tail
  depsTail: Link | undefined
}

export interface Link {
  // 订阅者
  sub: Sub
  // 上一个订阅者节点
  nextSub: Link | undefined
  // 下一个订阅者节点
  preSub: Link | undefined

  // 依赖项
  dep: Dep
  // 下一个依赖项节点
  nextDep: Dep | undefined
}

export function link(dep, sub) {
  // 尝试复用链表节点
  /**
   * 分两种情况：
   * 如果头节点有，尾节点没有，那么长史复用头节点
   * 如果头尾节点都有，尾节点还有 nextDep，尝试复用 nextDep
   */
  const currentDep = sub.depsTail
  const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep
  if(nextDep && nextDep.dep === dep) {
    sub.depsTail = nextDep
    console.log('复用链表节点', dep);
    return
  }

  // 如果 activeSub 有，那就保存起来，等我更新的时候，触发
  const newLink: Link = {
    sub,
    nextSub: undefined,
    preSub: undefined,

    dep,
    nextDep: undefined,
  }

  // 将链表节点和 dep 建立关联关系
  /**
   * 关联链表关系，分两种情况
   * 1. 尾节点有，那就往尾节点后面加
   * 2. 如果尾节点没有，则表示第一次关联，那就往头节点加，头尾相同
   */
  if (dep.subsTail) {
    dep.subsTail.nextSub = newLink
    newLink.preSub = dep.subsTail
    dep.subsTail = newLink
  } else {
    dep.subs = newLink
    dep.subsTail = newLink
  }


  // 将链表节点和 sub 建立关联关系
  if (sub.depsTail) {
    sub.depsTail.nextDep = newLink
    sub.depsTail = newLink
  } else {
    sub.deps = newLink
    sub.depsTail = newLink
  }
}

export function propagate(subs) {
  let link = subs
  let queuedEffect = []
  while (link) {
    queuedEffect.push(link.sub)
    link = link.nextSub
  }
  queuedEffect.forEach(effect => effect.notify())
}
