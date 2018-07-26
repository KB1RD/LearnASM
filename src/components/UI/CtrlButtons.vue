<template>
<div style="display: inline;">
  <!-- RUN BUTTON -->
  <div class="btn-group" role="group">
    <button type="button" id="btn-run" class="btn btn-success" v-on:click="system.run_pause_toggle()">{{system.state == system.states.RUNNING ? "Pause" : "Run"}}</button>
  </div>
  <!-- STOP BUTTON -->
  <button type="button" id="btn-stop" class="btn btn-danger" v-on:click="system.stop()" v-bind:disabled="system.state == system.states.STOPPED">Stop</button>
  <!-- SPEED BUTTON GROUP -->
  <div class="btn-group" role="group">
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-info">{{speed_vars.speed_name}}</button>
      <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
      <div class="dropdown-menu">
        <button class="dropdown-item" v-for="(speed) in speed_vars.speed.speed_names" v-on:click="set_speed(speed)">{{speed}}</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'CtrlButtons',
  
  props: ['system', 'speed_vars'],
  
  data () { return {
    set_speed (speed) {
      this.speed_vars.speed.speed_name = speed
      //window.speed_vars = this.speed_vars
    }
  } }
}
</script>

<style scoped>
</style>
