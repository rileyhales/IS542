/*========================================================================
 * FILE:    scriptures.js
 * AUTHOR:  Riley Hales as directed by Stephen W. Liddle
 * DATE:    Winter 2021
 *
 * DESCRIPTION: Front-end JavaScript code for the Scriptures, Mapped.
 *              IS 542, Winter 2021, BYU.
 */
/*jslint
    browser, long, fudge
*/
/*global
    console, map, google, window, $
*/
/*property
    books, forEach, init, maxBookId, minBookId, onerror, onload, open, parse,
    push, response, send, status, classKey, content, href, id, numChapters,
    onerror, onload, open, parse, response, send, status, gridName, getElementById,
    hash, innerHTML, fullName, split, slice, log, length, onHashChanged, tocName,
    position, title, label, animation, lat, lng, map, Animation, DROP, maps, Marker,
    setMap, getElementsByClassName, every, location, parentBookId, onHashChange,
    showLocation, exec, getAttribute, querySelectorAll, panTo, setZoom, zoom,
    LatLngBounds, fitBounds, extend, text, includes, then, css, opacity, left, panTo,
    animate, numChapters, parentBookId, gridName, width
*/

import HTML from "./htmlHelpers.js";
import MAP from "./mapTools.js";
import UTILS from "./hashUtils.js";

/*-------------------------------------------------------------------
 *                      CONSTANTS
 */
const ANIMATE_TIME = 350;
const BOTTOM_PADDING = "<br /><br />";
const CLASS_VOLUME = "volume";
const DIV_CRUMBS_NAV = "crumbnav";
const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
const DIV_SCRIP1 = "scrip1";
const DIV_SCRIP2 = "scrip2";
const CLASS_BOOKS = "books";
const CLASS_CHAPTER = "chapter";
const CLASS_BUTTON = "btn";
const TAG_HEADER5 = "h5";
const URL_BASE = "https://scriptures.byu.edu/";
const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;
const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;

/*-------------------------------------------------------------------
 *                      PRIVATE VARIABLES
 */
let animateType = "crossfade";
let books;
let volumes;
let scripDivOnScreen = DIV_SCRIP1;
let scripDivOffScreen = DIV_SCRIP2;

/*-------------------------------------------------------------------
 *         REMAINING PRIVATE METHODS (NAVIGATION STUFF), ALPHABETICAL
 */

const crossfade = function () {
    $(`#${scripDivOffScreen}`).css({"left": "0px", "opacity": 0});
    $(`#${scripDivOffScreen}`).animate({"opacity": 1, "z-index": 2}, {"duration": ANIMATE_TIME});
    $(`#${scripDivOnScreen}`).animate({"opacity": 0, "z-index": 1}, {"duration": ANIMATE_TIME});
    switchVisibleDivTracker();
};

const breadcrumbs = function () {
    let currentHash = UTILS.getCurrentHash();
    let crumbDiv = document.getElementById(DIV_CRUMBS_NAV);
    crumbDiv.innerHTML = HTML.hashlink(undefined, undefined, undefined, "Home", "Home");
    if (currentHash === undefined) {
        return;
    }
    if (currentHash.length >= 1) {
        crumbDiv.innerHTML += ` > ${HTML.hashlink(currentHash[0], undefined, undefined, volumes[currentHash[0] - 1].fullName, volumes[currentHash[0] - 1].fullName)}`;
    }
    if (currentHash.length >= 2) {
        crumbDiv.innerHTML += ` > ${HTML.hashlink(currentHash[0], currentHash[1], undefined, books[currentHash[1]].fullName, books[currentHash[1]].fullName)}`;
    }
    if (currentHash.length >= 3) {
        crumbDiv.innerHTML += ` > ${HTML.hashlink(currentHash[0], currentHash[1], currentHash[2], currentHash[2], currentHash[2])}`;
    }
};

const switchVisibleDivTracker = function () {
    if (scripDivOnScreen === DIV_SCRIP1) {
        scripDivOnScreen = DIV_SCRIP2;
        scripDivOffScreen = DIV_SCRIP1;
    } else {
        scripDivOnScreen = DIV_SCRIP1;
        scripDivOffScreen = DIV_SCRIP2;
    }
};

