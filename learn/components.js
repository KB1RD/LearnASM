// The path listing
Vue.component('path-breadcrumb', {
    props: ['page_controller'],
    template: `
 <ul class="breadcrumb" v-if="page_controller.current_page">
  <li class="breadcrumb-item"><a href="?">Home</a></li>
  <li class="breadcrumb-item active" v-for="(part, i) in page_controller.current_page.path">{{page_controller.find_page_with_path(page_controller.pages, page_controller.current_page.path.slice(0,i+1)).title}}</li>
</ul>
`});
// Next/back buttons
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

// One element in the table of contents that may or may not have children
// For use by the table-of-contents component only
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
// The actual table of contents
Vue.component('table-of-contents', {
  props: ['page_controller'],
  template: `
<div class="toc">
    <h3>Table of Contents</h3>
    <toc-elem v-for="next in page_controller.pages" :key="next.path.join('/')" :page="next" :active_path="page_controller.current_page ? page_controller.current_page.path : undefined"></toc-elem>
    <br/>
</div>
`});

// A practice problem container that quizzes the user based on question components.
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

// -------------------------------------------------------------------------- //

// Questions for the practice problem container
global.qna = {};

// A "problem" used by the problem container to alert the user that they're done
global.qna.all_done = {
    template: `
    <div>
      <h2>Nice Job!</h2>
      <h5>You're all done!</h5>
    </div>
`
};

global.qna.mov_imm = {
    props: ['valid', 'display_incorrect_answer'],
    data: function() { return {
        dst: "", 
        src: "",
        current: {
            num: Math.ceil(Math.random()*10), 
            reg: "r"+Math.floor(Math.random()*7)
        },
        update: function() {
            this.valid = (this.dst == this.current.reg) 
                      && (this.src == "#"+this.current.num);
            
            this.$emit('update:valid', this.valid);
        }
    };},
    watch: {
        dst: function() { this.update(); },
        src: function() { this.update(); }
    },
    template: `
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
`
};

global.qna.mov_r2r = {
    props: ['valid', 'display_incorrect_answer'],
    data: function() { return {
        dst: "", 
        src: "",
        current: {
            rd: "r"+Math.floor(Math.random()*7), 
            rs: "r"+Math.floor(Math.random()*7)
        },
        update: function() {
            this.valid = (this.dst == this.current.rd) 
                      && (this.src == this.current.rs);
            
            this.$emit('update:valid', this.valid);
        }
    };},
    watch: {
        dst: function() { this.update(); },
        src: function() { this.update(); }
    },
    template: `
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
`
};

global.qna.bitwise_not = {
    props: ['valid', 'display_incorrect_answer'],
    data: function() { return {
        ans: "",
        current: {
            val: Math.floor(Math.random()*64)
        },
        update: function() {
            this.valid = this.ans == ("000000" + (+this.current.val ^ 0x3f).toString(2)).slice(-6);
            this.$emit('update:valid', this.valid);
        }
    };},
    watch: {
        ans: function() { this.update(); }
    },
    template: `
<div>
  <b>
    <span>NOT {{("000000" + (+current.val).toString(2)).slice(-6)}} = </span>
    <input class="form-control col-form-label-sm inline-input" v-model="ans" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <div v-if="!valid && display_incorrect_answer">
        <span class="text-danger">The correct answer is "NOT {{("000000" + (+current.val).toString(2)).slice(-6)}} = {{("000000" + (+current.val ^ 0x3f).toString(2)).slice(-6)}}"</span>
    </div>
  </b>
</div>
`
};

global.qna.bitwise_and = {
    props: ['valid', 'display_incorrect_answer'],
    data: function() { return {
        ans: "",
        current: {
            aval: Math.floor(Math.random()*64),
            bval: Math.floor(Math.random()*64)
        },
        update: function() {
            this.valid = this.ans == ("000000" + (+this.current.aval & this.current.bval).toString(2)).slice(-6);
            this.$emit('update:valid', this.valid);
        }
    };},
    watch: {
        ans: function() { this.update(); }
    },
    template: `
<div>
  <b>
    <span>{{("000000" + (+current.aval).toString(2)).slice(-6)}} AND <br/>{{("000000" + (+current.bval).toString(2)).slice(-6)}} = </span>
    <input class="form-control col-form-label-sm inline-input" v-model="ans" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <div v-if="!valid && display_incorrect_answer">
        <span class="text-danger">The correct answer is "{{("000000" + (+current.aval).toString(2)).slice(-6)}} AND {{("000000" + (+current.bval).toString(2)).slice(-6)}} = {{("000000" + (+current.aval & current.bval).toString(2)).slice(-6)}}"</span>
    </div>
  </b>
</div>
`
};

global.qna.bitwise_or = {
    props: ['valid', 'display_incorrect_answer'],
    data: function() { return {
        ans: "",
        current: {
            aval: Math.floor(Math.random()*64),
            bval: Math.floor(Math.random()*64)
        },
        update: function() {
            this.valid = this.ans == ("000000" + (+this.current.aval | this.current.bval).toString(2)).slice(-6);
            this.$emit('update:valid', this.valid);
        }
    };},
    watch: {
        ans: function() { this.update(); }
    },
    template: `
<div>
  <b>
    <span>{{("000000" + (+current.aval).toString(2)).slice(-6)}} OR <br/>{{("000000" + (+current.bval).toString(2)).slice(-6)}} = </span>
    <input class="form-control col-form-label-sm inline-input" v-model="ans" :class="!valid && display_incorrect_answer ? 'is-invalid' : ''"></input>
    <div v-if="!valid && display_incorrect_answer">
        <span class="text-danger">The correct answer is "{{("000000" + (+current.aval).toString(2)).slice(-6)}} OR {{("000000" + (+current.bval).toString(2)).slice(-6)}} = {{("000000" + (+current.aval | current.bval).toString(2)).slice(-6)}}"</span>
    </div>
  </b>
</div>
`
};
