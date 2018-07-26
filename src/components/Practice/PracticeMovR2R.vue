<template>
<div>
  <h5>Task: Move {{current.rs}} into {{current.rd}}:</h5>
  <b>
    <span>mov</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="dst" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''">
    <span>,</span>
    <input class="form-control col-form-label-sm inline-input-sm" v-model="src" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <div v-if="!valid && display_incorrect_answer">
        <span class="text-danger">The correct answer is "mov {{current.rd}}, {{current.rs}}"</span>
    </div>
  </b>
</div>
</template>

<script>
export default {
  name: 'PracticeMovR2R',
  
  props: ['valid', 'display_incorrect_answer'],
  
  data: function() { return {
    dst: "", 
    src: "",
    current: {
      rd: "r"+Math.floor(Math.random()*7), 
      rs: "r"+Math.floor(Math.random()*7)
    },
    update: function() {
      this.$emit('update:valid', (this.dst == this.current.rd) 
                              && (this.src == this.current.rs));
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
