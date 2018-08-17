<template>
<div class="modal fade" style="padding: 10px;">
  <div class="modal-dialog" style="width: 100%; max-width: 750px;" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Welcome to LearnASM!</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-4 border-right">
            <h5>Already know LearnASM?</h5>
            <p>If you already know how to use LearnASM, you can just continue to the simulator.</p><br/><br/>
            <router-link to="/" class="btn btn-primary" data-dismiss="modal">Get Started!</router-link>
          </div>
          <div class="col-4 border-right">
            <h5>Don't know assembly code but want to learn?</h5>
            <p>This is great for new programmers as well as experienced ones looking to learn assembly code.</p>
            <router-link to="/learn" class="btn btn-primary" data-dismiss="modal">Get Started!</router-link>
          </div>
          <div class="col-4">
            <h5>Know assembly code but not LearnASM?</h5>
            <p>If you have experience with assembly code but don't know how to use the simulator, check out the TRM!</p>
            <router-link to="/trm" class="btn btn-primary" data-dismiss="modal">Get Started!</router-link>
          </div>
        </div><br/>
        <input type="checkbox" v-model="options.no_welcome">Don't show this message again</input>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {options} from '@/js/io.js'

export default {
  name: 'IntroModal',
  
  data() { return { options: options } },
  
  mounted () {
    if(!this.options.no_welcome) {
      $(this.$el).modal('show')
    }
    this.options.no_welcome = true
  }
}
</script>

<style scoped>
.border-right {
  padding-right:20px;
  border-right: 1px solid #ccc;
}
</style>
