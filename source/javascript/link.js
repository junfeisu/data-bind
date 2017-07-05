import option from './option'
import render from './render'
import util from './utils'

class link {
  constructor (sjf) {
    this.sjf = sjf
    let hasUnlinkNode = this.sjf._unlinkNodes.length
    if (hasUnlinkNode) {
      let extractReg = /sjf-[a-z]+=\"[^"]+\"|\{\{.+\}\}/g
      this.sjf._unlinkNodes.map(value => {
        let directives = []
        if (value.nodeType === 'textNode') {
          directives = value.check.data.match(extractReg)
        } else {
          directives = value.check.cloneNode().outerHTML.match(extractReg)
        }
        if (directives.length > 1) {
          let withNameDirectives = directives.map(directive => this.addDirectiveName(directive))
          withNameDirectives = util.sortExexuteQueue('name', withNameDirectives)
          withNameDirectives.map(directive => {
            this.extractDirective(directive.value, value)
          })
        } else {
          directives.map(directive => {
            this.extractDirective(directive, value)
          })
        }
      })
      this._unlinkNodes = []
      new render(this.sjf)
    }
  }

  addDirectiveName (directive) {
    let slices = directive.split('=')
    if (slices.length === 0) {
      return {
        name: 'sjf-text',
        value: directive
      }
    } else {
      return {
        name: slices[0],
        value: directive
      }
    }
  }

  // 提取指令
  extractDirective (directive, node) {
    let slices = directive.split('=')
    // 如果是事件就直接通过addEventListener进行绑定
    if (option.sjfEvents.indexOf(slices[0]) >= 0) {
      let eventMes = {
        type: 'event',
        node: node,
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
