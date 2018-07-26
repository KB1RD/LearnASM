// Really sketchy cookie manager
export var CookieManager = {
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

export var options = {};
export var loadOptions = function() {
    options = CookieManager.load_json_cookie("options");
    default_object(options, {enable_debug: false});
};
export var saveOptions = function() {
    CookieManager.save_json_cookie("options", options);
};

export var FileManager = {
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
}