const getNextHash = function (bookId, chapter) {
    let book = books[bookId];
    if (book !== undefined) {
        if (chapter < book.numChapters) {
            return [book.parentBookId, bookId, chapter + 1, titleForBookChapter(book, chapter + 1)];
        }
        let nextBook = books[bookId + 1];
        if (nextBook !== undefined) {
            let nextChapterValue = 0;
            if (nextBook.numChapters > 0) {
                nextChapterValue = 1;
            }
            return [nextBook.parentBookId, nextBook.id, nextChapterValue, titleForBookChapter(nextBook, nextChapterValue)];
        }
    }
};

const getPreviousHash = function (bookId, chapter) {
    let book = books[bookId];
    if (book !== undefined) {
        if (chapter > 1) {
            return [book.parentBookId, bookId, chapter - 1, titleForBookChapter(book, chapter - 1)];
        }
        let previousBook = books[bookId - 1];
        if (previousBook !== undefined) {
            return [previousBook.parentBookId, previousBook.id, previousBook.numChapters, titleForBookChapter(previousBook, previousBook.numChapters)];
        }
    }
};

const titleForBookChapter = function (book, chapter) {
    if (book !== undefined) {
        if (chapter > 0) {
            return `${book.tocName} ${chapter}`;
        }
        return book.tocName;
    }
};

const volumesGridContent = function (volumeId) {
    let gridContent = "";

    volumes.forEach(function (volume) {
        if (volumeId === undefined || volumeId === volume.id) {
            gridContent += HTML.div({
                classKey: CLASS_VOLUME,
                content: HTML.anchor(volume) + HTML.element(TAG_HEADER5, volume.fullName)
            });

            gridContent += HTML.div({
                classKey: CLASS_BOOKS,
                content: booksGridContent(volume)
            });
        }
    });

    return gridContent + BOTTOM_PADDING;
};

const booksGridContent = function (volume) {
    let gridContent = "";

    volume.books.forEach(function (book) {
        gridContent += HTML.link({
            classKey: CLASS_BUTTON,
            id: book.id,
            href: `#${volume.id}:${book.id}`,
            content: book.gridName
        });
    });

    return gridContent;
};

const chaptersGrid = function (book) {
    return HTML.div({
        classKey: CLASS_BOOKS,
        content: HTML.element(TAG_HEADER5, book.fullName)
    }) + HTML.div({
        classKey: CLASS_BOOKS,
        content: chaptersGridContent(book)
    });
};

const chaptersGridContent = function (book) {
    let gridContent = "";
    let chapter = 1;

    while (chapter <= book.numChapters) {
        gridContent += HTML.link({
            classKey: `${CLASS_BUTTON} ${CLASS_CHAPTER}`,
            id: chapter,
            href: `#${book.parentBookId}:${book.id}:${chapter}`,
            content: chapter
        });
        chapter += 1;
    }

    return gridContent;
};

const bookChapterValid = function (bookId, chapter) {
    let book = books[bookId];
    if (book === undefined || chapter < 0 || chapter > book.numChapters) {
        return false;
    }
    if (chapter === 0 && book.numChapters > 0) {
        return false;
    }
    return true;
};

const cacheBooks = function (callback) {
    volumes.forEach(function (volume) {
        let volumeBooks = [];
        let bookId = volume.minBookId;

        while (bookId <= volume.maxBookId) {
            volumeBooks.push(books[bookId]);
            bookId += 1;
        }

        volume.books = volumeBooks;
    });

    if (typeof callback === "function") {
        callback();
    }
};

const encodedScripturesUrl = function (bookId, chapter, verses, isJst) {
    if (bookId !== undefined && chapter !== undefined) {
        let options = "";
        if (verses !== undefined) {
            options += verses;
        }
        if (isJst !== undefined) {
            options += verses;
        }

        return `${URL_SCRIPTURES}?book=${bookId}&chap=${chapter}&verses=${options}`;
    }
};



