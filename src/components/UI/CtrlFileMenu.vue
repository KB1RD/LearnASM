<template>
<div class="btn-group" role="group">
  <div class="btn-group" role="group">
    <button type="button" class="btn btn-info">File</button>
    <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
    <div class="dropdown-menu">
      <button class="dropdown-item" v-on:click="system.new_file()">New</button>
      <button class="dropdown-item" v-on:click="system.download_code()">Download...</button>
      <button class="dropdown-item" v-on:click="system.upload_code()">Upload...</button>
      <button class="dropdown-item" data-toggle="modal" v-bind:data-target="options_modal">Options...</button>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'CtrlFileMenu',
  
  props: ['system', 'options_modal']
}
</script>

<style scoped>
</style>
