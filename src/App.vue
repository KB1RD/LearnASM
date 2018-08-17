<template>
  <div id="app" class="theme-light">
    <AlertManager :alert_manager="alert_manager"></AlertManager>
    <OptionsModal/>
    <IntroModal/>
    
    <router-view class="view" :alert_manager="alert_manager" :version="version" :navbar_links="main_navbar" :home_url="nav_home"></router-view>
  </div>
</template>

<script>
import '@/js/globals.js'
import {options, loadOptions, saveOptions, CookieManager, FileManager} from '@/js/io.js'
import AlertManager from '@/components/UI/AlertManager.vue'
import OptionsModal from '@/components/UI/OptionsModal.vue'
import IntroModal from '@/components/UI/IntroModal.vue'

loadOptions()

var updateDebug = function() {
  if(options.enable_debug) {
    window.debug = function(text) { console.log(text); }
  } else {
    window.debug = function() {}
  }
}
updateDebug()

if(!options.no_welcome) {
  options.no_welcome = false
}

window.alert_manager = AlertManager.create_manager()

export default {
  name: 'LearnASM',
  
  components: {
    AlertManager, OptionsModal, IntroModal
  },
  
  data () {  return {
    version: Object.freeze('0.2.0b'),
    
    nav_home: '/',
    main_navbar: [
      {name: 'Learn', url: '/learn/'},
      {name: 'TRM', url: '/trm/'}
    ],
    
    alert_manager: window.alert_manager,
    options: options
  } },
  
  watch: {
    'options.enable_debug': updateDebug
  },
  
  beforeDestroy() {
    saveOptions()
  }
};
</script>

<style lang="scss">
@import'../node_modules/bootstrap/dist/css/bootstrap.css';
@import'./css/theme.min.css';

.navbar {
  z-index: 10;
}
@media (min-width: 992px) {
  .navbar {
    height: 50px;
  }
}

nav-item > .button,.btn-group {
  margin-left:  5px;
  margin-right: 5px;
}

// Style bugfixes

a, button {
  outline: none;
}

// These colors are from Bootswatch
$white:    #fff !default;
$gray-100: #f8f9fa !default;
$gray-200: #F8F5F0 !default;
$gray-300: #DFD7CA !default;
$gray-400: #ced4da !default;
$gray-500: #98978B !default;
$gray-600: #8E8C84 !default;
$gray-700: #495057 !default;
$gray-800: #3E3F3A !default;
$gray-900: #212529 !default;
$black:    #000 !default;

.alert {
  .close {
    color: $gray-100;
    outline: none;
  }
  .close:hover {
    color: $gray-300;
  }
  .close:focus {
    color: $gray-300;
  }
}
</style>
