// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import {saveOptions} from '@/js/io.js'
window.saveOptions = saveOptions

Vue.config.productionTip = false

/* eslint-disable no-new */
window.vm = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

window.addEventListener("beforeunload", function(e){
    window.vm.$destroy()
}, false);
