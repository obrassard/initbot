"use strict";
String.prototype.capitalize = function () {
    if (this.length == 0) {
        return this;
    }
    return this[0].toUpperCase() + this.slice(1);
};
