import {options, FileManager} from '@/js/io.js'

var make_speed_controller = function(sp_list, on_speed_change) { 
    var speeds = Object.freeze(sp_list);
    var speed_names = Object.keys(speeds);
    var speeds_reverse = {};
    for(var i = 0; i<speed_names.length; i++) {
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
                    return true;
                case "speed_hz":
                    if(val && isSafe(speeds_reverse[val])) {
                        obj.speed_name = speeds_reverse[val];
                        speed_cb();
                        return true;
                    }
                    return true;
                case "speed_ms":
                    if(!val) {
                        return true;
                    }
                    var speed_hz = 1000/val;
                    if(isSafe(speeds_reverse[speed_hz])) {
                        obj.speed_name = speeds_reverse[speed_hz];
                        speed_cb();
                        return true;
                    }
                    return true;
                default:
                    return false;
            }
        }
    });
};

// A fancy memory manager that supports multiple types of virtual memories
export var make_memory_manager = Object.freeze(function() { return {
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
        var output = this.memory_map[this.constrain(index)];
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
        var output = this.memory_map[this.constrain(index)];
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
        var output = this.memory_map[this.constrain(index)];
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

var speed_options = Object.freeze({"Fast": 512, "Medium": 32, "Slow": 4, "Really Slow": 1});

// Vue.JS has trouble tracking changes to the speed name, so I'll have to
// do it manually...
var on_speed_change = function() {
    speed_vars.speed_name = speed.speed_name;
    options.speed_name = speed.speed_name;
    
    // Notify all systems to change speed
    for(system in this.systems) {
        systems[system].on_speed_change();
    }
};
export var speed = make_speed_controller(speed_options, 
                on_speed_change.bind(global));
// This is just a nice little object to pass around Vue.JS
// TODO: Find a proper $emit('update:speed') solution to this...
export var speed_vars = {speed: speed, speed_name: ""};

var systems = {};
var make_system = function(alert_manager) { return {
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
        mode: {name: "LearnASM"},
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
    
    asm_text: "",
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
        this.alert_manager = new Proxy(alert_manager, {
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
                // Un-highlight old active lines
                this.active_lines.splice(0, this.active_lines.length);
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
	         }, speed.speed_ms, this);
	         
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
        if(!FileManager.download_txt(this.asm_text, "eduasm.s")) {
            this.alert_manager.error("Download Error", "The download failed. This\
                probably means that you're using an unsupported browser. Sorry!\
                If you need to, you can copy and paste.");
        }
    },
    upload_code_no_ask: function() {
        var c_system = this;
        
        FileManager.upload_txt(function(file,reader) {
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
}; };

export var system_init = function(sysid, lang, alert_manager) {
    systems[sysid] = make_system(alert_manager);
    
    if(!systems[sysid].init_lang(lang)) {
        return undefined;
    }
    
    return systems[sysid];
}
