// These are used so frequently that they should be exported to the window scope

// Why use this? Simple: An "if" statement evaluates 0 to false as well, so
// checking for "safe" numbers doesn't work. It might be a bit over used though...
window.isSafe = function(val) {
    return !(val == undefined || val == null);
}

// Default to a "safe" value
window.default_safe = function(val, def) {
    if(!isSafe(val)) {
        return def;
    }
    return val;
}

// Default each element in an object to a safe value. Not recursive.
window.default_object = function(object, def) {
    Object.keys(def).forEach(function(item, index) {
        object[item] = default_safe(object[item], def[item]);
    });
}

// This makes me sick, but it looks to be the only way to deep copy stuff in JS
window.make_copy = function(obj) {
    var blank = {};
    if(obj instanceof Array) {
        blank = [];
    }
    return Object.assign(blank, obj);
}

// A function that's basically parseInt but that supports 0b
window.parseIntExtended = function(str) {
    if(str.startsWith("0b")) {
        // I have no idea why JS doesn't support this
        return parseInt(str.substr(2, str.length), 2);
    } else {
        return parseInt(str);
    }
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

window.escapeHtml = function(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}
