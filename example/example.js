var test = new SjfDataBind.default({
  el: '#test',
  data: {
    lists: ['test', 'hhh']
  },
  methods: {
    add: function (list) {
      console.log(this)
      this._data.lists.push(list)
    },
    cancel: function () {
      console.log('cancel')
    }
  }
})
