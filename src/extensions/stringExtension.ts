String.prototype.capitalize = function (this : string) {
    if (this.length == 0) {
        return this;
    }
    return this[0].toUpperCase() + this.slice(1);
};