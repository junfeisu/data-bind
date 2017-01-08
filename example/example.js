var test = new sjfDataBind({
  el: '#test',
  data: {
    lists: ['test', 'hhh']
  },
  methods: {
    add: function () {
      console.log('123')
    }
  }
})

// var abc = new sjfDataBind({
//   el: '#sjf',
//   data: {
//     sjfs: ['123', '234']
//   }
// })

// document.querySelector('#test').lastElementChild.addEventListener('click', function () {
//   console.log('123')
// }, false)