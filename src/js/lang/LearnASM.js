import VueCodemirror from 'vue-codemirror'
import CodeMirror from 'codemirror'

// Currently, neither the memory_bits, cm_mode, nor the tgt_image_size are used,
// but are there for future implementations with multi-language support
var lang_object = {memory_bits: 16, tgt_image_size: 32*1024, cm_mode: "LearnASM"};

lang_object.make_assembler = function(system) { return {
    // Assembler counters
    // Location in the output binary
    counter: 0x0000,
    // "Real" memory location
    real_loc: 0x0000,
    // If this is true, the instruction is marked as having a fixed position
    requires_marker: true,
    
    // Current line/object number in the input text/array
    linenum: 0,

    asm_error: function(text) {
        var line = "Line "+(this.linenum+1).toString()+": ";
        line += text;
        system.alert_manager.error("Assembler Error", line);
        throw "Assembler Error: "+line;
    },
    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    
    // Parse a register operand of an instruction
    parse_instruction_register: function(reg) {
        if(reg in this.constants.registers) {
            return this.constants.registers[reg];
        } else {
            this.asm_error(escapeHtml(reg)+" is not a register.");
            return 0;
        }
    },
    
    // Assign the src1 field of an instruction object
    set_instruction_src1: function(instruction, src1, supports_lbl) {
        if(!isSafe(src1)) {
            instruction.src1_imm = false;
            instruction.src1 = 0;
            return;
        }
        // Set src1
        instruction.src1_imm = true;
        if(src1.startsWith("#")) {
            // Parse 8 bit immediate
            var int = parseIntExtended(src1.substr(1, src1.length));
            if(isNaN(int) || int == undefined || int == null 
                  || (int > 0xFF && instruction.mode != 0x3) 
                  || (int > 0xFFFF && instruction.mode == 0x3)) {
                this.asm_error(escapeHtml(src1)+" is an invalid number.");
            } else {
                instruction.src1 = int;
            }
        } else if(src1.startsWith("<") && src1.endsWith(">") && supports_lbl && instruction.mode == 0x3) {
            // Parse label and add the label to the instruction for later update
            instruction[".label"] = src1.substr(1, src1.length-2);
        } else if(src1 in this.constants.registers) {
            // The usual register
            instruction.src1_imm = false;
            instruction.src1 = this.constants.registers[src1];
        } else {
            this.asm_error(escapeHtml(src1)
                +" is neither a register, label, nor immediate.");
            instruction.src1 = 0;
        }
    },
    
    // Assign the condition code field of an instruction
    set_instruction_cond_code: function(instruction, code) {
        // Set condition codes. Default to always
        instruction.cond = this.constants.cond_codes.al;
        if(isSafe(code)) {
            // If the regex found a condition code, it should be in the map
            // This assumes the regex and the condition map are correct
            instruction.cond = this.constants.cond_codes[code];
        }
    },
    
    // Assign the flag field of an instruction
    set_instruction_flags: function(instruction, flags) {
        // Defaults
        instruction.mode = 0x3;
        instruction.updateflags = false;
        
        // Iterate over flags
        for(var i = 0; i<flags.length; i++) {
            switch(flags[i]) {
                case 'u': // Update flags
                    instruction.updateflags = true;
                    break;
                case 'n': // No destination
                    instruction.mode = 0x0;
                    break;
                case 'b': // Bottom byte destination
                    instruction.mode = 0x1;
                    break;
                case 't': // Top byte destination
                    instruction.mode = 0x2;
                    break;
                case 'f': // Full word destination (default)
                    instruction.mode = 0x3;
                    break;
                default:
                    this.asm_error("Undefined flag "+modifiers[i]+".");
            }
        }
    },
    
    check_argument_length: function(opcd, length, target_length) {
        if(length < target_length) {
            this.asm_error("Not enough arguments for opcode "+escapeHtml(opcd));
            return false;
        } else if(length > target_length) {
            this.asm_error("Too many arguments for opcode "+escapeHtml(opcd));
            return false;
        }
        return true;
    },
    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    
    constants: {
        instruction_len_bytes: 4,
        
        registers: {
            "r0": 0x0,
            "r1": 0x1,
            "r2": 0x2,
            "r3": 0x3,
            "r4": 0x4,
            "r5": 0x5,
            "r6": 0x6,
            "r7": 0x7,
            
            "lr": 0x5,
            "sp": 0x6,
            "pc": 0x7,
            "ni": 0x7,
            
            // Fill in undefined data
            undefined: 0x0,
            null: 0x0
        },
        // Condition codes
        cond_codes: {
            "eq": 0x0,
            "ne": 0x1,
            "hs": 0x2,
            "lo": 0x3,
            "mi": 0x4,
            "pl": 0x5,
            "vs": 0x6,
            "vc": 0x7,
            "hi": 0x8,
            "ls": 0x9,
            "ge": 0xA,
            "lt": 0xB,
            "gt": 0xC,
            "le": 0xD,
            "al": 0xE,
            "nv": 0xF,
            
            "cs": 0x2,
            "cc": 0x3,
            
            // No opcode = always
            null: 0xE
        },
        modes: {
            "NONE": 0x0,
            "TOP": 0x1,
            "BOTTOM": 0x2,
            "FULL": 0x3
        },
        // Opcode map. The object's opcd is, of course, the binary opcode. The 
        // "args" array is a list in the order the respective fields appear in
        // the text instruction. I.e, "mov <dst>, <src1>" (see below)
        opcodes: {
            "mov" : {opcd: 0x0, args: ["dst","src1"]},
            "and" : {opcd: 0x1, args: ["dst","src0","src1"]},
            "or"  : {opcd: 0x2, args: ["dst","src0","src1"]},
            "xor" : {opcd: 0x3, args: ["dst","src0","src1"]},
            "add" : {opcd: 0x4, args: ["dst","src0","src1"]},
            "sub" : {opcd: 0x5, args: ["dst","src0","src1"]},
            "umul": {opcd: 0x6, args: ["dst","src0","src1"]},
            "smul": {opcd: 0x7, args: ["dst","src0","src1"]},
            "udiv": {opcd: 0x8, args: ["dst","src0","src1"]},
            "sdiv": {opcd: 0x9, args: ["dst","src0","src1"]},
            "lsl" : {opcd: 0xA, args: ["dst","src0","src1"]},
            "lsr" : {opcd: 0xB, args: ["dst","src0","src1"]},
            "asr" : {opcd: 0xC, args: ["dst","src0","src1"]},
            "ror" : {opcd: 0xD, args: ["dst","src0","src1"]},
            "ldr" : {opcd: 0xE, args: ["dst","src0"]},
            "str" : {opcd: 0xF, args: ["src0","src1"]}
        },
        // A list of pseudocodes, such as "halt," that need translation functions.
        // Note that the functions are called using their call function so that
        // the function's "this" points to the assembler object.
        pseudo_opcodes: {
            "halt": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 0)) {
                    return null;
                }
                
                instruction.opcd = this.constants.opcodes.sub.opcd;
                instruction.dst = this.constants.registers.pc;
                instruction.src0 = this.constants.registers.pc;
                instruction.src1_imm = true;
                instruction.src1 = 0x4;
                
                return [instruction];
            },
            "push": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 1)) {
                    return null;
                }
                
                var instruction_str = make_copy(instruction);
                instruction_str.updateflags = false;
                instruction_str.opcd = this.constants.opcodes.str.opcd;
                instruction_str.src0 = this.constants.registers.sp;
                this.set_instruction_src1(instruction_str, arg_list[0], true);
                
                var instruction_add = make_copy(instruction);
                instruction_add.opcd = this.constants.opcodes.add.opcd;
                instruction_add.dst = this.constants.registers.sp;
                instruction_add.src0 = this.constants.registers.sp;
                instruction_add.src1_imm = true;
                instruction_add.src1 = 0x0002;
                instruction_add.mode = this.constants.modes.FULL;
                if(instruction.mode == this.constants.modes.TOP ||
                        instruction.mode == this.constants.modes.BOTTOM) {
                    instruction_add.src1 = 0x0001;
                }
                
                return [instruction_str, instruction_add];
            },
            "pop": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 1)) {
                    return null;
                }
                var instruction_sub = make_copy(instruction);
                instruction_sub.opcd = this.constants.opcodes.sub.opcd;
                instruction_sub.dst = this.constants.registers.sp;
                instruction_sub.src0 = this.constants.registers.sp;
                instruction_sub.src1_imm = true;
                instruction_sub.src1 = 0x0002;
                instruction_sub.mode = this.constants.modes.FULL;
                if(instruction.mode == this.constants.modes.TOP ||
                        instruction.mode == this.constants.modes.BOTTOM) {
                    instruction_sub.src1 = 0x0001;
                }
                
                var instruction_ldr = make_copy(instruction);
                instruction_ldr.updateflags = false;
                instruction_ldr.opcd = this.constants.opcodes.ldr.opcd;
                instruction_ldr.dst = this.parse_instruction_register(arg_list[0]);
                instruction_ldr.src0 = this.constants.registers.sp;
                
                return [instruction_sub, instruction_ldr];
            },
            // Branch
            "b": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 1)) {
                    return null;
                }
                
                instruction.mode = this.constants.modes.FULL;
                
                // First, resolve the src1 (which will read labels)
                this.set_instruction_src1(instruction, arg_list[0], true);
                
                instruction.opcd = this.constants.opcodes.mov.opcd;
                instruction.dst = this.constants.registers.ni;
                instruction.src0 = 0;
                
                // The "raw" type reserves space for the pointer
                return [instruction];
            },
            // Branch w/ link
            "bl": function(instruction, arg_list) {
                instruction = this.constants.pseudo_opcodes.b.call(this, instruction, arg_list)[0];
                
                var link_instruction = {};
                        
                link_instruction.opcd = this.constants.opcodes.add.opcd;
                // A trick to invert the condition code value
                link_instruction.cond = instruction.cond;
                link_instruction.updateflags = false;
                link_instruction.mode = this.constants.modes.FULL;
                link_instruction.dst = this.constants.registers.lr;
                link_instruction.src0 = this.constants.registers.ni;
                link_instruction.src1 = 0x0004;
                link_instruction.src1_imm = true;
                
                return [link_instruction, instruction];
            },
            // Compare
            "cmp": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 2)) {
                    return null;
                }
                        
                instruction.opcd = this.constants.opcodes.sub.opcd;
                instruction.updateflags = true;
                instruction.mode = this.constants.modes.NONE;
                instruction.dst = 0;
                instruction.src0 = this.parse_instruction_register(arg_list[0]);
                this.set_instruction_src1(instruction, arg_list[1], false);
                
                return [instruction];
            },
            // Compare Negative
            "cmn": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 2)) {
                    return null;
                }
                        
                instruction.opcd = this.constants.opcodes.add.opcd;
                instruction.updateflags = true;
                instruction.mode = this.constants.modes.NONE;
                instruction.dst = 0;
                instruction.src0 = this.parse_instruction_register(arg_list[0]);
                this.set_instruction_src1(instruction, arg_list[1], false);
                
                return [instruction];
            },
            // Test
            "tst": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 2)) {
                    return null;
                }
                        
                instruction.opcd = this.constants.opcodes.xor.opcd;
                instruction.updateflags = true;
                instruction.mode = this.constants.modes.NONE;
                instruction.dst = 0;
                instruction.src0 = this.parse_instruction_register(arg_list[0]);
                this.set_instruction_src1(instruction, arg_list[1], false);
                
                return [instruction];
            },
            // Test Negative
            "teq": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 2)) {
                    return null;
                }
                        
                instruction.opcd = this.constants.opcodes.and.opcd;
                instruction.updateflags = true;
                instruction.mode = this.constants.modes.NONE;
                instruction.dst = 0;
                instruction.src0 = this.parse_instruction_register(arg_list[0]);
                this.set_instruction_src1(instruction, arg_list[1], false);
                
                return [instruction];
            },
            // Clear Flags
            "cfl": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 0)) {
                    return null;
                }
                        
                instruction.opcd = this.constants.opcodes.mov.opcd;
                instruction.updateflags = true;
                instruction.mode = this.constants.modes.NONE;
                instruction.dst = 0;
                instruction.src0 = 0;
                instruction.src1 = 1;
                instruction.src1_imm = true;
                
                return [instruction];
            },
            // Bitwise Boolean NOT
            "not": function(instruction, arg_list) {
                if(!this.check_argument_length(instruction.opcd, arg_list.length, 2)) {
                    return null;
                }
                
                instruction.dst = this.parse_instruction_register(arg_list[0]);
                
                this.set_instruction_src1(instruction, arg_list[1], true);
                if(instruction.src1_imm) {
                    instruction.opcd = this.constants.opcodes.mov.opcd;
                    instruction.src1 ^= instruction.mode == this.constants.modes.FULL ? 0xffffffff : 0x0000ffff;
                } else {
                    instruction.opcd = this.constants.opcodes.xor.opcd;
                    if(instruction.mode == this.constants.modes.NONE) {
                        this.asm_error("NOT cannot be used with the no-update (n) mode.");
                    }
                    
                    instruction.src0 = instruction.src1;
                    instruction.src1_imm = true;
                    instruction.src1 = 0xffffffff;
                }
                
                return [instruction];
            }
        },
        // Complete opcode list
        opcode_list: undefined,
        // Regex for parsing opcodes
        opcode_regex: undefined,
        
        // Set up the utility constants
        init_constants: function() {
            // Complete opcode list
            this.constants.opcode_list = Object.keys(this.constants.opcodes)
                .concat(Object.keys(this.constants.pseudo_opcodes));
            
            // Regex for parsing opcodes
            var opcode_regex = "^(";
            for(var i = 0; i<this.constants.opcode_list.length; i++) {
                opcode_regex += this.constants.opcode_list[i];
                if(i < this.constants.opcode_list.length-1) {
                    opcode_regex += '|';
                }
            }
            opcode_regex += ")([ftbnu]*)(";
            var keys = Object.keys(this.constants.cond_codes);
            for(var i = 0; i<keys.length; i++) {
                opcode_regex += keys[i];
                if(i < keys.length-1) {
                    opcode_regex += '|';
                }
            }
            opcode_regex += ")?$";
            this.constants.opcode_regex = new RegExp(opcode_regex);
        }
    },
    
    init: function() { this.constants.init_constants.call(this); return this; },
    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    
    ins_txt_to_obj: function(line, opcd, arg_list) {
        var res = this.constants.opcode_regex.exec(opcd);
        if(!isSafe(res) || res.length != 4) {
            this.asm_error("Unknown opcode "+escapeHtml(opcd));
            return null;
        }
        
        var instruction = {};
        instruction.opcd = res[1];
        
        this.set_instruction_cond_code(instruction, res[3]);
        
        this.set_instruction_flags(instruction, res[2]);
        
        var opcd_data = this.constants.pseudo_opcodes[instruction.opcd];
        // Execute pseudo opcode processing functions
        if(isSafe(opcd_data)) {
            return opcd_data.call(this, instruction, arg_list);
        }
        
        // Look up a normal opcode
        opcd_data = this.constants.opcodes[instruction.opcd];
        if(!isSafe(opcd_data)) {
            this.asm_error("Unknown opcode "+escapeHtml(opcd));
            return null;
        }
        
        if(!this.check_argument_length(instruction.opcd, arg_list.length, opcd_data.args.length)) {
            return null;
        }
        instruction.opcd = opcd_data.opcd;
        
        // Set the variables based on the argument template
        // This assumes that the template is correct
        for(var i = 0; i<arg_list.length; i++) {
            instruction[opcd_data.args[i]] = arg_list[i];
        }
        
        instruction.dst = this.parse_instruction_register(instruction.dst);
        instruction.src0 = this.parse_instruction_register(instruction.src0);
        // Set the src1 field, but note that only mov supports labels
        this.set_instruction_src1(instruction, instruction.src1, true);
        
        return [instruction];
    },
    
    // This is used to convert an instruction object to bytecode
    instruction_to_bytecode: function(instruction) {
        try {
            var bytecode = 0x00000000;
            
            bytecode |= (instruction.cond & 0x0F) << 0;
            bytecode |= (instruction.opcd & 0x0F) << 4;
            bytecode |= (instruction.updateflags & 0x01) << 11;
            bytecode |= (instruction.dst & 0x07) << 8;
            bytecode |= (instruction.src0 & 0x07) << 12;
            
            if(instruction.src1_imm && instruction.mode == 0x3) {
                bytecode |= (1) << 15;
                bytecode |= (instruction.src1 & 0xFFFF) << 16;
            } else {
                bytecode |= (instruction.mode & 0x03) << 25;
                if(instruction.src1_imm) {
                    //bytecode |= (0) << 15;
                    bytecode |= (1) << 24;
                    bytecode |= (instruction.src1 & 0xFF) << 16;
                } else {
                    //bytecode |= (0) << 15;
                    //bytecode |= (0) << 24;
                    bytecode |= (instruction.src1 & 0x07) << 16;
                }
            }
            
            return bytecode;
        } catch(ex) {
            console.log("Internal Error:", ex);
            return null;
        }
    },
    
    // A lookup table for assembler "." directives
    directive_funcs: {
        // Set the assumed hardware address of location 0 in the image
        origin: function(parts, image_map, labels) {
            if(parts.length == 2) {
                var pos = parseInt(parts[1]);
                if(isSafe(pos) && pos >= 0) {
                    // The real location changes where the instructions
                    // "think" they are. Typically, only one origin
                    // directive is included in a file, unless the user
                    // wants to copy some code into a section of memory
                    // with a different address.
                    this.real_loc = pos + this.counter;
                } else {
                    this.asm_error("The .origin directive takes an \
                        address for its second argument.");
                    return null;
                }
            } else { // Too many / not enough arguments
                this.asm_error("The .origin directive takes only \
                    one argument. This error is critical.");
                return null;
            }
        },
        // Seek to a particular address
        seek: function(parts, image_map, labels) {
            if(parts.length == 2) {
                var pos = parseInt(parts[1]);
                if(isSafe(pos)) {
                    var virtpos = pos - (this.real_loc - this.counter);
                    if(virtpos >= 0) {
                        this.counter = virtpos;
                        this.real_loc = pos;
                        this.requires_marker = true;
                    } else {
                        this.asm_error("The provided address is outside \
                            of the current memory. Maybe you need to \
                            change your origin (.org).");
                        return null;
                    }
                } else {
                    this.asm_error("The .seek directive takes an \
                        int for its second argument.");
                    return null;
                }
            }
        },
        // Same as seek
        location: function(parts, image_map, labels) {
            return assembler.directive_funcs.seek(parts, image_map, labels);
        },
        // Code a byte
        byte: function(parts, image_map, labels) {
            if(parts.length == 2) {
                var val = parseInt(parts[1]);
                if(isSafe(val) && (val & 0x000000FF) - val == 0) {
                    var data = {".line": this.linenum};
                    data[".type"] = "raw";
                    data[".byte"] = 0;
                    data[".raw"] = val;
                    image_map[this.counter] = data;
                    
                    this.counter += 1;
                    this.real_loc += 1;
                } else {
                    this.asm_error("The .byte directive takes a \
                        byte for its second argument.");
                }
            } else { // Too many / not enough arguments
                this.asm_error("The .byte directive takes only \
                    one argument.");
            }
        },
        // Code a 16 bit word
        word: function(parts, image_map, labels) {
            if(parts.length == 2) {
                var val = parseInt(parts[1]);
                var label = undefined;
                
                if(!(isSafe(val) && (val & 0x0000FFFF) - val == 0)) {
                    if(parts[1].startsWith("<") && parts[1].endsWith(">")) {
                        val = 0;
                        label = parts[1].trim().substr(1, parts[1].length-2);
                    } else {
                        this.asm_error("The .word directive takes a \
                            word (double bytes) for its second argument.");
                        return;
                    }
                }
                
                var data = {".line": this.linenum};
                data[".type"] = "raw";
                data[".byte"] = 0;
                data[".raw"] = val & 0x000000FF;
                if(label != undefined) {
                    data[".label"] = label;
                }
                image_map[this.counter] = data;
                
                this.counter += 1;
                this.real_loc += 1;
                
                data = {".line": this.linenum};
                data[".type"] = "raw";
                data[".byte"] = 1;
                data[".raw"] = (val >> 8) & 0x000000FF;
                if(label != undefined) {
                    data[".label"] = label;
                }
                image_map[this.counter] = data;
                
                this.counter += 1;
                this.real_loc += 1;
            } else { // Too many / not enough arguments
                this.asm_error("The .word directive takes only \
                    one argument.");
                return;
            }
        }
    },
    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    
    translate_directive: function(cline, image_map, labels) {
        parts = cline.split(" ");
        
        debug("Found directive "+parts[0]);
        
        var func = this.directive_funcs[parts[0].substr(1, parts[0].length)];
        
        if(!isSafe(func)) {
            this.asm_error("Unknown directive "+escapeHtml(parts[0])
                +". This error is critical.");
            return false;
        }
        
        func.call(this, parts, image_map, labels);
        return true;
    },
    
    translate_label: function(cline, image_map, labels) {
        var lb_name = cline.substr(0, cline.length-1);
        
        // We can't overwrite old regions
        if(lb_name in labels) {
            this.asm_error("Duplicate label "+escapeHtml(lb_name)+".");
            // We can keep going after this because labels aren't resolved
            // until later. The function will return false before then.
            return true;
        }
        
        labels[lb_name] = this.real_loc;
        
        debug("Found label "+lb_name);
        return true;
    },
    
    translate_instruction: function(cline, image_map, labels) {
        var arg_list;
        var opcd;
        var sp_index = cline.indexOf(" ");
        
        // Build our argument list
        if(sp_index == -1) {
            // There are no arguments, just an opcode
            opcd = cline.toLowerCase();
            arg_list = [];
        } else {
            // Add the opcode
            opcd = cline.substr(0, sp_index).toLowerCase();
            
            // Add the arguments
            arg_list = cline.substr(sp_index+1, cline.length-1).split(",");
            
            for(var j = 0; j<arg_list.length; j++) {
                arg_list[j] = arg_list[j].trim().toLowerCase();
            }
        }
        
        // A single instruction may actually be a pseudoinstruction that codes
        // multiple bytecodes.
        var instructions = this.ins_txt_to_obj(i, opcd, arg_list);
        if(isSafe(instructions)) {
            var instruction;
            for(var i = 0; i<instructions.length; i++) {
                instruction = instructions[i];
                
                // Assign various data markers
                instruction[".line"] = this.linenum;
                // Default to the instruction type
                if(!isSafe(instruction[".type"])) {
                    instruction[".type"] = "instruction";
                }
                instruction[".real_addr"] = this.real_loc;
                if(this.requires_marker) {
                    instruction[".fixed-pos"] = this.counter;
                    this.requires_marker = false;
                }
                
                if(this.counter >= image_map.length) {
                    this.asm_error("Ran out of space at "+this.real_loc.toString()+".");
                    return false;
                }
                
                if(!(isNaN(image_map[this.counter]) || image_map[this.counter] == 0)) {
                    this.asm_error("Already an instruction at "+
                        this.real_loc.toString()+".");
                    return false;
                }
                
                if(instruction[".type"] == "instruction") {
                    for(var j = 0; j<this.constants.instruction_len_bytes; j++) {
                        var instruction_tmp = make_copy(instruction);
                        // The byte tells us which part of the instruction is being
                        // represented (i.e, byte 0-3)
                        instruction_tmp[".byte"] = j;
                        image_map[this.counter+j] = instruction_tmp;
                    }
                    this.counter += this.constants.instruction_len_bytes;
                    this.real_loc += this.constants.instruction_len_bytes;
                } else if(instruction[".type"] == "raw") {
                    image_map[this.counter] = instruction;
                    this.counter += 1;
                    this.real_loc += 1;
                }
            }
        }
        return true;
    },
    
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    
    // Interpret a list of instructions into objects
    interpret: function(lines, image_map, defaults) {
        this.counter = 0x0000;
        this.real_loc = default_safe(defaults.origin, 0x0000);
        this.requires_marker = true;
        this.linenum = 0;
        
        var labels = {};
        
        var parts;
        var cline;
        for(this.linenum = 0; this.linenum<lines.length; this.linenum++) {
            cline = lines[this.linenum].split(";")[0].trim();
            
            if(cline.startsWith(".")) {
                if(!this.translate_directive(cline, image_map, labels)) { return null; }
            } else if(cline.endsWith(":")) {
                if(!this.translate_label(cline, image_map, labels)) { return null; }
            } else if(cline.length > 0) {
                if(!this.translate_instruction(cline, image_map, labels)) { return null; }
            } else {
                // Instruction length 0. Do nothing
            }
        }
        
        return labels;
    },
    
    // Actually assemble an object list into bytecode
    assemble: function(image_map, labels, defaults) {
        this.counter = 0x0000;
        this.real_loc = default_safe(defaults.origin, 0x0000);
        this.requires_marker = true;
        this.linenum = 0;
        
        // Resolve labels
        for(var i = 0; i<image_map.length; i++) {
            var instruction = image_map[i];
            var lname = undefined;
            if(instruction != null && instruction != undefined) {
                lname = instruction[".label"];
            } else {
                instruction = undefined;
            }
            
            if(isSafe(lname) && lname in labels) {
                var lbl_addr = labels[lname];
                
                if(instruction[".type"] === "raw") {
                    // Raw is really easy...
                    var byte = instruction[".byte"];
                    instruction[".raw"] = (lbl_addr >> byte*8) & 0x000000FF;
                } else if(instruction[".type"] === "instruction") {
                    if(instruction.mode == 0x3) {
                        instruction.src1 = lbl_addr & 0xFFFF;
                    } else {
                        this.asm_error("Internal assembler error. This is a bug.");
                    }
                } else {
                    this.asm_error("Internal assembler error. This is a bug.");
                }
            } else if(isSafe(lname) && !(lname in labels) && 
                    instruction[".byte"] == 0) {
                this.asm_error("Undefined label "+escapeHtml(lname)+".");
            }
        }
        
        var image_raw = [];
        for(var i = 0; i<image_map.length; i++) {
            if(!(image_map[i] == undefined || image_map[i] == 0)
                    && image_map[i][".type"] === "instruction"
                    && image_map[i][".byte"] == 0) {
                var bytecode = this.instruction_to_bytecode(image_map[i]);
                
                if(bytecode == null) {
                    this.asm_error("Internal assembler error. This is a bug.");
                } else {
                    image_raw[i+0] = {raw: (bytecode >>  0) & 0x000000FF, 
                            src: image_map[i][".line"]};
                    image_raw[i+1] = {raw: (bytecode >>  8) & 0x000000FF, 
                            src: image_map[i][".line"]};
                    image_raw[i+2] = {raw: (bytecode >> 16) & 0x000000FF, 
                            src: image_map[i][".line"]};
                    image_raw[i+3] = {raw: (bytecode >> 24) & 0x000000FF, 
                            src: image_map[i][".line"]};
                }
            } else if(!(image_map[i] == undefined || image_map[i] == 0) 
                    && image_map[i][".type"] === "raw") {
                
                image_raw[i] = {raw: image_map[i][".raw"], 
                            src: image_map[i][".line"]};
            }
        }
        
        // If there are no reset vectors, plop 'em in
        if((!isSafe(image_raw[(32*1024)-2])) && (!isSafe(image_raw[(32*1024)-1]))) {
            image_raw[(32*1024)-1] = {raw: 0x80, src:null};
            image_raw[(32*1024)-2] = {raw: 0x00, src:null};
        }
        
        return image_raw;
    }
}.init(); };

