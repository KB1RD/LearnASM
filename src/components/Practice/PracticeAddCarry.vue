<template>
<div>
  <h5>Task: Find the output of this code:</h5>
  <div style="padding-left: 20px;"><LearnInlineCode>
mov r0, #{{current.num1}}
add {{current.regd}}, r0, #{{65536-current.num2}}
halt
  </LearnInlineCode></div>
  <b>
    <span>After this is run, {{current.regd}} will be</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="ans" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
  </b>
  <div v-if="!valid && display_incorrect_answer">
      <span class="text-danger">The correct answer is {{current.num1-current.num2}}</span>
  </div>
</div>
</template>

<script>
import LearnInlineCode from '@/components/UI/LearnInlineCode.vue'

export default {
  name: 'PracticeAddCarry',
  
  props: ['valid', 'display_incorrect_answer'],
  
  data: function() { return {
    ans: "",
    current: {
      num1: Math.ceil(Math.random()*10),
      num2: Math.ceil(Math.random()*5),
      regd: "r"+Math.floor(Math.random()*7)
    },
    update: function() {
      
      this.$emit('update:valid', (this.ans == this.current.num1-this.current.num2)
                              || (this.ans == '#'+(this.current.num1-this.current.num2)));
    }
  };},
  
  watch: {
    ans: function() { this.update(); }
  },
  
  components: { LearnInlineCode }
}
</script>

<style scoped>
</style>
