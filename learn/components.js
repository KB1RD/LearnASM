Vue.component('path-breadcrumb', {
    props: ['page_controller'],
    template: `
 <ul class="breadcrumb" v-if="page_controller.current_page">
  <li class="breadcrumb-item"><a href="?">Home</a></li>
  <li class="breadcrumb-item active" v-for="(part, i) in page_controller.current_page.path">{{page_controller.find_page_with_path(page_controller.pages, page_controller.current_page.path.slice(0,i+1)).title}}</li>
</ul>
`});
Vue.component('page-control-btns', {
    props: ['page_controller'],
    template: `
<center><div style="max-width: 500px; display: block; height: 50px;" v-if="page_controller.current_page">
  <div class="float-left" style="display: inline;">
    <button type="button" class="btn btn-primary" v-bind:class="page_controller.last_page ? '' : 'disabled'" v-on:click="page_controller.last_page ? page_controller.last_page.goto() : undefined">&laquo; Back</button>
  </div>
  <div class="float-right" style="display: inline;">
    <button type="button" class="btn btn-primary" v-bind:class="page_controller.next_page ? '' : 'disabled'" v-on:click="page_controller.next_page ? page_controller.next_page.goto() : undefined">Next &raquo;</button>
  </div>
</div></center>
`});
Vue.component('toc-elem', {
    props: ['page', 'active_path'],
    template: `
<li>
  <b v-if="active_path == page.path && !page.children"><a :href="'?'+page.path.join('/')">{{page.title}}</a></b>
  <a v-if="active_path != page.path && !page.children" :href="'?'+page.path.join('/')">{{page.title}}</a>
  <h5 v-if="page.children">{{page.title}}</h5>
  <ol v-if="page.children">
    <toc-elem v-for="next in page.children" :key="next.path.join('/')" :page="next" :active_path="active_path"></toc-elem>
  </ol>
</li>
`});
Vue.component('table-of-contents', {
  props: ['page_controller'],
  template: `
<div class="toc">
    <h3>Table of Contents</h3>
    <toc-elem v-for="next in page_controller.pages" :key="next.path.join('/')" :page="next" :active_path="page_controller.current_page ? page_controller.current_page.path : undefined"></toc-elem>
    <br/>
</div>
`});

Vue.component('custom-card', {
    props: ['title', 'subtitle'],
    template: `
<center><div class="card learn-card">
  <div class="card-body">
    <h4 class="card-title">{{title}}</h4>
    <h6 class="card-subtitle mb-2 text-muted">{{subtitle}}</h6>
    <p class="card-text"><slot></slot></p>
  </div>
</div></center>
`});

Vue.component('practice', {
    props: ['question_count', 'question_controllers'],
    data: function() { return {
        answered: 0,
        question_id: 0, // Used to force component re-inits
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
                    this.active_controller = global.qna.all_done;
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
    };},
    template: `
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
`});

Vue.component('custom-checkbox', {
    props: {
        'value': {},
        'checked': {},
        'unchecked': {},
        'bsclass': {default: "primary"}
    },
    template: `
<div class="form-group">
  <div class="btn-group">
    <label class="btn" v-bind:class="'btn-'+bsclass" v-on:click="$emit('input', !value)">
      <span v-if="value">{{checked}}</span>
      <span v-if="!value">{{unchecked}}</span>
    </label>
    <label class="btn disabled" v-bind:class="'btn-'+bsclass">
      <slot></slot>
    </label>
  </div>
</div>
`
});

Vue.component('combobox', {
    props: ['value'],
    template: `
<div class="form-group">
  <select class="custom-select" v-bind:value="value" v-on:click="$emit('input', value)">
    <slot></slot>
  </select>
</div>
`
});
