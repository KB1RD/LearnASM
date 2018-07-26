<template>
<codemirror style="width: 100%; height: 100%;" ref="codemirror_instance" v-model="system.asm_text" :options="system.codemirror_options" v-bind:disabled="system.state != system.states.STOPPED" @input="clear_all_lines(system.asm_text, old_active_lines, $refs)"></codemirror>
</template>

<script>
import CodeMirror from 'codemirror'
import VueCodemirror from 'vue-codemirror'
import Vue from 'vue'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/mdn-like.css'

Vue.use(VueCodemirror);

export default {
  name: 'CorePaneEditor',
  
  props: { system: { required: true }, activelines: {required: true } },
  
  components: { },
  
  data() { return { 
    old_active_lines: [],
    // Clears the classes of all lines. Called when text is modified since
    // the line numbers will not be the same. Thus, all text must be
    // cleared to avoid old highlights just hanging out.
    // It's kinda stupid, but what else am I supposed to do!??
    clear_all_lines: function(c_txt, act_lines, $refs) {
      var cm = $refs.codemirror_instance._data.codemirror;
      
      // Don't fluch all lines classes if there are no highlighted lines
      if(act_lines.length != 0) {
        var lines = c_txt.split("\n").length - 1;
        for(var i = 0; i<lines; i++) {
          cm.removeLineClass(i+1, "wrap", "CodeMirror-activeline");
          cm.removeLineClass(i+1, "background", "CodeMirror-activeline-background");
          cm.removeLineClass(i+1, "gutter", "CodeMirror-activeline-gutter");
        }
      }
    }
  } },
  
  watch: {
    activelines (ln_new) {
      var cm = this.$refs.codemirror_instance._data.codemirror;
      var old_active_lines = this._data.old_active_lines;
      var line_count = cm.lineCount();
      
      var lines = old_active_lines.filter(function(elem, index, self) {
        // I have to use array.includes(elem) for ints
        return !(ln_new.includes(elem));
      });
      for(var i = 0; i<lines.length; i++) {
        if(lines[i] < line_count) {
          cm.removeLineClass(lines[i], "wrap", "CodeMirror-activeline");
          cm.removeLineClass(lines[i], "background", "CodeMirror-activeline-background");
          cm.removeLineClass(lines[i], "gutter", "CodeMirror-activeline-gutter");
        }
      }
      
      lines = ln_new.filter(function(elem, index, self) {
        // I have to use array.includes(elem) for ints
        return !(old_active_lines.includes(elem));
      });
      for(var i = 0; i<lines.length; i++) {
        if(lines[i] < line_count) {
          cm.addLineClass(lines[i], "wrap", "CodeMirror-activeline");
          cm.addLineClass(lines[i], "background", "CodeMirror-activeline-background");
          cm.addLineClass(lines[i], "gutter", "CodeMirror-activeline-gutter");
        }
      }
      
      this._data.old_active_lines = make_copy(ln_new);
    }
  }
}
</script>

<style>
.vue-codemirror .CodeMirror {
  height: 100%;
}

.vue-codemirror[disabled] {
  -webkit-filter: grayscale(0.25) brightness(0.925);
  -moz-filter: grayscale(0.25) brightness(0.925);
  -o-filter: grayscale(0.25) brightness(0.925);
  filter: grayscale(0.25) brightness(0.925);
}
</style>