lang_object.make_cpu = function(system) { return {
    constants: {
        reg_pc: 7,
        reg_sp: 6,
        reg_lr: 5,
        
        cpsr_n: 0x1 << 2,
        cpsr_z: 0x1 << 3,
        cpsr_c: 0x1 << 0,
        cpsr_v: 0x1 << 1
    },
    
    registers: [0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0],
    cpsr: 0x0,
    
    visual_info: {
        execd: false,
        
        opcode: undefined,
        
        src0_reg: undefined,
        src1_reg: undefined,
        dest_reg: undefined,
        
        cond_code_eval: false,
        flags_updated: false,
        immediate: false
    },
    
    rom_image: [],
    
    cpsr_bit: function(bit) { return (this.cpsr & bit) > 0; },
    bits: function(val, start, len) {
        return (val >> start) & ((0x00000001 << len) - 1);
    },

    init: function(image) {
        // Realloc the ROM block
        system.memory_manager.alloc_block(
            system.memory_manager.cb_instruction_rom, 0x8000, 0x7FFF, image);
        this.registers[this.constants.reg_pc] = undefined;
        return true;
    },

    // Utility function. Makes code more readable
    increment_pc: function() {
        var pc = this.registers[this.constants.reg_pc] + 4;
        pc %= 0xFFFF;
        this.registers.splice(this.constants.reg_pc, 1, pc);
    },

    get_from_mode: function(mode, val) {
        switch(mode) {
            case 0x0: return val & 0x0000FFFF;
            case 0x1: return val & 0x000000FF;
            case 0x2: return (val >> 8) & 0x000000FF;
            case 0x3: return val & 0x0000FFFF;
        }
    },

    opcode_table: {
        0x00: function(s0, s1) { // MOV
            return s1;
        },
        0x01: function(s0, s1) { // AND
                return s0 & s1;
        },
        0x02: function(s0, s1) { // OR
                return s0 | s1;
        },
        0x03: function(s0, s1) { // XOR
                return s0 ^ s1;
        },
        0x04: function(s0, s1) { // ADD
            return 0x00000000 + s0 + s1;
        },
        0x05: function(s0, s1) { // SUB
            return (0x00000000 + s0) - s1;
        },
        0x06: function(s0, s1) { // UMUL
            return (0x00000000 + s0) * s1;
        },
        0x07: function(s0, s1) { // SMUL
            var a0 = 0x00007FFF & s0;
            var a1 = 0x00007FFF & s1;
            if((0x00008000 & s0)) {
                a0 = a0 ^ (0x00007FFF);
                a0 += 1;
            }
            if((0x00008000 & s1)) {
                a1 = a1 ^ (0x00007FFF);
                a1 += 1;
            }
            var out = ((0x00007FFF & a0) * (0x00007FFF & a1));
            out &= ~0x8000;
            if((0x00008000 & s0) ^ (0x00008000 & s1)) {
                out ^= 0xFFFF;
                out += 1;
            }
            return out;
        },
        0x08: function(s0, s1) { // UDIV
            return (0x00000000 + s0) / s1;
        },
        0x09: function(s0, s1) { // SDIV
            var a0 = 0x00007FFF & s0;
            var a1 = 0x00007FFF & s1;
            if((0x00008000 & s0)) {
                a0 = a0 ^ (0x00007FFF);
                a0 += 1;
            }
            if((0x00008000 & s1)) {
                a1 = a1 ^ (0x00007FFF);
                a1 += 1;
            }
            var out = ((0x00007FFF & a0) / (0x00007FFF & a1));
            out &= ~0x8000;
            if((0x00008000 & s0) ^ (0x00008000 & s1)) {
                out ^= 0xFFFF;
                out += 1;
            }
            return out;
        },
        0x0A: function(s0, s1) { // LSL
            return (0x0000FFFF & s0) << s1;
        },
        0x0B: function(s0, s1) { // LSR
            return ((0x0000FFFF & s0) >> s1)
                | (0x00010000 & (s0 << s1)); // This just makes sure the carry
                                             // bit is set
        },
        0x0C: function(s0, s1) { // ASR
            return ((0x00007FFF & s0) >> s1)
                | ((s0&0x00008000) ? ((0xFFFF8000 >> s1) & 0x0000FFFF) : 0)
                | (0x00010000 & (s0 << s1)); // Carry bit again
        },
        0x0D: function(s0, s1) { // ROR
            return s0 >> s1;
        },
        0x0E: function(s0, s1) { // LDR (handled externally)
            return s1;
        },
        0x0F: function(s0, s1) { // STR (handled externally)
            return s1;
        }
    },
    
    fetch_instruction: function() {
        var fetch_loc = this.registers[this.constants.reg_pc];
        
        if(!isSafe(fetch_loc)) {
            var fetch_loc = system.memory_manager.read16(0xFFFE);
            if(!isSafe(fetch_loc)) {
                system.alert_manager.error("Undefined reset vector", 
                    "Your reset vector is undefined.");
                return undefined;
            }
            this.registers.splice(this.constants.reg_pc, 1, fetch_loc);
            
        }
        
        var instruction = system.memory_manager.read32(fetch_loc);
        // See system.active_lines for an explanation...
        var ln = system.active_lines;
        ln.splice.apply(ln, [0, ln.length].concat(
                                system.memory_manager.readline32(fetch_loc)));
        
        if(!isSafe(instruction)) {
            system.alert_manager.error("Undefined instruction", 
                "An undefined instruction was executed, which means that you \
                attempted to execute blank memory.");
            return undefined;
        }
        
        return instruction;
    },
    
    eval_conds: function(code) {
        var N = this.cpsr_bit(this.constants.cpsr_n);
        var Z = this.cpsr_bit(this.constants.cpsr_z);
        var C = this.cpsr_bit(this.constants.cpsr_c);
        var V = this.cpsr_bit(this.constants.cpsr_v);
        
        this.visual_info.cond_code_eval = true;
        switch(code) {
            case 0x00: return Z==1;
            case 0x01: return Z==0;
            case 0x02: return C==1;
            case 0x03: return C==0;
            case 0x04: return N==1;
            case 0x05: return N==0;
            case 0x06: return V==1;
            case 0x07: return V==0;
            case 0x08: return (C==1) && (Z==0);
            case 0x09: return (C==0) || (Z==1);
            case 0x0A: return N==V;
            case 0x0B: return N!=V;
            case 0x0C: return (Z==0) && (N==V);
            case 0x0D: return (Z==1) || (N!=V);
            case 0x0E: this.visual_info.cond_code_eval = false; return true;
            case 0x0F: this.visual_info.cond_code_eval = false; return false;
            default: return false;
        }
        return false;
    },
    
    setup_memory_map: function() {
        // Allocate instruction ROM
        system.memory_manager.alloc_block(
            system.memory_manager.cb_instruction_rom, 0x8000, 0x7FFF, []);
        system.memory_manager.alloc_block(
            system.memory_manager.cb_ram, 0x0000, 0x6FFF, []);
    },
    
    cycle: function() {
        debug("Cycle");
        
        // Fetch instruction
        var instruction = this.fetch_instruction();
        if(!isSafe(instruction)) { return; }
        debug("Instruction: "+instruction.toString(16));
        
        // Every instruction starts with pc += (1 instruction)
        this.increment_pc();
        
        // Check condition codes
        this.visual_info.execd = false;
        if(!this.eval_conds(this.bits(instruction, 0, 4))) { return; }
        this.visual_info.execd = true;
        
        // Set up variables. Default to a full-register mode
        var mode = 0x3;
        
        var src0 = this.registers[this.bits(instruction, 12, 3)];
        var src1;
        var dstr = this.bits(instruction, 8, 3);
        
        this.visual_info.src0_reg = this.bits(instruction, 12, 3);
        this.visual_info.dest_reg = this.bits(instruction, 8, 3);
        
        // Calculate immediate
        if(this.bits(instruction, 15, 1) == 1) {
            src1 = this.bits(instruction, 16, 16);
            debug("SRC1: 16 bit immediate: 0x"+src1.toString(16));
            this.visual_info.immediate = true;
        } else {
            mode = this.bits(instruction, 25, 2);
            if(this.bits(instruction, 24, 1)) {
                src1 = this.bits(instruction, 16, 8);
                // Shift over the immediate if operations are being performed on
                // the top 8 bits so the flags are still modified on a carry, etc.
                if(mode == 0x2) { src1 <<= 8; }
                debug("SRC1: 8 bit immediate: 0x"+src1.toString(16));
                this.visual_info.immediate = true;
            } else {
                debug("SRC1: Register source");
                src1 = this.get_from_mode(mode, 
                        this.registers[this.bits(instruction, 16, 3)]);
                this.visual_info.src1_reg = this.bits(instruction, 16, 3);
                this.visual_info.immediate = false;
            }
        }
        
        // Fetch the opcode
        var opcode = this.bits(instruction, 4, 4);
        this.visual_info.opcode = opcode;
        
        // Handle LDR and STR
        if(opcode == 0x0E) {
            // TODO: Warn the user about LDRing undefineds
            
            this.visual_info.src1_reg = undefined;
            this.visual_info.immediate = false;
            
            // The data output goes into src1 and passes right through the ALU
            src1 = system.memory_manager.read8(src0);
            if(!isSafe(src1)) {
                src1 = 0x0000;
            }
            var tmp = system.memory_manager.read8(src0+1);
            if(isSafe(tmp)) {
                src1 |= tmp << 8;
            }
            // The mode (none, top, bottom, full) will be taken into account later
            if(mode == 0x2) { src1 <<= 8; }
        } else if(opcode == 0x0F) {
            // STR can't update flags
            this.visual_info.dest_reg = undefined;
            this.visual_info.flags_updated = false;
            switch(mode) {
                case 0x0: 
                    return;
                case 0x1:
                    system.memory_manager.write8(src0, src1 & 0x000000FF);
                    return;
                case 0x2:
                    system.memory_manager.write8(src0, (src1 >> 8) & 0x000000FF);
                    return;
                case 0x3:
                    system.memory_manager.write16(src0, src1 & 0x0000FFFF);
                    return;
            }
            return;
        } else {
            // Src0 is used for LDRs and STRs as the address, so before it is
            // actually the whole register. Now, it must be updated:
            src0 = this.get_from_mode(mode, src0);
        }
        
        switch(mode) {
            case 0x1: // Bottom updated. Bit shift it into the top of the ALU
                src0 <<= 8;
                src1 <<= 8; // Continue to bit masking
            case 0x2: // Top updated. Mask bits
                src0 &= 0xFF00;
                src1 &= 0xFF00;
                break;
            default:
                break;
        }
        
        // Calculate ALU output
        var out;
        if(src1 == 0 && (opcode == 0x08 || opcode == 0x09)) {
            out = 0;
        } else {
            out = this.opcode_table[opcode](src0, src1);
        }
        debug("Output: 0x"+out.toString(16));
        
        // Update flags
        if(this.bits(instruction, 11, 1) == 1) {
            this.visual_info.flags_updated = true;
            this.cpsr = 0;
            
            // Update C
            if((out & 0xFFFF0000) > 0) { this.cpsr |= this.constants.cpsr_c; }
            
            // Now that we've detected carry, we can remove unused bits
            out &= 0x0000FFFF;
            
            // Update V
            if( (((src0 ^ src1) & 0x00008000) ^ (out & 0x00008000)) > 0 &&
                  opcode > 0x3 && opcode < 0xA && opcode != 0x6 && opcode != 0x8) {
                this.cpsr |= this.constants.cpsr_v;
            }
            
            // Update Z
            if(out == 0) { this.cpsr |= this.constants.cpsr_z; }
            // Update N
            if((out & 0x00008000) > 0) { this.cpsr |= this.constants.cpsr_n; }
        } else {
            this.visual_info.flags_updated = false;
            out &= 0x0000FFFF;
        }
        
        // Store the PC before updating
        var origin_pc = this.registers[this.constants.reg_pc];
        
        // Update the registers
        var new_reg = this.registers[dstr];
        switch(mode) {
            case 0x0: // None updated
                return;
            case 0x1: // Bottom updated
                new_reg &= 0x0000FF00;
                new_reg |= (out >> 8) & 0x000000FF;
                break;
            case 0x2: // Top updated
                new_reg &= 0x000000FF;
                new_reg |= (out >> 0) & 0x0000FF00;
                break;
            case 0x3: // All updated
                new_reg = out;
                break;
        }
        this.registers.splice(dstr, 1, new_reg);
        
        // Check for a halt
        if(dstr == this.constants.reg_pc && 
                this.bits(instruction, 11, 1) == 0) {
            // Since flags are not updated and the PC is,
            // check for a halt condition.
            
            if(this.registers[dstr] == origin_pc-4) {
                system.halt_condition();
            }
        }
    }
}; };

