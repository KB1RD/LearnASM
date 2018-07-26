<template>
<div>
  <NavBar :version="version" :links="navbar_links" :sticky="false" :home="home_url">
    <!-- FILE BUTTON GROUP -->
    <CtrlFileMenu :system="system" :options_modal="'#options-modal'"></CtrlFileMenu>
    
    <CtrlButtons :system="system" :speed_vars="speed_vars"></CtrlButtons>
  </NavBar>
  
  <div class="content-container">
    <div style="height: 100%">
      <div ref="lpane" class="split split-horizontal">
        <div ref="apane" class="split content flex-container">
          <CorePaneEditor :system="system" :activelines="system.active_lines"></CorePaneEditor>
        </div>
        <div ref="bpane" class="split content">
          <CorePaneMem></CorePaneMem>
        </div>
      </div>
      <div ref="rpane" class="split split-horizontal">
        <div ref="cpane" class="split content">
          <CorePaneIO></CorePaneIO>
        </div>
        <div ref="dpane" class="split content" style="overflow: auto;">
          <component :is="system.visual_component" :cpu="system.cpu"></component>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {options, CookieManager} from '@/js/io.js'
import {system_init, speed_vars} from '@/js/core.js'
import LearnASM from '@/js/lang/LearnASM.js'

import NavBar from '@/components/UI/NavBar.vue'
import CtrlFileMenu from '@/components/UI/CtrlFileMenu.vue'
import CtrlButtons from '@/components/UI/CtrlButtons.vue'

import CorePaneEditor from '@/components/UI/CorePaneEditor.vue'
import CorePaneMem from '@/components/UI/CorePaneMem.vue'
import CorePaneIO from '@/components/UI/CorePaneIO.vue'

import Split from 'split.js'

var codeCookieName = 'code'

export default {
  name: 'HomeEditor',
  
  props: {
    alert_manager: { required: true },
    version: { required: true },
    navbar_links: { required: true },
    home_url: { required: true }
  },
  
  components: {
    NavBar, CtrlFileMenu, CtrlButtons, CorePaneEditor, CorePaneMem, CorePaneIO
  },
  
  data () { 
    var system = system_init('global', LearnASM, this.alert_manager);
    if(!system) {
      this.alert_manager.error("Load Error", "Language not found or is corrupt. This is a massive bug.");
    }
    
    var code = CookieManager.load_json_cookie(codeCookieName)
    if(code) {
      system.asm_text = code.toString()
    }
    
    var opt_speed_name = options.speed_name
    
    // The speed controller will fall back to the original value (1 Hz) if
    // setting the speed from options fails.
    speed_vars.speed.speed_hz = 1
    speed_vars.speed.speed_name = opt_speed_name
    return {system: system, speed_vars: speed_vars}
  },
  
  mounted () {
    Split([this.$refs.lpane, this.$refs.rpane], {
        direction: 'horizontal',
        gutterSize: 8,
        cursor: 'col-resize'
    });
    Split([this.$refs.apane, this.$refs.bpane], {
        direction: 'vertical',
        sizes: [25, 75],
        gutterSize: 8,
        cursor: 'row-resize'
    }).collapse(1);
    Split([this.$refs.cpane, this.$refs.dpane], {
        direction: 'vertical',
        sizes: [25, 75],
        gutterSize: 8,
        cursor: 'row-resize'
    }).collapse(0);
  },
  
  beforeDestroy() {
    CookieManager.save_json_cookie(codeCookieName, this.system.asm_text)
  }
}
</script>

<style>
@import '../css/vis.css'
</style>

<style scoped>
html, body {
  height: 100%;
}
body {
  box-sizing: border-box;
}
.split {
  -webkit-box-sizing: border-box;
     -moz-box-sizing: border-box;
          box-sizing: border-box;
  overflow-y: hidden;
  overflow-x: hidden;
}
.content {
  box-shadow: inset 0 1px 2px #111;
  /*background-color: #fff;*/
}
.gutter {
  background-color: #00000011;
  background-repeat: no-repeat;
  background-position: 50%;
}
.split.split-horizontal {
  height: 100%;
  float: left;
}

.content-container {
  position: absolute;
  top: 50px;
  left: 0px;
  right: 0px;
  bottom: 0px;
}
</style>
