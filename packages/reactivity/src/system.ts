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
    // console.log('复用链表节点', dep);
    return
  }

  // 如果 activeSub 有，那就保存起来，等我更新的时候，触发
  const newLink: Link = {
    sub,
    nextSub: undefined,
    preSub: undefined,

    dep,
    nextDep,  // 创建新节点的时候，nextDep 指向复用没成功的 dep
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
}/**
 * 开始追踪依赖，将depsTail 尾节点设置为 undefined
 * @param sub
 */
export function startTrack(sub) {
  sub.depsTail = undefined
}
/**
 * 结束追踪，找到需要清理的依赖
 * @param sub
 */
export function endTrack(sub) {
  const depsTail = sub.depsTail

  /**
   * depsTail 有， 并且 depsTail 还有 nextDep ，我们应该把他们的依赖关系清理掉
   */
  if (depsTail) {
    if (depsTail.nextDep) {
      console.log('把他移除', depsTail.nextDep)
      clearTracking(depsTail.nextDep)
      depsTail.nextDep = undefined
    }
  } else if (sub.deps) {
    console.log('从头开始删除', sub.deps)
    clearTracking(sub.deps)
    sub.deps = undefined
  }
}
/**
 * 清理依赖关系
 * @param link
 */


export function clearTracking(link) {
  while (link) {
    const { sub, preSub, nextSub, nextDep, dep } = link

    /**
     * 如果 preSub 有， 那就把 preSub 的 下一个节点，指向当前节点的下一个
     * 如果没有， 那就表示当前节点是头节点， 那就把 dep 的头节点指向当前节点的下一个
     */
    if (preSub) {
      preSub.nextSub = nextSub
      link.nextSub = undefined
    } else {
      dep.subs = nextSub
    }

    /**
     * 如果下一个有，那就把 nextSub 的上一个节点，指向当前节点的上一个节点
     * 如果洗一个没有， 那就表示当前节点是尾节点， 那就把 dep 的尾节点指向当前节点的上一个节点
     */
    if (nextSub) {
      nextSub.preSub = preSub
      link.preSub = undefined
    } else {
      dep.subsTail = preSub
    }

    link.dep = link.sub = undefined

    link.nextDep = undefined

    link = nextDep
  }
}

