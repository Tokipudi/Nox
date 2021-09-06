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