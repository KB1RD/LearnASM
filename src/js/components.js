Vue.component('custom-navbar', {
    props: ['version', 'links', 'sticky', 'home'],
    data: function(){ return { window: window }; },
    template: `
<nav class="navbar navbar-expand-lg navbar-dark bg-primary" v-bind:class="sticky ? 'fixed-top' : ''">
  <a class="navbar-brand" :href="home">Learn<b>ASM</b> <span class="badge badge-danger" v-if="version.endsWith('a')">ALPHA</span><span class="badge badge-warning" v-if="version.endsWith('b')">BETA</span></a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#master_navbar"aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  
  <div class="collapse navbar-collapse" id="master_navbar">
    <ul class="navbar-nav mr-auto">
      <!-- NAVBAR BUTTON GROUP -->
      <li class="nav-item" v-for="(link) in links" v-bind:class="window.location.pathname.startsWith(link.url) ? 'active' : ''">
        <a class="nav-link" v-bind:href="link.url">{{link.name}}</a>
      </li>
      <li class="nav-item">
        <slot></slot>
      </li>
    </ul>
    
    <!-- WEBSITE LINK -->
    <a target="_blank" href="https://kb1rd.net/" style="text-decoration:none"><b>KB1RD</b>.net</a>
  </div>
</nav>
`
});

Vue.component('ctrl-button-panel', {
    props: ['system', 'global'],
    template: `
<div style="display: inline;">
  <!-- RUN BUTTON -->
  <div class="btn-group" role="group">
    <button type="button" id="btn-run" class="btn btn-success" v-on:click="system.run_pause_toggle()">{{system.state == system.states.RUNNING ? "Pause" : "Run"}}</button>
  </div>
  <!-- STOP BUTTON -->
  <button type="button" id="btn-stop" class="btn btn-danger" v-on:click="system.stop()" v-bind:disabled="system.state == system.states.STOPPED">Stop</button>
  <!-- SPEED BUTTON GROUP -->
  <div class="btn-group" role="group">
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-info">{{global.speed_name}}</button>
      <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
      <div class="dropdown-menu">
        <button class="dropdown-item" v-for="(speed) in global.speed.speed_names" v-on:click="global.speed.speed_name = speed">{{speed}}</button>
      </div>
    </div>
  </div>
</div>
`
});

Vue.component('ctrl-file-menu', {
    props: ['system', 'options_modal'],
    template: `
<div class="btn-group" role="group">
  <div class="btn-group" role="group">
    <button type="button" class="btn btn-info">File</button>
    <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
    <div class="dropdown-menu">
      <button class="dropdown-item" v-on:click="system.new_file()">New</button>
      <button class="dropdown-item" v-on:click="system.download_code()">Download...</button>
      <button class="dropdown-item" v-on:click="system.upload_code()">Upload...</button>
      <button class="dropdown-item" data-toggle="modal" v-bind:data-target="options_modal">Options...</button>
    </div>
  </div>
</div>
`
});

Vue.component('notification-overlay', {
    props: ['alert_manager'],
    template: `
<div class="overlay overlay-bottom-to-top overlay-alerts">
  <div class="alert alert-dismissible" v-for="(alert, i) in alert_manager.alerts" v-bind:class="['alert-'+alert.type]" style="pointer-events: all;">
    <button type="button" class="close" v-on:click="alert_manager.alerts.splice(i, 1)">&times;</button>
    <h4 class="alert-heading">{{alert.title}}</h4>
    <p class="mb-0">{{alert.body}}</p>
  </div>
</div>
`
});

Vue.component('options-modal', {
    props: ['options'],
    template: `
<div id="options-modal" class="modal fade">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Options</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <input type="checkbox" v-model="options.enable_debug">Enable Console Debug</input>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`
});

