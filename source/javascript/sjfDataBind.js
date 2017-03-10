import compile from './compile'

class SjfDataBind {
  constructor (param) {
    if (!param.hasOwnProperty('el') || !param.hasOwnProperty('data')) {
      console.error('sjf[error]: There is need `data` and `el` attribute')
      return
    }
    this._el = document.querySelector(param.el)
    this._data = param.data
    this._watchers = []
    this._uncompileNodes = []
    this._unlinkNodes = []
    this._unrenderNodes = []
    for (let method in param.methods) {
      // 强制将定义在methods上的方法直接绑定在SjfDataBind上，并修改这些方法的this指向为SjfDataBind
      if (param.methods.hasOwnProperty(method)) {
        this['_' + method] = param.methods[method].bind(this)
      }
    }
    new compile(this._el, true, this)
  }
}

export default SjfDataBind
