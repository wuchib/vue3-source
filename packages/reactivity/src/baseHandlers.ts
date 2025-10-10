import { hasChanged, isObject } from '@vue/shared';
import { track, trigger } from './dep';
import { isRef } from './ref';
import { reactive } from './reactive';

export const mutableHandlers = {
  get(target, key, receiver) {
    /**
     * 收集依赖，绑定 target 中某一个 key 和 sub 之间的关系
     */
    track(target, key);

    const res = Reflect.get(target, key, receiver);
    if (isRef(res)) {
      /**
       * target = { a: ref(1) }
       *  如果 target.a 是一个 ref, 那么直接把值给它, 不要让它 .value
       */
      return res.value;
    }

    if(isObject(res)) {
      /**
       * 如果 res 是一个对象，那么就继续调用 reactive 让它变成响应式对象
       */
      return reactive(res);
    }

    /**
     * receiver 用来保证 访问器属性的 this 指向代理对象
     */
    return res;
  },
  set(target, key, newValue, receiver) {
    const oldValue = target[key];
    /**
     * 触发更新， set 的时候，通知之前收集的依赖重新执行
     */
    const res = Reflect.set(target, key, newValue, receiver);


    /**
     * 如果旧值是 ref，并且新值不是 ref, 那么就把新值赋值给旧值的 .value
     */
    if (isRef(oldValue) && !isRef(newValue)) {
      /**
       * const a = ref(1)
       * target = { a }
       * target.a = 2
       * 这种情况下，oldValue 就是 ref(1), newValue 是 2
       * 我们要做的就是把 2 赋值给 ref(1) 的 .value
       */
      oldValue.value = newValue;
      return res;
    }

    if (hasChanged(newValue, oldValue)) {
      /**
       * 如果新值和旧值不一样，才触发更新
       */
      trigger(target, key);
    }
    return res;
  },
};
