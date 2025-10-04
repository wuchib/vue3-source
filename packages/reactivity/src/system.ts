export interface Link {
  sub: Function
  // 上一个节点
  nextSub: Link | undefined
  // 下一个节点
  preSub: Link | undefined
}


export function link(dep, sub) {
  // 如果 activeSub 有，那就保存起来，等我更新的时候，触发
  const newLink: Link = {
    sub,
    nextSub: undefined,
    preSub: undefined,
  }
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
}


export function propagate(subs) {
  let link = subs
  let queuedEffect = []
  while (link) {
    queuedEffect.push(link.sub)
    link = link.nextSub
  }
  queuedEffect.forEach(effect => effect())
}
