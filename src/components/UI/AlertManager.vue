<template>
<div>
  <div class="overlay overlay-bottom-to-top overlay-alerts">
    <div class="alert alert-dismissible" v-for="(alert, i) in alert_manager.alerts" v-bind:class="['alert-'+alert.type]" style="pointer-events: all;">
      <button type="button" class="close" v-on:click="alert_manager.alerts.splice(i, 1)">&times;</button>
      <h4 class="alert-heading">{{alert.title}}</h4>
      <p class="mb-0">{{alert.body}}</p>
    </div>
  </div>
  
  <div class="modal fade" data-backdrop="static" data-keyboard="false" ref="modal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{alert_manager.dialog.title}}</h5>
        </div>
        <div class="modal-body">
          {{alert_manager.dialog.body}}
        </div>
        <div class="modal-footer">
          <button v-for="btn in alert_manager.dialog.btns" type="button" class="btn" v-bind:class="[btn.type ? 'btn-'+btn.type : 'btn-secondary']" v-on:click="btn_wrapper(btn.cb)">{{btn.text}}</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import 'bootstrap'

var create_manager = function() { return {
  alerts: [],
  
  // Utility functions that add to the alerts list
  html_alert: function(type, title, body) {
    this.alerts.push({title: title, body: body, type: type});
  },
  clear: function() {
    this.alerts.splice(0, this.alerts.length);
  },
  status: function(title, text) {
    this.html_alert('info', title, text);
  },
  error: function(title, text) {
    this.html_alert('danger', title, text);
  },
  
  // The object representing the current dialog. This should only be manipulated
  // through the functions below
  dialog: {title: "", body: "", btns: []},
  // Utility functions to set the dialog
  ask: function(title, body, buttons) {
    this.dialog.title = title;
    this.dialog.body = body;
    this.dialog.btns = buttons;
  },
  // Ask "yes," "cancel"
  ask_y_c: function(title, body, yes_cb, no_cb) {
    this.ask(title, body, [
      {text: 'Cancel', type: 'primary', cb: no_cb},
      {text: 'Yes', cb: yes_cb}
    ]);
  }
} }

export default {
  name: 'AlertManager',
  props: {
    alert_manager: {required: true}
  },
  data () {
    return {
      btn_wrapper (callback) {
        $(this.$refs['modal']).modal('hide');
        callback();
      }
    }
  },
  watch: {
    'alert_manager.dialog': {
      handler() {
        $(this.$refs['modal']).modal('show');
      },
      deep: true
    }
  },
  create_manager: create_manager
}
</script>

<style>
@import '../../css/overlay.css';
</style>