lang_object.visual = {
    props: ['cpu'],
    data: function() {
        return { 
            reg_nm: ["R0","R1","R2","R3","R4","R5 (LR)","R6 (SP)","R7 (NI)"],
            alu_op_nm: ["NONE (MOV)","& (AND)","| (OR)","^ (XOR)","+ (ADD)",
                "- (SUB)","* (UMUL)","* (SMUL)","/ (UDIV)","/ (SDIV)","<< (LSL)",
                ">> (LSR)",">> (ASR)",">> (ROR)","NONE (LDR)","NONE (STR)"]
        };
    },
    template: `
<center class="no-text-select"><svg xmlns="http://www.w3.org/2000/svg" width="448" height="1664" viewBox="0 0 448 768.00001">
  <defs>
    <marker orient="auto" id="vis-arrow-active" overflow="visible">
      <path d="M-4 0l-2 2 7-2-7-2 2 2z"/>
    </marker>
    <marker orient="auto" id="vis-arrow-disabled" overflow="visible">
      <path d="M-4 0l-2 2 7-2-7-2 2 2z"/>
    </marker>
  </defs>
  <g transform="translate(0 -736)">
    <g>
      <title>The ALU - does math</title>
      <path d="M148.5 795.91316v-80l96-48-96-48v-80l192 96v64z" fill="#fff" stroke="#000"/>
      <text y="920.46857" x="141.85938" style="line-height:125%" font-weight="400" font-size="5" font-family="sans-serif" letter-spacing="0" word-spacing="0" transform="translate(148.5 -256.44904)">
        <tspan style="text-align:center" y="920.46857" x="141.85938" font-size="30" text-anchor="middle">ALU</tspan>
        <tspan style="text-align:center" y="938.28705" x="141.85938" font-size="10" text-anchor="middle">Arithmetic Logic Unit</tspan>
      </text>
      <text y="952.41296" x="144.02034" style="line-height:125%" font-weight="400" font-size="5" font-family="sans-serif" letter-spacing="0" word-spacing="0" transform="translate(148.5 -256.44904)">
        <tspan style="text-align:center" y="952.41296" x="144.02034" font-size="12.5" text-anchor="middle">{{alu_op_nm[cpu.visual_info.opcode]}}</tspan>
      </text>
    </g>
    
    <!-- CPSR -->
    <g transform="translate(148 -127.99998)">
      <path class="vis-path-sm vis-path-arrowend" d="M79 892.72215v56" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.flags_updated)"/>
      <path class="vis-path-sm vis-path-arrowend" d="M110.99999 948.72215v-72" v-bind:disabled="!(cpu.visual_info.cond_code_eval)"/>
    </g>
    <g transform="translate(147.4434638 -127.44346223)" font-size="22.5" font-family="sans-serif" text-anchor="middle">
      <title>CPSR - stores data about the results of operations</title>
      
      <path fill="#fff" stroke="#000" stroke-width="1.00878429" stroke-linecap="round" stroke-dashoffset="10" d="M1 955.2h 190.99123v 94.991219h -190.99123z"/>
      <text style="line-height:125%" font-weight="400" font-size="5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
        <tspan style="text-align:center" y="975.69299" x="95.483536" font-size="22.5" text-anchor="middle">Flags</tspan>
      </text>
      
      <!-- CPSR LABELS -->
      <g font-weight="700">
        <text style="line-height:125%" x="39.181293" y="1003.8057">
          <tspan x="39.181293" y="1003.8057">N</tspan>
          <title>N Flag - Result Negative?</title>
        </text>
        <text style="line-height:125%" x="78.763809" y="1003.8057">
          <tspan x="78.763809" y="1003.8057">Z</tspan>
          <title>Z Flag - Result Zero?</title>
        </text>
        <text style="line-height:125%" x="119.76357" y="1003.5859">
          <tspan x="119.76357" y="1003.5859">C</tspan>
          <title>C Flag - Carried a bit?</title>
        </text>
        <text style="line-height:125%" x="159.91737" y="1003.8057">
          <tspan x="159.91737" y="1003.8057">V</tspan>
          <title>V Flag - Overflowed a bit?</title>
        </text>
      </g>
      
      <!-- CPSR VALUES -->
      <g font-weight="400">
        <text style="line-height:125%" x="39.181293" y="1035.5859">
          <tspan x="39.181293" y="1035.5859">{{(cpu.cpsr & cpu.constants.cpsr_n) ? "1" : "0"}}</tspan>
        </text>
        <text style="line-height:125%" x="78.763817" y="1035.9056">
          <tspan x="78.763817" y="1035.9056">{{(cpu.cpsr & cpu.constants.cpsr_z) ? "1" : "0"}}</tspan>
        </text>
        <text style="line-height:125%" x="119.76356" y="1035.5859">
          <tspan x="119.76356" y="1035.5859">{{(cpu.cpsr & cpu.constants.cpsr_c) ? "1" : "0"}}</tspan>
        </text>
        <text style="line-height:125%" x="159.91737" y="1035.8057">
          <tspan x="159.91737" y="1035.8057">{{(cpu.cpsr & cpu.constants.cpsr_v) ? "1" : "0"}}</tspan>
        </text>
      </g>
    </g>
    
    <!-- CONTROL UNIT -->
    <g>
      <title>Control Unit - tells everything what to do</title>
      <path fill="#fff" stroke="#000" stroke-width="1.00878429" d="M148.50439 406.866596h190.99123v94.991219H148.50439z"/>
      <text style="line-height:125%" x="242.927" y="428" font-weight="400" font-family="sans-serif">
        <tspan style="text-align:center" font-size="22.5" text-anchor="middle">Control Unit</tspan>
      </text>
      <text style="line-height:125%" x="155.41408" y="486" font-weight="400" font-family="sans-serif">
        <tspan style="text-align:start" font-size="15">Immediate Out</tspan>
        <title>Immediate - provides numbers with #</title>
      </text>
    </g>
    
    <!-- CENTRAL BUS -->
    <g>
      <title>Central Bus - talks to memory and devices</title>
      <path fill="#fff" stroke="#000" stroke-width=".824256" stroke-linecap="round" stroke-dashoffset="10" d="M16.412134 300.77432h415.17575v47.175743H16.412134z"/>
      <text y="339.97159" x="230.53906" style="line-height:125%" font-weight="400" font-size="5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
        <tspan style="text-align:center" y="339.97159" x="230.53906" font-size="40" text-anchor="middle">Central Bus</tspan>
      </text>
    </g>
    
    <path class="vis-path-sm vis-path-arrowend" d="M147 482.3405H44" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.immediate)"/><!-- IMMEDIATE -->
    
    <path class="vis-path-sm vis-path-arrowend" d="M36 580.36218h106" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.opcode != 0xE && cpu.visual_info.opcode != 0xF)"/><!-- ALU SRC1 IN -->
    <path class="vis-path-sm vis-path-arrowend" d="M84 756.36218h58" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.opcode != 0xE && cpu.visual_info.opcode != 0xF && cpu.visual_info.opcode != 0x0)"/><!-- ALU SRC0 IN -->
    <path class="vis-path-sm vis-path-arrowend" d="M342 668.36218h57.67527" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.opcode != 0xE && cpu.visual_info.opcode != 0xF)"/><!-- ALU OUT -->
    
    <!-- REGISTERS -->
    <g v-for="(reg, i) in cpu.registers" v-bind:transform="'translate(0,'+(128*i).toString()+')'">
      <title>{{reg_nm[i]}} - stores data {{i == 7 ? 'and stores where the next instruction is' : i == 6 ? 'and stores where the stack is' : i == 5 ? 'and stores the old NI (r7) value' : ''}}</title>
      
      <path fill="none" stroke="#000" stroke-width="1.00878429" d="M148.5043921 956.8666h190.99123v94.991219h-190.99123z"/>
      
      <!-- REGISTER NAME -->
      <text style="line-height:125%" font-weight="400" font-family="sans-serif" font-size="22.5" text-anchor="middle">
        <tspan x="242.9269998" y="976.24953" style="text-align:center">{{reg_nm[i]}}</tspan>
      </text>
      
      <!-- REGISTER DATA DUMPS -->
      <g transform="translate(147.4434638 .55654)" font-weight="400" style="text-align:center; line-height:125%" font-size="18" font-family="sans-serif">
        <text x="97.007713" y="995.65918" text-anchor="middle">
          <tspan>{{("0000000000000000" + (+reg).toString(2)).slice(-16).replace(/(.{4})/g,"$1 ")}}</tspan>
        </text>
        <text x="94.910057" y="1019.6592" text-anchor="middle">
          <tspan>{{("0000" + (+reg).toString(16)).slice(-4).replace(/(.{1})/g,"$1 ")}}</tspan>
        </text>
        <text x="7.9706025" y="1043.6592" style="text-align:start;">
          <tspan>{{("00000" + (+reg).toString(10)).slice(-5)}}</tspan>
        </text>
        <text x="186.33192" y="1043.6592" style="text-align:end;" text-anchor="end">
          <tspan>{{(reg&0x8000 ? "-" : "+")+("00000" + (reg&0x8000 ? +(reg ^ 0xffff) : +(reg)).toString(10)).slice(-5)}}</tspan>
        </text>
      </g>
      
      <!-- REGISTER ARROWS -->
      <g transform="translate(144.22906 -478.45512)">
        <path class="vis-path-sm vis-path-arrowend" d="M2.77094 1466.8173h-103" v-bind:disabled="!(cpu.visual_info.src1_reg == i && !cpu.visual_info.immediate && cpu.visual_info.opcode != 0xE)"/><!-- SRC1 OUT -->
        <path class="vis-path-sm vis-path-arrowend" d="M3.1276622 1498.8173H-52.22906" v-bind:disabled="!(cpu.visual_info.src0_reg == i && cpu.visual_info.opcode != 0x0)"/><!-- SRC0 OUT -->
        <path class="vis-path-sm vis-path-arrowend" d="M260.37621 1482.8173h-57.67527" v-bind:disabled="!(cpu.visual_info.dest_reg == i && cpu.visual_info.opcode != 0xF)"/><!-- DEST IN -->
      </g>
    </g>
    
    <!-- CENTRAL BUS I/O -->
    <path class="vis-path vis-path-arrowend" d="M36 412.3622v-48" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.opcode == 0xF)"/><!-- SRC1 OUT -->
    <path class="vis-path vis-path-arrowend" d="M84 412.3622v-48" v-bind:disabled="!(cpu.visual_info.execd && (cpu.visual_info.opcode == 0xE || cpu.visual_info.opcode == 0xF))"/><!-- SRC0 OUT -->
    <path class="vis-path-sm vis-path-arrowend" d="M408 350.3622v52.08475" v-bind:disabled="!(cpu.visual_info.execd && cpu.visual_info.opcode == 0xE)"/><!-- DEST IN -->
    <path class="vis-path-sm vis-path-arrowend" d="M250.02171 350.3622l.00029 50"/><!-- CTRL UNIT -->
    
    <path class="vis-path" d="M408 412.3622v1520.0001"/> <!-- DEST LINE -->
    <path class="vis-path" d="M36 412.3622v1520.0001"/> <!-- SRC1 LINE -->
    <path class="vis-path" d="M84 412.3622v1520.0001"/> <!-- SRC0 LINE -->
  </g>
</svg></center>
`
};

