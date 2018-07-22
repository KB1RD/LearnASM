// A simple page controller that tracks the current page and figures out
// where the page is on the remote server. It's not the most beautiful thing in
// the world, but it does its job.
// It currently does not support loading a different page in the internal view
// withour reloading the whole page, but the implementation of that is possible.
global.page_controller = {
    pages: [],
    home_page_title: "Home",
    
    current_page: undefined,
    next_page: undefined,
    last_page: undefined,
    
    // A function for internal use that adds the path variable to a page and its
    // children
    add_page_paths_recursive: function(page, path) {
        var newpath = make_copy(path);
        newpath.push(page.name);
        
        page.path = newpath;
        page.goto = function() {
            window.location.search = "?"+this.path.join("/");
        };
        
        if(!page.children) {
            return;
        }
        for(var i = 0; i<page.children.length; i++) {
            this.add_page_paths_recursive(page.children[i], newpath);
        }
    },
    
    add_page: function(page) {
        this.add_page_paths_recursive(page, []);
        this.pages.push(page);
    },
    
    // Given a path, set the current page
    set_current_page: function(path) {
        // Check that we actually have a path
        if(!path) {
            this.current_page = undefined;
            this.next_page = undefined;
            this.last_page = undefined;
            return false;
        }
        
        // Now try to search for it
        this.current_page = this.find_page_with_path(this.pages, path);
        if(!this.current_page) {
            this.set_current_page(undefined);
            return false;
        }
        
        this.next_page = this.get_next_page(this.current_page.path);
        this.last_page = this.get_last_page(this.current_page.path);
        
        return true;
    },
    
    // Look at the URL in the URL bar and figure out what the page should be
    set_current_page_from_location: function() {
        var page = window.location.search;
        // Check that we're actually given a page
        if(page && page.startsWith("?")) {
            page = page.substr(1, page.length);
            
            // Remove leading slashes
            while(page.startsWith("/")) {
                page = page.substr(1, page.length);
            }
        } else {
            this.set_current_page(undefined);
            return false;
        }
        
        // Now, search for that page
        return this.set_current_page(page.split("/"));
    },
    
    // Given an array of page objects, find a page w/ a name
    find_page_with_name: function(ctx, name) {
        for(var i = 0; i<ctx.length; i++) {
            if(ctx[i].name == name) {
                return ctx[i];
            }
        }
        
        return undefined;
    },
    
    find_page_with_path: function(ctx, path) {
        if(path.length == 1) {
            return this.find_page_with_name(ctx, path[0]);
        } else {
            var page = this.find_page_with_name(ctx, path[0]);
            if(!page || !page.children) {
                return undefined;
            }
            
            var new_path = path.slice(1, path.length);
            return this.find_page_with_path(page.children, new_path);
        }
    },
    
    get_next_page: function(path) {
        if(!path || path.length == 0) {
            return undefined;
        }
        
        var child_name = path[path.length-1];
        var parent_path = path.slice(0, path.length-1);
        var parent = this.find_page_with_path(this.pages, parent_path);
        var children;
        if(!parent || !parent.children) {
            return undefined;
        }
        children = parent.children;
        
        // Search for the the next child in the parent's children
        var next_item = undefined;
        for(var i = 0; i<children.length; i++) {
            if(children[i].name === child_name) {
                // This will be undefined if there is no next, at which point
                // the parent's next's child will be used
                next_item = children[i+1];
                break;
            }
        }
        
        // Go over to the parent's next to find a child
        if(!next_item) {
            next_item = this.get_next_page(parent_path);
            if(!next_item) {
                return undefined;
            }
            if(next_item.children && next_item.children.length > 0) {
                next_item = next_item.children[0];
            }
        }
        return next_item;
    },
    get_last_page: function(path) {
        if(!path || path.length == 0) {
            return undefined;
        }
        
        var child_name = path[path.length-1];
        var parent_path = path.slice(0, path.length-1);
        var parent = this.find_page_with_path(this.pages, parent_path);
        var children;
        if(!parent || !parent.children) {
            return undefined;
        }
        children = parent.children;
        
        // Search for the the last child in the parent's children
        var last_item = undefined;
        for(var i = 0; i<children.length; i++) {
            if(children[i].name === child_name) {
                // This will be undefined if there is no last, at which point
                // the parent's last's child will be used
                last_item = children[i-1];
                break;
            }
        }
        
        // Go over to the parent's last to find a child
        if(!last_item) {
            last_item = this.get_last_page(parent_path);
            if(!last_item) {
                return undefined;
            }
            if(last_item.children && last_item.children.length > 0) {
                last_item = last_item.children[last_item.children.length-1];
            }
        }
        return last_item;
    },
    
    // Find the URL of a page on the server at a given base address
    get_current_page_url: function(base) {
        if(!this.current_page || !this.current_page.path) {
            return undefined;
        }
        
        var url = "";
        
        url += base;
        if(!base.endsWith("/")) {
            url += "/";
        }
        
        url += this.current_page.path.join("/");
        
        url += ".html";
        
        return url;
    }
};


// -------------------------------------------------------------------------- //
// Page additions right here!!!!

global.page_controller.add_page({title: "Step by Step", name: "lesson1", children: [
    {title: "Getting Started", name: "part1", children: [
        {title: "Computers in a Nutshell", name: "page1"},
        {title: "Your First Program", name: "page2"},
        {title: "MOVing Data", name: "page3"},
        {title: "MOVing MOVs", name: "page4"}
    ]}
]});

global.page_controller.add_page({title: "Coming Soon!", name:"coming_soon"});

// -------------------------------------------------------------------------- //

global.qna = {};

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
