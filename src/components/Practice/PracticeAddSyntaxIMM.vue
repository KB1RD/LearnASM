<template>
<div>
  <h5>Task: Add {{current.regs}} with {{current.num}} and store the result in {{current.regd}}:</h5>
  <b>
    <span>add</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="dst" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''">
    <span>,</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="src0" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <span>,</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="src1" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <div v-if="!valid && display_incorrect_answer">
        <span class="text-danger">The correct answer is "add {{current.regd}}, {{current.regs}}, #{{current.num}}"</span>
    </div>
  </b>
</div>
</template>

<script>
export default {
  name: 'PracticeAddSyntaxIMM',
  
  props: ['valid', 'display_incorrect_answer'],
  
  data: function() { return {
    dst: "", 
    src0: "",
    src1: "",
    current: {
      num: Math.ceil(Math.random()*10), 
      regs: "r"+Math.floor(Math.random()*7),
      regd: "r"+Math.floor(Math.random()*7)
    },
    update: function() {
      
      this.$emit('update:valid', (this.dst == this.current.regd) 
                              && (this.src0 == this.current.regs)
                              && (this.src1 == "#"+this.current.num));
    }
  };},
  
  watch: {
    dst: function() { this.update(); },
    src0: function() { this.update(); },
    src1: function() { this.update(); }
  }
}
</script>

<style scoped>
</style>
