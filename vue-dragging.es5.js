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

var $dragging = {
  listeners: {},
  $on: function $on(event, func) {
    var events = this.listeners[event];
    if (!events) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(func);
  },
  $once: function $once(event, func) {
    var vm = this;

    function on() {
      vm.$off(event, on);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      func.apply(vm, args);
    }
    this.$on(event, on);
  },
  $off: function $off(event, func) {
    var events = this.listeners[event];
    if (!func || !events) {
      this.listeners[event] = [];
      return;
    }
    this.listeners[event] = this.listeners[event].filter(function (i) {
      return i !== func;
    });
  },
  $emit: function $emit(event, context) {
    var events = this.listeners[event];
    if (events && events.length > 0) {
      events.forEach(function (func) {
        func(context);
      });
    }
  }
};
var _ = {
  on: function on(el, type, fn) {
    el.addEventListener(type, fn);
  },
  off: function off(el, type, fn) {
    el.removeEventListener(type, fn);
  },
  addClass: function addClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.add(cls);
    } else {
      for (var i = 1, len = arguments.length; i < len; i++) {
        el.classList.add(arguments[i]);
      }
    }
  },
  removeClass: function removeClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.remove(cls);
    } else {
      for (var i = 1, len = arguments.length; i < len; i++) {
        el.classList.remove(arguments[i]);
      }
    }
  }
};

function vueDragging (Vue) {
  var isPreVue = Vue.version.split('.')[0] === '1';
  var indexFrom = -1; // touchstart获取的元素
  var touchFinal = null; // touchmove获取的元素
  var dragData = []; // 可拖拽的数组列表
  var elOffsetArea = []; // 可拖拽的元素可视区域坐标

  // 动态添加可移动的img
  var imgMove = document.createElement('img');
  // 跟组件元素id
  var parentTT = document.getElementById('app');
  imgMove.src = '';
  _.addClass(imgMove, 'vue_dnd_img', 'fn-hide');
  parentTT.appendChild(imgMove);

  // 动态设置拖拽元素的定位
  function setDragImage(x, y) {
    imgMove.style.left = x - 40 + 'px';
    imgMove.style.top = y - 40 + 'px';
  }

  function handleTouchStart(e) {
    e.stopPropagation();
    var el = getBlockEl(e.target);
    var drag_key = el.getAttribute('drag_key');
    var item = dragData[drag_key];
    var touch = e.touches[0];
    if (item) {
      indexFrom = drag_key;
      setDragImage(touch.clientX, touch.clientY);
      imgMove.src = item;
      _.removeClass(imgMove, 'fn-hide');
    }
    if (elOffsetArea.length !== dragData.length) {
      var allEl = el.parentNode.childNodes;
      for (var i = 0; i < allEl.length; i++) {
        var v = allEl[i];
        var elOffsetInfo = v.getBoundingClientRect();
        elOffsetArea.push(elOffsetInfo);
      }
    }
  }

  function handleTouchMove(e) {
    e.stopPropagation();
    e.preventDefault();
    touchFinal = e.touches[0];
    setDragImage(touchFinal.clientX, touchFinal.clientY);
  }

  function handleTouchEnd() {
    if (indexFrom > -1 && touchFinal) {
      var indexTo = elOffsetArea.findIndex(function (v) {
        return v.left <= touchFinal.clientX && touchFinal.clientX <= v.left + v.width && v.top <= touchFinal.clientY && touchFinal.clientY <= v.top + v.height;
      });
      if (dragData && dragData.length && indexTo > -1) {
        swapArrayElements(dragData, indexFrom, indexTo);
      }
    }
    touchFinal = null;
    indexFrom = -1;
    imgMove.src = '';
    _.addClass(imgMove, 'fn-hide');
  }

  // 循环获取有绑定group属性的父元素
  function getBlockEl(el) {
    if (!el) return;
    while (el.parentNode) {
      if (el.getAttribute && el.getAttribute('drag_group')) {
        return el;
      } else {
        el = el.parentNode;
      }
    }
  }

  function swapArrayElements(items, indexFrom, indexTo) {
    var item = items[indexTo];
    if (isPreVue) {
      items.$set(indexTo, items[indexFrom]);
      items.$set(indexFrom, item);
    } else {
      Vue.set(items, indexTo, items[indexFrom]);
      Vue.set(items, indexFrom, item);
    }
  }

  // function getOverElementFromTouch(e) {
  //   const touch = e.touches[0]
  //   const el = document.elementFromPoint(touch.clientX, touch.clientY)
  //   return el
  // }

  function addDragItem(el, binding, vnode) {
    var list = binding.value.list;
    var drag_key = isPreVue ? binding.value.key : vnode.key;
    if (list && dragData !== list) {
      dragData = list;
    }
    el.setAttribute('drag_group', binding.value.group);
    el.setAttribute('drag_key', drag_key);

    // _.on(el, 'dragstart', handleDragStart)
    // _.on(el, 'dragenter', handleDragEnter)
    // _.on(el, 'dragover', handleDragOver)
    // _.on(el, 'drag', handleDrag)
    // _.on(el, 'dragleave', handleDragLeave)
    // _.on(el, 'dragend', handleDragEnd)
    // _.on(el, 'drop', handleDrop)

    _.on(el, 'touchstart', handleTouchStart);
    _.on(el, 'touchmove', handleTouchMove);
    _.on(el, 'touchend', handleTouchEnd);
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

    _.off(el, 'touchstart', handleTouchStart);
    _.off(el, 'touchmove', handleTouchMove);
    _.off(el, 'touchend', handleTouchEnd);
  }

  Vue.prototype.$dragging = $dragging;
  if (!isPreVue) {
    Vue.directive('dragging', {
      bind: addDragItem,
      unbind: removeDragItem
    });
  } else {
    Vue.directive('dragging', {
      update: function update(newValue, oldValue) {
        addDragItem(this.el, {
          modifiers: this.modifiers,
          arg: this.arg,
          value: newValue,
          oldValue: oldValue
        });
      },
      unbind: function unbind(newValue, oldValue) {
        removeDragItem(this.el, {
          modifiers: this.modifiers,
          arg: this.arg,
          value: newValue || { group: this.el.getAttribute('drag_group') },
          oldValue: oldValue
        });
      }
    });
  }
}

export default vueDragging;
