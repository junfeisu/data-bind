var test = new SjfDataBind.default({
  el: '#test',
  data: {
    lists: ['test', 'hhh']
  },
  methods: {
    add: function () {
      console.log(this)
      this._data.lists.push('jjj is a sb')
    }
  }
})
