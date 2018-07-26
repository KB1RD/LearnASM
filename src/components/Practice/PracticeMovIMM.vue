<template>
<div>
  <h5>Task: Move the number {{current.num}} into {{current.reg}}:</h5>
  <b>
    <span>mov</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="dst" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''">
    <span>,</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="src" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <div v-if="!valid && display_incorrect_answer">
        <span class="text-danger">The correct answer is "mov {{current.reg}}, #{{current.num}}"</span>
    </div>
  </b>
</div>
</template>

<script>
export default {
  name: 'PracticeMovIMM',
  
  props: ['valid', 'display_incorrect_answer'],
  
  data: function() { return {
    dst: "", 
    src: "",
    current: {
      num: Math.ceil(Math.random()*10), 
      reg: "r"+Math.floor(Math.random()*7)
    },
    update: function() {
      
      this.$emit('update:valid', (this.dst == this.current.reg) 
                              && (this.src == "#"+this.current.num));
    }
  };},
  
  watch: {
    dst: function() { this.update(); },
    src: function() { this.update(); }
  }
}
</script>

<style scoped>
</style>
