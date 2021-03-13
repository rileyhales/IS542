const getCurrentHash = function () {
    let currentHash = window.location.hash.slice(1).split(":");
    if (currentHash.length === 1 && currentHash[0] === "") {
        return undefined;
    }
    return currentHash;
};


const setHash = function (volumeId, bookId, chapterId) {
    window.location.hash = `#${(volumeId === undefined ? "" : volumeId)}${(bookId === undefined ? "" : ":" + bookId)}${(chapterId === undefined ? "" : ":" + chapterId)}`;
};

const UTILS = {
    getCurrentHash,
    setHash
};

export default Object.freeze(UTILS)