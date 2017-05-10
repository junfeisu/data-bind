import option from './option'
import render from './render'

class link {
  constructor (sjf) {
    this.sjf = sjf
    let hasUnlinkNode = this.sjf._unlinkNodes.length
    if (hasUnlinkNode) {
      let extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g
      this.sjf._unlinkNodes.forEach((value) => {
        let directives = (value.check.outerHTML).match(extractReg)
        directives.forEach(val => {
          this.extractDirective(val, value)
        })
      })
      this._unlinkNodes = []
      new render(this.sjf)
    }
  }

  // 提取指令
  extractDirective (directive, node) {
    let slices = directive.split('=')
    // 如果是事件就直接通过addEventListener进行绑定
    if (option.sjfEvents.indexOf(slices[0]) >= 0) {
      let eventMes = {
        type: 'event',
        target: node,
        name: slices[0],
        func: slices[1]
      }
      this.sjf._unrenderNodes.push(eventMes)
    } else {
      let expression = slices[0].replace(/[\{\}]/g, '')
      let directiveName = 'sjf-text'
      // 对非{{}}这种表达式进行单独处理
      if (!/\{\{.+\}\}/.test(directive)) {
        expression = slices[1].replace(/\"/g, '')
        directiveName = slices[0]
      }
      this.sjf._unrenderNodes.push({
        type: 'directive',
        node: node, 
        directive: directiveName, 
        expression: expression
      })
    }
  }
}

export default link