// Copied & Modified from the original CodeMirror GAS mode by KB1RD
CodeMirror.defineMode("LearnASM", function(_config, parserConfig) {
  'use strict';

  // If an architecture is specified, its initialization function may
  // populate this array with custom parsing functions which will be
  // tried in the event that the standard functions do not find a match.
  var custom = [];

  // The symbol used to start a line comment changes based on the target
  // architecture.
  // If no architecture is pased in "parserConfig" then only multiline
  // comments will have syntax support.
  var lineCommentStartSymbol = "";

  // Custom directives are used.
  var directives = {
    ".origin" : "builtin",
    ".seek" : "builtin",
    ".location" : "builtin",
    ".word" : "builtin",
    ".byte" : "builtin"
  };

  var registers = {};
  
  lineCommentStartSymbol = ";";
  directives.syntax = "builtin";

  registers.r0  = "variable";
  registers.r1  = "variable";
  registers.r2  = "variable";
  registers.r3  = "variable";
  registers.r4  = "variable";

  registers.sp  = "variable-2";
  registers.lr  = "variable-2";
  registers.pc  = "variable-2";
  registers.ni  = "variable-2";
  registers.r5 = registers.sp;
  registers.r6 = registers.lr;
  registers.r7 = registers.pc;

  custom.push(function(ch, stream) {
    if (ch === '#') {
      stream.eatWhile(/\w/);
      return "number";
    }
  });

  function nextUntilUnescaped(stream, end) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (next === end && !escaped) {
        return false;
      }
      escaped = !escaped && next === "\\";
    }
    return escaped;
  }

  function clikeComment(stream, state) {
    var maybeEnd = false, ch;
    while ((ch = stream.next()) != null) {
      if (ch === "/" && maybeEnd) {
        state.tokenize = null;
        break;
      }
      maybeEnd = (ch === "*");
    }
    return "comment";
  }

  return {
    startState: function() {
      return {
        tokenize: null
      };
    },

    token: function(stream, state) {
      if (state.tokenize) {
        return state.tokenize(stream, state);
      }

      if (stream.eatSpace()) {
        return null;
      }

      var style, cur, ch = stream.next();

      if (ch === "/") {
        if (stream.eat("*")) {
          state.tokenize = clikeComment;
          return clikeComment(stream, state);
        }
      }

      if (ch === lineCommentStartSymbol) {
        stream.skipToEnd();
        return "comment";
      }

      if (ch === '"') {
        nextUntilUnescaped(stream, '"');
        return "string";
      }

      if (ch === '.') {
        stream.eatWhile(/\w/);
        cur = stream.current().toLowerCase();
        style = directives[cur];
        return style || null;
      }

      if (ch === '=') {
        stream.eatWhile(/\w/);
        return "tag";
      }

      if (ch === '{') {
        return "braket";
      }

      if (ch === '}') {
        return "braket";
      }

      if (/\d/.test(ch)) {
        if (ch === "0" && stream.eat("x")) {
          stream.eatWhile(/[0-9a-fA-F]/);
          return "number";
        }
        stream.eatWhile(/\d/);
        return "number";
      }

      if (/\w/.test(ch)) {
        stream.eatWhile(/\w/);
        if (stream.eat(":")) {
          return 'tag';
        }
        cur = stream.current().toLowerCase();
        style = registers[cur];
        return style || null;
      }

      for (var i = 0; i < custom.length; i++) {
        style = custom[i](ch, stream, state);
        if (style) {
          return style;
        }
      }
    },

    lineComment: lineCommentStartSymbol,
    blockCommentStart: "/*",
    blockCommentEnd: "*/"
  };
});

export default lang_object