const getScripturesCallback = function (chapterHtml) {
    // Generate the next/previous buttons
    let currentHash = UTILS.getCurrentHash();
    let prevHash = getPreviousHash(Number(currentHash[1]), Number(currentHash[2]));
    let previousButton = (prevHash === undefined ? "" : HTML.nextbutton(prevHash[0], prevHash[1], prevHash[2], "Previous"));
    let nextHash = getNextHash(Number(currentHash[1]), Number(currentHash[2]));
    let nextButton = (nextHash === undefined ? "" : HTML.nextbutton(nextHash[0], nextHash[1], nextHash[2], "Next"));

    // assign content and next/previous buttons to offscreen div
    let offscreendiv = document.getElementById(scripDivOffScreen);
    offscreendiv.innerHTML = chapterHtml;
    offscreendiv.getElementsByClassName("divtitle")[0].innerHTML += `<br>${previousButton} ${nextButton}`;

    // handle the sliding animations
    let width = $("#scriptures").width();
    if (animateType === "Next") {
        $(`#${scripDivOffScreen}`).css({"left": `${width}px`, "opacity": 1});
        $(`#${scripDivOnScreen}`).animate({"left": `-${width}px`}, {"duration": ANIMATE_TIME});
        $(`#${scripDivOffScreen}`).animate({"left": "0px"}, {"duration": ANIMATE_TIME});
        switchVisibleDivTracker();
    } else if (animateType === "Previous") {
        $(`#${scripDivOffScreen}`).css({"left": `-${width}px`, "opacity": 1});
        $(`#${scripDivOnScreen}`).animate({"left": `${width}px`}, {"duration": ANIMATE_TIME});
        $(`#${scripDivOffScreen}`).animate({"left": "0px"}, {"duration": ANIMATE_TIME});
        switchVisibleDivTracker();
    } else if (animateType === "crossfade") {
        crossfade();
    }

    animateType = "crossfade";
    MAP.setupMarkers();
};

const getScripturesFailure = function (err) {
    console.log(err);
    document.getElementById(scripDivOnScreen).innerHTML = "Unable to retrieve chapter from database";
};

const init = function (callback) {
    let booksLoaded = false;
    let volumesLoaded = false;

    fetch(URL_BOOKS)
        .then(response => {
            return response.json()
        })
        .then(function (data) {
            books = data;
            booksLoaded = true;
            if (volumesLoaded) {
                cacheBooks(callback);
            }
        });
    fetch(URL_VOLUMES)
        .then(response => {
            return response.json()
        })
        .then(function (data) {
            volumes = data;
            volumesLoaded = true;

            if (booksLoaded) {
                cacheBooks(callback);
            }
        });
};

const navigateBook = function (bookId) {
    let book = books[bookId];
    if (book.numChapters <= 1) {
        navigateChapter(bookId, book.numChapters);
    } else {
        document.getElementById(scripDivOffScreen).innerHTML = HTML.div({
            id: "divtitle",
            content: chaptersGrid(book)
        });
        crossfade();
    }
};

const navigateChapter = function (bookId, chapter) {
    fetch(encodedScripturesUrl(bookId, chapter))
        .then(response => {
            return response.text()
        })
        .then(data => {
            getScripturesCallback(data)
        })
        .catch(error => {
            getScripturesFailure(error)
        })
};

const navigateHome = function (volumeId) {
    document.getElementById(scripDivOffScreen).innerHTML = HTML.div({
        id: DIV_SCRIPTURES_NAVIGATOR,
        content: volumesGridContent(volumeId)
    });
    crossfade();
};

const onHashChange = function () {
    let ids = [];

    if (location.hash !== "" && location.hash.length > 1) {
        ids = UTILS.getCurrentHash();
    }

    MAP.clearMarkers();
    breadcrumbs();

    if (ids.length <= 0) {
        navigateHome();
    } else if (ids.length === 1) {
        let volumeId = Number(ids[0]);
        if (volumeId < volumes[0].id || volumeId > volumes.slice(-1)[0].id) {
            navigateHome();
        } else {
            navigateHome(volumeId);
        }
    } else if (ids.length >= 2) {
        let bookId = Number(ids[1]);
        if (books[bookId] === undefined) {
            navigateHome();
        } else {
            if (ids.length === 2) {
                navigateBook(bookId);
            } else {
                let chapter = Number(ids[2]);
                if (bookChapterValid(bookId, chapter)) {
                    navigateChapter(bookId, chapter);
                } else {
                    navigateHome();
                }
            }
        }
    }
    MAP.zoomMap();
};

const transition = function (volume, book, chapter, nextprevious) {
    animateType = nextprevious;
    UTILS.setHash(volume, book, chapter);
};

/*-------------------------------------------------------------------
 *                      PUBLIC API
 */

const ScripApi = {
    init,
    onHashChange,
    setHash: UTILS.setHash,
    showLocation: MAP.showLocation,
    transition,
}

export default Object.freeze(ScripApi);
