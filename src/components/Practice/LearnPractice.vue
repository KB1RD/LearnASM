<template>
<center><div class="card mb-3 learn-card">
  <h3 class="card-header">Practice</h3>
  <div class="card-body">
    <component :is="active_controller" :valid.sync="valid" :display_incorrect_answer="display_incorrect_answer" :key="question_id"></component>
  </div>
  <div class="card-footer">
    <div class="row" style="width: 100%; height: 100%;">
      <div class="col-10" style="display: table; width: 100%; height: 100%;">
        <div style="display: table-cell; vertical-align: middle;"><div class="progress">
          <div class="progress-bar progress-bar-striped bg-success" :style="'width: '+answered/parseInt(question_count)*100+'%'"></div>
        </div></div>
      </div>
      <button class="btn col-2" v-on:click="done()" :class="answered == question_count ? 'btn-warning' : 'btn-success'">{{answered >= question_count-1 ? (answered == question_count ? 'Reset' : 'Done') : 'Next'}}</button>
    </div>
  </div>
</div></center>
</template>

<script>
var all_done = {
    template: `
    <div>
      <h2>Nice Job!</h2>
      <h5>You're all done!</h5>
    </div>
`
};

export default {
  name: 'LearnPractice',
  
  props: ['question_count', 'question_controllers'],
  
  data () { return {
    answered: 0,
    question_id: 0, // <-- Used to force component re-inits
    active_controller: this._props.question_controllers[Math.floor(Math.random()*this._props.question_controllers.length)],
    display_incorrect_answer: false,
    done: function() {
      // Check if it's valid or we're on the "done" screen
      if(this.valid || this.answered == this.question_count) {
        this.question_id++;
        this.display_incorrect_answer = false;
        
        if(this.answered == this.question_count) {
          // Reset if we're on the done screen
          this.answered = 0;
          this.active_controller = this._props.question_controllers[
                    Math.floor(Math.random()
                        *this._props.question_controllers.length)];
        } else if (this.answered == this.question_count-1) {
          // Switch to the done screen if we're on the last question
          this.answered++;
          this.active_controller = all_done;
        } else {
          // ...or move to the next question
          this.answered++;
          this.active_controller = this._props.question_controllers[
                    Math.floor(Math.random()
                        *this._props.question_controllers.length)];
        }
        
        // Reset
        this.valid = false;
        this.$emit('update:valid', false);
      } else {
        // Oops! Incorrect answer
        this.answered = 0;
        this.display_incorrect_answer = true;
      }
    },
    valid: false
  } }
}
</script>

<style>
.learn-card {
  max-width: 30rem;
  margin: 5px;
  text-align: left;
}

.inline-input {
  max-width: 150px;
  display: inline;
  margin-left: 5px;
  margin-right: 2px;
}

.inline-input-sm {
  max-width: 50px;
  display: inline;
  margin-left: 5px;
  margin-right: 2px;
}
</style>
