export function shuffleArray(array) {
    var currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

/**
 * 
 * @param minPercentage a float between 0 and 1
 * @param maxInt
 * @returns 
 */
export function getRandomIntInclusive(minPercentage, maxInt) {
    let min = Math.ceil(minPercentage * maxInt);
    let max = Math.floor(maxInt);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getFromBetween = {
    results: [],
    string: "",
    getFromBetween: function (sub1, sub2) {
        if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1) + sub1.length;
        var string1 = this.string.substr(0, SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP, TP);
    },
    removeFromBetween: function (sub1, sub2) {
        if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
        this.string = this.string.replace(removal, "");
    },
    getAllResults: function (sub1, sub2) {
        // first check to see if we do have both substrings
        if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

        // find one result
        var result = this.getFromBetween(sub1, sub2);
        // push it to the results array
        this.results.push(result);
        // remove the most recently found one from the string
        this.removeFromBetween(sub1, sub2);

        // if there's more substrings
        if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1, sub2);
        }
        else return;
    },
    get: function (string, sub1, sub2) {
        this.results = [];
        this.string = string;
        this.getAllResults(sub1, sub2);
        return this.results;
    }
};