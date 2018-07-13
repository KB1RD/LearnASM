// Language registry
var languages = {};
// Global Vue.JS data
var global = {};
global.version = Object.freeze("0.1a");

global.main_navbar = [
    {name: 'Learn', url: 'javascript:no_learn_mode()'},
    {name: 'TRM', url: '/LearnASM/trm'}
  ];

function no_learn_mode() {
    $("#no-learn-modal").modal("show");
}

// Why use this? Simple: An "if" statement evaluates 0 to false as well, so
// checking for "safe" numbers doesn't work. It might be a bit over used though...
function isSafe(val) {
    return !(val == undefined || val == null);
}

// Default to a "safe" value
function default_safe(val, def) {
    if(!isSafe(val)) {
        return def;
    }
    return val;
}

// Default each element in an object to a safe value. Not recursive.
function default_object(object, def) {
    Object.keys(def).forEach(function(item, index) {
        object[item] = default_safe(object[item], def[item]);
    });
}

// This makes me sick, but it looks to be the only way to deep copy stuff in JS
function make_copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

// Really sketchy cookie manager
var cookie_manager = {
    cookie_data: {},
    
    set_raw_cookie: function(cname, cvalue) {
        var d = new Date();
        d.setFullYear(d.getFullYear() + 2);
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";" + expires + ";path=/";
    },

    get_raw_cookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = document.cookie;
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return decodeURIComponent(c.substring(name.length, c.length));
            }
        }
        return "";
    },
    
    save_json_cookie: function(name, data) {
        this.set_raw_cookie(name, JSON.stringify(data));
    },
    load_json_cookie: function(name) {
        var cookie;
        try{
            cookie = JSON.parse(this.get_raw_cookie(name));
            if(!cookie) {
                return {};
            }
        } catch(e) {
            console.log("Failed to load cookie",name);
            return {};
        }
        return cookie;
    }
};

global.options = {};
global.load_options = function() {
    global.options = cookie_manager.load_json_cookie("options");
    default_object(global.options, {enable_debug: false});
};
global.save_options = function() {
    cookie_manager.save_json_cookie("options", global.options);
}

