<template>
<div>
  <h5>Task: Find the output of this code:</h5>
  <div style="padding-left: 20px;"><LearnInlineCode>
mov r0, #{{current.num1}}
sub {{current.regd}}, r0, #{{current.num2}}
halt
  </LearnInlineCode></div>
  <b>
    <span>After this is run, {{current.regd}} will be</span>
    <input class="form-control col-form-label-sm inline-input-sm" style="max-width: 75px;" v-model="ans" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
  </b>
  <div v-if="!valid && display_incorrect_answer">
      <span class="text-danger">The correct answer is {{this.current.num2>this.current.num1 ? 65536+this.current.num1-this.current.num2 : this.current.num1-this.current.num2}}</span>
  </div>
</div>
</template>

<script>
import LearnInlineCode from '@/components/UI/LearnInlineCode.vue'

export default {
  name: 'PracticeSubNormal',
  
  props: ['valid', 'display_incorrect_answer'],
  
  data: function() { return {
    ans: "",
    current: {
      num1: Math.ceil(Math.random()*5),
      num2: Math.ceil(Math.random()*5),
      regd: "r"+Math.floor(Math.random()*7)
    },
    update: function() {
      var ans = this.current.num1-this.current.num2;
      if(ans < 0) {
        ans += 65536
      }
      
      this.$emit('update:valid', (this.ans == ans)
                              || (this.ans == '#'+ans));
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