Vue.component('dialog-modal', {
    props: ['title', 'body', 'btns'],
    data: function() { return {
        btn_wrapper: function(callback) {
            $(this.$el).modal('hide');
            callback();
        }
    }; },
    created: function() {
        $(this.$el).modal('show');
    },
    template: `
<div class="modal fade" data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{title}}</h5>
      </div>
      <div class="modal-body">
        {{body}}
      </div>
      <div class="modal-footer">
        <button v-for="btn in btns" type="button" class="btn" v-bind:class="[btn.type ? 'btn-'+btn.type : 'btn-secondary']" v-on:click="btn_wrapper(btn.cb)">{{btn.text}}</button>
      </div>
    </div>
  </div>
</div>
`
});


// The system container creates and manages the system. See index.html for a
// usage example
// Note: ALL PROPERTIES ARE CONSTANTS
Vue.component('system-container', {
    props: {sysname: {required: true, type: String}, 
        default_code: {}, cookie: {}},
    data: function() {
        // Check for the name
        var sysname = this["_props"].sysname;
        if(!sysname) {
            throw "Undefined sysname in a system_container";
        }
        
        // Verify that a string is a string and, if not, call an error function
        // that returns a default value
        var verify_string = function(code, error_cb) {
            if(code && typeof code == 'string' || code instanceof String) {
                return code;
            } else {
                return error_cb.call(this);
            }
        };
        
        var code;
        var cookie = this["_props"].cookie;
        // Initialize the system
        if(!system_init(sysname, languages.learnasm)) {
            global.alert_manager.error("Load Error", "Language not found or is corrupt. This is a massive bug.");
            return {};
        } else {
            // Check that the cookie is a string
            cookie = verify_string(cookie, function() { return undefined; });
            
            if(cookie) {
                // Attempt to load the code from a cookie (if present)
                code = cookie_manager.load_json_cookie(cookie);
            }
            
            // Otherwise, default to the default. If that's not present, default
            // to no text at all
            code = verify_string.call(this, code, function() {
                return verify_string(this["_props"].default_code, function() {
                    return "";
                });
            });
            
            // Assign the code
            global.systems[sysname].asm_text = code;
        }
        
        return {system: global.systems[sysname]};
    },
    beforeDestroy: function() {
        var verify_string = function(code, error_cb) {
            if(code && typeof code == 'string' || code instanceof String) {
                return code;
            } else {
                return error_cb.call(this);
            }
        };
    
        cookie = verify_string(this["_props"].cookie, function() { return undefined; });
        
        if(cookie) {
            cookie_manager.save_json_cookie(cookie, this.system.asm_text);
        }
    },
    template: `
<div><slot :system="system"></slot></div>
`});


// Core panels for each part of the simulator. This way, Learn mode can import
// components from the normal simulator as needed

Vue.use(window.VueCodemirror);
Vue.component('core-pane-code', {
    data: function(){ return { 
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
    }; },
    props: ['system','activelines'],
    template: `
<codemirror style="width: 100%; height: 100%; filter: darken(10%);" ref="codemirror_instance" v-model="system.asm_text" :options="system.codemirror_options" v-bind:disabled="system.state != system.states.STOPPED" @input="clear_all_lines(system.asm_text, old_active_lines, $refs)"></codemirror>
`,
    watch: {
        "activelines": function(ln_new) {
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
});

Vue.component('core-pane-mem', {
    template: `
<center class="horiz-center-children" style="height: 100%"><h3>Hexadecimal View Coming Soon!</h3></center>
`
});

Vue.component('core-pane-io', {
    template: `
<center class="horiz-center-children" style="height: 100%"><h3>Console Output Coming Soon!</h3></center>
`
});

Vue.component('core-pane-visual-loading', {
    template: `
<center class="horiz-center-children" style="height: 100%"><div style="width:100%; padding: 10px;">
  <h3>Loading the visual...</h3>
  <div id="loading-progress" class="progress" style="width:100%;">
    <div class="progress-bar progress-bar-striped progress-bar-animated bg-info" style="width: 100%; margin: 0 auto;"></div>
  </div>
</div></center>
`
});