var file_manager = {
    download_txt: function(text, fname) {
        if(!window.Blob) {
            return false;
        }
        
        try {
            var link = document.createElement("a");
            
            link.href = URL.createObjectURL(new Blob([text], {type: "text/x-asm"}));
            link.download = fname;
            link.style = "display: none;";
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(e) {
            return false;
        }
        return true;
    },
    
    async_reader: new FileReader(),
    upload_txt: function(callback) {
        if(!(window.File && window.FileReader 
                && window.FileList && window.Blob)) {
            return false;
        }
        
        try {
            var inp = document.createElement("input");
            
            var i = new Date().valueOf().toString();
            
            var reader = this.async_reader;
            
            inp.type = "file";
            inp.multiple = "false";
            inp.style = "display: none;";
            inp.onchange = function() {
                var file = inp.files[0];
                if(file && (file.type == "text/plain" || file.type == "" || file.type == "text/x-asm")) {
                    callback(file, reader);
                } else {
                    callback(undefined, undefined);
                }
            };
            
            document.body.appendChild(inp);
            inp.click();
            document.body.removeChild(inp);
        } catch(e) {
            return false;
        }
        return true;
    }
};

var make_speed_controller = function(sp_list, on_speed_change) { 
    var speeds = Object.freeze(sp_list);
    var speed_names = Object.keys(speeds);
    var speeds_reverse = {};
    for(i in speed_names) {
        speeds_reverse[speeds[speed_names[i]]] = speed_names[i];
    }
    var speed_cb = default_safe(on_speed_change, function(){});
    return new Proxy({}, {
        get: function(obj, prop) {
            switch(prop) {
                case "speed_name":
                    return default_safe(obj.speed_name, "");
                case "speed_hz":
                    return default_safe(speeds[obj.speed_name], 1);
                case "speed_ms":
                    var hz = default_safe(speeds[obj.speed_name], 1);
                    return 1000/hz;
                case "speed_names":
                    return speed_names;
                case "speed_options":
                    return speeds;
                default:
                    return undefined;
            }
        },
        set: function(obj, prop, val) {
            switch(prop) {
                case "speed_name":
                    if(speed_names.indexOf(val) > -1) {
                        obj.speed_name = val;
                        speed_cb();
                        return true;
                    }
                    return false;
                case "speed_hz":
                    if(val && isSafe(speeds_reverse[val])) {
                        obj.speed_name = speeds_reverse[val];
                        speed_cb();
                        return true;
                    }
                    return false;
                case "speed_ms":
                    if(!val) {
                        return false;
                    }
                    var speed_hz = 1000/val;
                    if(isSafe(speeds_reverse[speed_hz])) {
                        obj.speed_name = speeds_reverse[speed_hz];
                        speed_cb();
                        return true;
                    }
                    return false;
                default:
                    return false;
            }
        }
    });
};

// A fancy memory manager that supports multiple types of virtual memories
var make_memory_manager = Object.freeze(function() { return {
    memory_map: [],
    
    alloc_block: function(callbacks, start, length, data) {
        var object = {};
        object.callback = callbacks.io_cb;
        object.clear = callbacks.clr_cb;
        object.getline = callbacks.line_cb;
        object.origin = start;
        object.data = data;
        
        for(var i = 0; i<length+1; i++) {
            this.memory_map[start+i] = object;
        }
    },
    
    reset: function() {
        for(var i = 0; i<this.memory_map.length; i++) {
            var obj = this.memory_map[i];
            if(obj) {
                obj.clear(i-obj.origin, obj.data);
            }
        }
    },
    
    // Constrain the index to the # of address bits. Currently 16.
    // TODO: Language defined bit contraints
    constrain: function(index) {
        return index & 0x0000FFFF;
    },
    
    // Read functions
    read8: function(index) {
        var output = this.memory_map[index];
        if(!isSafe(output)) { return undefined; }
        var cb = output.callback;
        if(!isSafe(cb)) { return undefined; }
        return cb(index-output.origin, output.data, null);
    },
    read16: function(index) {
        var output = this.read8(index);
        if(!isSafe(output)) { return undefined; }
        var tmp = this.read8(index+1);
        if(!isSafe(tmp)) { return undefined; }
        output &= 0x000000FF;
        output |= (tmp & 0x000000FF) << 8;
        return output;
    },
    read32: function(index) {
        var output = this.read16(index);
        if(!isSafe(output)) { return undefined; }
        var tmp = this.read16(index+2);
        if(!isSafe(tmp)) { return undefined; }
        output &= 0x0000FFFF;
        output |= (tmp & 0x0000FFFF) << 16;
        return output;
    },
    
    // Write functions
    write8: function(index, val) {
        var output = this.memory_map[index];
        if(!isSafe(output)) { return false; }
        var cb = output.callback;
        if(!isSafe(cb)) { return false; }
        cb(index-output.origin, output.data, val)
        return true;
    },
    write16: function(index, val) {
        if(!this.write8(index+0, (val >> 0) & 0x000000FF)) { return false; }
        if(!this.write8(index+1, (val >> 8) & 0x000000FF)) { return false; }
    },
    write32: function(index, val) {
        if(!this.write16(index+0, (val >>  0) & 0x000000FF)) { return false; }
        if(!this.write16(index+2, (val >> 16) & 0x000000FF)) { return false; }
    },
    
    // Functions to find line index at a memory address
    readline8: function(index) {
        var output = this.memory_map[index];
        if(!isSafe(output)) { return []; }
        var cb = output.getline;
        if(!isSafe(cb)) { return []; }
        output = cb(index-output.origin, output.data);
        if(!isSafe(output)) { return []; }
        return [output];
    },
    readline16: function(index) {
        var array = [];
        array = array.concat(this.readline8(index+0));
        array = array.concat(this.readline8(index+1));
        return array.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
    },
    readline32: function(index) {
        var array = [];
        array = array.concat(this.readline16(index+0));
        array = array.concat(this.readline16(index+2));
        return array.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
    },
    
    // Callback objects for default memory types
    
    // Standard RAM
    cb_ram: Object.freeze({
        clr_cb: function(index, data) {
            data[index] = undefined;
        },
        io_cb: function(index, data, value) {
            var tmp = data[index];
            if(value != null) {
                data[index] = value;
            }
            if(tmp == null) {
                return undefined;
            }
            return tmp;
        },
        line_cb: function(index, data) {
            return undefined;
        }
    }),
    
    // Instruction ROM that stores line #s
    cb_instruction_rom: Object.freeze({
        clr_cb: function(index, data) {
            data[index] = {raw: undefined, src: undefined};
        },
        io_cb: function(index, data, value) {
            if(data[index] == null || data[index] == undefined
                    || data[index].raw == null) {
                return undefined;
            }
            return data[index].raw;
        },
        line_cb: function(index, data) {
            if(!data[index]) {
                return undefined;
            }
            return data[index].src;
        },
        
        // Utility functions to manipulate data
        // Used by the system to move assembler data into memory
        put8: function(index, data, src_line, src_data) {
            data[index] = {raw: src_data, src: src_line};
        },
        put16: function(index, data, src_line, src_data) {
            this.put8(index, data, src_line, (src_data << 0) & 0x000000FF);
            this.put8(index+1, data, src_line, (src_data << 8) & 0x000000FF);
        },
        put32: function(index, data, src_line, src_data) {
            this.put8(index, data, src_line, (src_data << 0) & 0x0000FFFF);
            this.put8(index+2, data, src_line, (src_data << 16) & 0x0000FFFF);
        }
    })
}; });

// The alert manager is just what makes alerts pop up on the screen
global.alert_manager = {
    alerts: [{title: "Warning", body: "This application is alpha. This may have\
        bugs, may not work, and may never be useful. This is a concept design.",
        type: "warning"}],
    
    html_alert: function(type, title, body) {
        this.alerts.push({"title": title, "body": body, "type": type});
    },
    clear: function() {
        this.alerts.splice(0, this.alerts.length);
    },
    status: function(title, text) {
        this.html_alert("info", title, text);
    },
    error: function(title, text) {
        this.html_alert("danger", title, text);
    },
    
    dialog: {title: "", body: "", btns: []},
    ask: function(title, body, buttons) {
        this.dialog.title = title;
        this.dialog.body = body;
        this.dialog.btns = buttons;
        $("#dialog-modal").modal('show');
    },
    // Ask "yes," "cancel"
    ask_y_c: function(title, body, yes_cb, no_cb) {
        this.ask(title, body, [
            {text: "Cancel", type: "primary", cb: no_cb},
            {text: "Yes", cb: yes_cb}
        ]);
    }
};

global.speed_options = Object.freeze({"Fast": 512, "Medium": 32, "Slow": 4, "Really Slow": 1});

// Vue.JS has trouble tracking changes to the speed name, so I'll have to
// do it manually...
global.speed_name = "";
global.on_speed_change = function() {
    this.speed_name = this.speed.speed_name;
    this.options.speed_name = this.speed_name;
    
    // Notify all systems to change speed
    for(system in this.systems) {
        this.systems[system].on_speed_change();
    }
};
global.speed = make_speed_controller(global.speed_options, 
                global.on_speed_change.bind(global));

global.systems = {};
var make_system = Object.freeze(function() { return {
    lang: null,
    
    timer: null,
    states: Object.freeze({STOPPED: 0, PAUSED: 1, RUNNING: 2}),
    state: 0,
    
    memory_manager: make_memory_manager(),
    cpu: null,
    assembler: null,
    visual_component: "core-pane-visual-loading",
    
    alert_manager: null,
    codemirror_options: {
        lineNumbers: true,
        theme: "mdn-like",
        mode: {name: "edu-asm"},
        indentUnit: 4,
        styleActiveLine: true,
        matchBrackets: true,
        lineWrapping: true,
        extraKeys: {
            Tab: function(cm) {
                var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                cm.replaceSelection(spaces);
            }
        },
        readOnly: false
    },
    
    default_asm_text: Object.freeze("halt"),
    asm_text: this.default_asm_text,
    active_lines: [], // The system cannot actually talk directly to the CPU
    // because the system is language independent. So the CPU must actually
    // update these lines itself.
    
    // This must be called when a new language is applied. There is no use for
    // a constructor since a language can be applied to an existing system.
    init_lang: function(l) {
        // Prevent the old visual from crashing. Destroy it first
        this.visual_component = "core-pane-visual-loading";
        
        // This sets up the alert_manager to stop the system on an error
        var stop_func = this.stop.bind(this);
        this.alert_manager = new Proxy(global.alert_manager, {
            get: function(obj, prop) {
                if(prop === 'error') {
                    // Re-direct all error calls to this function
                    return function(title, text) {
                        stop_func();
                        return obj[prop](title,text);
                    };
                }
                return obj[prop];
            }
        });
        
        // Check for a valid language
        if(!l || !l.visual || !l.make_assembler || !l.make_cpu || !l.tgt_image_size) {
            return false;
        }
        this.lang = l;
        
        // Component init
        this.assembler = this.lang.make_assembler(this);
        this.cpu = this.lang.make_cpu(this);
        this.cpu.setup_memory_map();
        this.visual_component = this.lang.visual;
        
        return true;
    },
    
    build: function() {
        this.stop();
        this.memory_manager.reset();
        
        var image_map = new Array(this.lang.tgt_image_size);
        
        var defaults = {origin: 0x8000};
        
        if(!this.asm_text) {
            this.asm_text = "";
            return null;
        }
        
        // Interpretation turns the text into JS objects
        var labels = this.assembler.interpret(this.asm_text.split("\n"), image_map, defaults);
        if(labels == null) { return null; }
        
        // The actual assembling process turns the objects into bytecodes and
        // resolves labels and label references
        var image = this.assembler.assemble(image_map, labels, defaults);
        if(image == null) { return null; }
        
        return image;
    },
    
    run: function() {
        if(this.timer == null) {
            if(this.state != this.states.PAUSED) {
                this.alert_manager.clear();
                
                var image = this.build();
                
                if(image == null) { 
                  return;
                }
                
                if(!this.cpu.init(image)) {
                    return;
                }
            }
            
            this.codemirror_options.readOnly = "nocursor";
            this.timer = setInterval(function(system) {
                try {
                    system.cpu.cycle();
                } catch(e) {
                    system.alert_manager.error("Internal Error",
                        "CPU execution failed. This is a bug.");
                    system.stop();
                    console.log("Internal Error", e);
                    return;
                }
	         }, global.speed.speed_ms, this);
	         
	         this.state = this.states.RUNNING;
        }
    },
    pause: function() {
        if(this.timer != null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.state = this.states.PAUSED;
    },
    run_pause_toggle: function() {
        if(this.timer == null) {
            this.run();
        } else {
            this.pause();
        }
    },
    stop: function() {
        if(this.timer != null) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.codemirror_options.readOnly = false;
        this.state = this.states.STOPPED;
    },
    on_speed_change: function() {
        if(this.timer != null) {
            clearInterval(this.timer);
            this.timer = null;
            this.state = this.states.PAUSED;
            this.run();
        }
    },
    
    halt_condition: function() {
        this.alert_manager.status("System halted", "A halt condition was detected.");
        this.stop();
    },
    
    download_code: function() {
        if(!file_manager.download_txt(this.asm_text, "eduasm.s")) {
            this.alert_manager.error("Download Error", "The download failed. This\
                probably means that you're using an unsupported browser. Sorry!\
                If you need to, you can copy and paste.");
        }
    },
    upload_code_no_ask: function() {
        var c_system = this;
        
        file_manager.upload_txt(function(file,reader) {
            if(!file) {
                this.alert_manager.error("Upload Error", "The upload failed.\
                    This probably means that you're using an unsupported\
                    browser. Sorry! If you need to, you can copy and paste.");
                return;
            }
            if(file.size > 64*1024*1024) {
                this.alert_manager.error("Upload Error", "The file you're\
                    trying to upload has a size greater than 64MB. Uploading\
                    files larger than 64MB is not supported because it will\
                    probably crash the web browser.");
                return;
            }
            
            reader.onload = function() {
                c_system.asm_text = reader.result;
            };
            
            reader.onabort = function() {
                this.alert_manager.error("Upload Error", "The upload failed.\
                    This probably means that you're using an unsupported\
                    browser. Sorry! If you need to, you can copy and paste.");
            };
            reader.onerror = reader.onabort;
            
            reader.readAsText(file);
        });
    },
    upload_code: function() {
        this.stop();
        
        this.alert_manager.ask_y_c("Continue?", "Uploading a new file will\
            overwrite your current code. Continue?", 
            this.upload_code_no_ask.bind(this), function() {});
    },
    new_file: function() {
        this.stop();
        
        var yes_func = function() {
            this.asm_text = this.default_asm_text;
        }.bind(this);
        
        this.alert_manager.ask_y_c("Continue?", "Creating a new file will\
            overwrite your current code. Continue?", yes_func, function() {});
    }
}; });

var debug = function(text){};

var vm;

function vue_init() {
    vm = new Vue({
      el: "#vue-container",
      data: global
    });
    
    vm.$watch('options.enable_debug', function(new_obj,old_obj) {
        if(isSafe(new_obj) && new_obj == true) {
            debug = function(text){ console.log(text); };
        } else {
            debug = function(text){};
        }
    });
}

function core_init() {
    global.speed.speed_name = "Really Slow";
    
    global.load_options();
    
    // The speed controller will default to a useable value if the one in the
    // options variable is undefined or not in the speed list
    global.speed.speed_name = global.options.speed_name;
    
    vue_init();
}

function system_init(sysid, lang) {
    global.systems[sysid] = make_system();
    
    if(!global.systems[sysid].init_lang(lang)) {
        return false;
    }
    
    return true;
}
