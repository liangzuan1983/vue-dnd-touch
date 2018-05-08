// class DragData {
//   constructor() {
//     this.data = {}
//   }

//   new(key) {
//     if (!this.data[key]) {
//       this.data[key] = {
//         className: '',
//         List: [],
//         KEY_MAP: {}
//       }
//     }
//     return this.data[key]
//   }

//   get(key) {
//     return this.data[key]
//   }
// }

const $dragging = {
  listeners: {},
  $on(event, func) {
    const events = this.listeners[event]
    if (!events) {
      this.listeners[event] = []
    }
    this.listeners[event].push(func)
  },
  $once(event, func) {
    const vm = this

    function on(...args) {
      vm.$off(event, on)
      func.apply(vm, args)
    }
    this.$on(event, on)
  },
  $off(event, func) {
    const events = this.listeners[event]
    if (!func || !events) {
      this.listeners[event] = []
      return
    }
    this.listeners[event] = this.listeners[event].filter(i => i !== func)
  },
  $emit(event, context) {
    const events = this.listeners[event]
    if (events && events.length > 0) {
      events.forEach(func => {
        func(context)
      })
    }
  }
}
const _ = {
  on(el, type, fn) {
    el.addEventListener(type, fn)
  },
  off(el, type, fn) {
    el.removeEventListener(type, fn)
  },
  addClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.add(cls)
    } else {
      for (let i = 1, len = arguments.length; i < len; i++) {
        el.classList.add(arguments[i])
      }
    }
  },
  removeClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.remove(cls)
    } else {
      for (let i = 1, len = arguments.length; i < len; i++) {
        el.classList.remove(arguments[i])
      }
    }
  }
}

export default function(Vue) {
  const isPreVue = Vue.version.split('.')[0] === '1'
  let indexFrom = -1 // touchstart获取的元素
  let touchFinal = null // touchmove获取的元素
  let dragData = [] // 可拖拽的数组列表
  let elOffsetArea = [] // 可拖拽的元素可视区域坐标

  // 动态添加可移动的img
  let imgMove = document.createElement('img')
  // 跟组件元素id
  let parentTT = document.getElementById('app')
  imgMove.src = ''
  _.addClass(imgMove, 'vue_dnd_img', 'fn-hide')
  parentTT.appendChild(imgMove)

  // 动态设置拖拽元素的定位
  function setDragImage(x, y) {
    imgMove.style.left = (x - 40) + 'px';
    imgMove.style.top = (y - 40) + 'px';
  }

  function handleTouchStart(e) {
    e.stopPropagation();
    const el = getBlockEl(e.target)
    const drag_key = el.getAttribute('drag_key')
    const item = dragData[drag_key]
    const touch = e.touches[0]
    if (item) {
      indexFrom = drag_key
      setDragImage(touch.clientX, touch.clientY)
      imgMove.src = item
      _.removeClass(imgMove, 'fn-hide')
    }
    if (elOffsetArea.length !== dragData.length) {
      let allEl = el.parentNode.childNodes
      for (var i = 0; i <allEl.length; i++) {
        let v = allEl[i]
        let elOffsetInfo = v.getBoundingClientRect()
        elOffsetArea.push(elOffsetInfo)
      }
    }
  }

  function handleTouchMove(e) {
    e.stopPropagation();
    e.preventDefault();
    touchFinal = e.touches[0];
    setDragImage(touchFinal.clientX, touchFinal.clientY)
  }

  function handleTouchEnd() {
    if (indexFrom > -1 && touchFinal) {
      let indexTo = elOffsetArea.findIndex(v => {
        return v.left <= touchFinal.clientX && touchFinal.clientX <= (v.left + v.width) && v.top <= touchFinal.clientY && touchFinal.clientY <= (v.top + v.height)
      })
      if (dragData && dragData.length && indexTo > -1) {
        swapArrayElements(dragData, indexFrom, indexTo)
      }
    }
    touchFinal = null
    indexFrom = -1
    imgMove.src = ''
    _.addClass(imgMove, 'fn-hide')
  }

  // 循环获取有绑定group属性的父元素
  function getBlockEl(el) {
    if (!el) return
    while (el.parentNode) {
      if (el.getAttribute && el.getAttribute('drag_group')) {
        return el
      } else {
        el = el.parentNode
      }
    }
  }

  function swapArrayElements(items, indexFrom, indexTo) {
    let item = items[indexTo]
    if (isPreVue) {
      items.$set(indexTo, items[indexFrom])
      items.$set(indexFrom, item)
    } else {
      Vue.set(items, indexTo, items[indexFrom])
      Vue.set(items, indexFrom, item)
    }
  }

  // function getOverElementFromTouch(e) {
  //   const touch = e.touches[0]
  //   const el = document.elementFromPoint(touch.clientX, touch.clientY)
  //   return el
  // }

  function addDragItem(el, binding, vnode) {
    const list = binding.value.list
    const drag_key = isPreVue ? binding.value.key : vnode.key
    if (list && dragData !== list) {
      dragData = list
    }
    el.setAttribute('drag_group', binding.value.group)
    el.setAttribute('drag_key', drag_key)

    // _.on(el, 'dragstart', handleDragStart)
    // _.on(el, 'dragenter', handleDragEnter)
    // _.on(el, 'dragover', handleDragOver)
    // _.on(el, 'drag', handleDrag)
    // _.on(el, 'dragleave', handleDragLeave)
    // _.on(el, 'dragend', handleDragEnd)
    // _.on(el, 'drop', handleDrop)

    _.on(el, 'touchstart', handleTouchStart)
    _.on(el, 'touchmove', handleTouchMove)
    _.on(el, 'touchend', handleTouchEnd)
  }

  function removeDragItem(el) {
    // const DDD = dragData.new(binding.value.group)
    // const drag_key = isPreVue ? binding.value.key : vnode.key
    // DDD.KEY_MAP[drag_key] = undefined
    // _.off(el, 'dragstart', handleDragStart)
    // _.off(el, 'dragenter', handleDragEnter)
    // _.off(el, 'dragover', handleDragOver)
    // _.off(el, 'drag', handleDrag)
    // _.off(el, 'dragleave', handleDragLeave)
    // _.off(el, 'dragend', handleDragEnd)
    // _.off(el, 'drop', handleDrop)

    _.off(el, 'touchstart', handleTouchStart)
    _.off(el, 'touchmove', handleTouchMove)
    _.off(el, 'touchend', handleTouchEnd)
  }

  Vue.prototype.$dragging = $dragging
  if (!isPreVue) {
    Vue.directive('dragging', {
      bind: addDragItem,
      unbind: removeDragItem
    })
  } else {
    Vue.directive('dragging', {
      update(newValue, oldValue) {
        addDragItem(this.el, {
          modifiers: this.modifiers,
          arg: this.arg,
          value: newValue,
          oldValue: oldValue
        })
      },
      unbind(newValue, oldValue) {
        removeDragItem(this.el, {
          modifiers: this.modifiers,
          arg: this.arg,
          value: newValue || { group: this.el.getAttribute('drag_group') },
          oldValue: oldValue
        })
      }
    })
  }
}
