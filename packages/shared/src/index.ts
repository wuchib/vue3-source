export function isObject(value: any): value is Record<any, any> {
  return value !== null && typeof value === 'object'
}

/**
 * 判断值有没有发生过变化，如果发生了变化，返回 true
 * @param newValue 新值
 * @param oldValue 老值
 * @returns 
 */
export function hasChanged(newValue, oldValue) {
  return !Object.is(newValue, oldValue)
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function'
} 