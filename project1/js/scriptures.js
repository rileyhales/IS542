/*========================================================================
 * FILE:    scriptures.js
 * AUTHOR:  Stephen W. Liddle
 * DATE:    Winter 2021
 *
 * DESCRIPTION: Front-end JavaScript code for the Scriptures, Mapped.
 *              IS 542, Winter 2021, BYU.
 */
/*jslint
    browser
    long
*/
/*property
    books, forEach, init, maxBookId, minBookId, onerror, onload, open, parse,
    push, response, send, status, classKey, content, href, id, numChapters,
    onerror, onload, open, parse, response, send, status, gridName, getElementById,
    hash, innerHTML, fullName, split, slice, log, length, onHashChanged, tocName
*/

const Scriptures = (function () {
    "use strict";

    /*-------------------------------------------------------------------
     *                      CONSTANTS
     */
    const URL_BASE = "https://scriptures.byu.edu/";
    const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
    const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;
    const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
    const BOTTOM_PADDING = "<br /><br />";
    const CLASS_BOOKS = "books";
    const CLASS_CHAPTER = "chapter";
    const CLASS_BUTTON = "btn";
    const CLASS_VOLUME = "volume";
    const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
    const DIV_SCRIPTURES = "scriptures";
    const REQUEST_GET = "GET";
    const REQUEST_STATUS_OK = 200;
    const REQUEST_STATUS_ERROR = 400;
    const TAG_HEADER5 = "h5";

    /*-------------------------------------------------------------------
     *                      PRIVATE VARIABLES
     */
    let books;
    let volumes;

    /*-------------------------------------------------------------------
     *                      PRIVATE METHOD DECLARATIONS
     */
    let ajax;
    let bookChapterValid;
    let booksGrid;
    let booksGridContent;
    let cacheBooks;
    let chaptersGrid;
    let chaptersGridContent;
    let encodedScripturesUrl;
    let getScripturesCallback;
    let getScripturesFailure;
    let hash;
    let htmlAnchor;
    let htmlDiv;
    let htmlElement;
    let htmlHashLink;
    let htmlLink;
    let init;
    let navigateBook;
    let navigateChapter;
    let navigateHome;
    let nextChapter;
    let onHashChanged;
    let previousChapter;
    let titleForBookChapter;
    let volumesGridContent;

    /*-------------------------------------------------------------------
     *                      HTML BUILDING FUNCTIONS
     */
    htmlAnchor = function (volume) {
        return `<a name="v${volume.id}" />`;
    };
    htmlDiv = function (parameters) {
        let classString = (parameters.classKey === undefined ? "" : ` class="${parameters.classKey}"`);
        let contentString = (parameters.content === undefined ? "" : parameters.content);
        let idString = (parameters.id === undefined ? "" : ` id="${parameters.id}"`);
        return `<div${idString}${classString}>${contentString}</div>`;
    };
    htmlElement = function (tagName, content) {
        return `<${tagName}>${content}</${tagName}>`;
    };
    htmlLink = function (parameters) {
        let classString = (parameters.classKey === undefined ? "" : ` class="${parameters.classKey}"`);
        let contentString = (parameters.content === undefined ? "" : parameters.content);
        let idString = (parameters.id === undefined ? "" : ` id="${parameters.id}"`);
        let hrefString = (parameters.href === undefined ? "" : ` href="${parameters.href}"`);
        return `<a${idString}${classString}${hrefString}>${contentString}</a>`;
    };
    htmlHashLink = function (hashArguments, title, content) {
        return `<a href="javascript:void(0)" onclick="Scriptures.hash(${hashArguments})" title="${title}">${content}</a>`;
    };


    /*-------------------------------------------------------------------
     *                      PRIVATE METHODS
     */
    ajax = function (url, successCallback, failureCallback, skipJsonParse) {
        let request = new XMLHttpRequest();

        request.open(REQUEST_GET, url, true);

        request.onload = function () {
            if (request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR) {
                let data = (skipJsonParse ? request.response : JSON.parse(request.response));

                if (typeof successCallback === "function") {
                    successCallback(data);
                }
            } else {
                if (typeof failureCallback === "function") {
                    failureCallback(request);
                }
            }
        };

        request.onerror = failureCallback;
        request.send();
    };

    bookChapterValid = function (bookId, chapter) {
        let book = books[bookId];
        if (book === undefined || chapter < 0 || chapter > book.numChapters) {
            return false;
        }
        if (chapter === 0 && book.numChapters > 0) {
            return false;
        }
        return true;
    };

    booksGrid = function (volume) {
        return htmlDiv({
            classKey: CLASS_BOOKS,
            content: booksGridContent(volume)
        });
    };

    booksGridContent = function (volume) {
        let gridContent = "";

        volume.books.forEach(function (book) {
            gridContent += htmlLink({
                classKey: CLASS_BUTTON,
                id: book.id,
                href: `#${volume.id}:${book.id}`,
                content: book.gridName
            });
        });

        return gridContent;
    };

    chaptersGrid = function (book) {
        return htmlDiv({
            classKey: CLASS_BOOKS,
            content: htmlElement(TAG_HEADER5, book.fullName)
        }) + htmlDiv({
            classKey: CLASS_BOOKS,
            content: chaptersGridContent(book)
        });
    };

    chaptersGridContent = function (book) {
        let gridContent = "";
        let chapter = 1;

        while (chapter <= book.numChapters) {
            gridContent += htmlLink({
                classKey: `${CLASS_BUTTON} ${CLASS_CHAPTER}`,
                id: chapter,
                href: `#0:${book.id}:${chapter}`,
                content: chapter
            });
            chapter += 1;
        }

        return gridContent;
    };

    cacheBooks = function (callback) {
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

    encodedScripturesUrl = function (bookId, chapter, verses, isJst) {
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

    getScripturesCallback = function (chapterHtml) {
        document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;

        // Add the previous and next buttons
        let currentHash = location.hash.slice(1).split(":");
        let prevHash = previousChapter(Number(currentHash[1]), Number(currentHash[2]));
        let previousButton = (prevHash === undefined ? "" : htmlHashLink([0, prevHash[0], prevHash[1]], prevHash[2], "Previous"));
        let nextHash = nextChapter(Number(currentHash[1]), Number(currentHash[2]));
        let nextButton = (nextHash === undefined ? "" : htmlHashLink([0, nextHash[0], nextHash[1]], nextHash[2], "Next"));
        document.getElementsByClassName("divtitle")[0].innerHTML += `${previousButton}${nextButton}`;

        // todo setupMarkers()
    };

    getScripturesFailure = function () {
        document.getElementById(DIV_SCRIPTURES).innerHTML = "Unable to retrieve chapter from database";
    };

    hash = function () {
        window.location.hash = `#${arguments[0]}:${arguments[1]}:${arguments[2]}`;
    };


    init = function (callback) {
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax(URL_BOOKS, function (data) {
            books = data;
            booksLoaded = true;

            if (volumesLoaded) {
                cacheBooks(callback);
            }
        });
        ajax(URL_VOLUMES, function (data) {
            volumes = data;
            volumesLoaded = true;

            if (booksLoaded) {
                cacheBooks(callback);
            }
        });
    };

    navigateBook = function (bookId) {
        let book = books[bookId];
        if (book.numChapters <= 1) {
            navigateChapter(bookId, book.numChapters);
        } else {
            document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv({
                id: DIV_SCRIPTURES,
                content: chaptersGrid(book)
            });
        }
    };
    navigateChapter = function (bookId, chapter) {
        ajax(encodedScripturesUrl(bookId, chapter), getScripturesCallback, getScripturesFailure, true);
    };

    navigateHome = function (volumeId) {
        document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv({
            id: DIV_SCRIPTURES_NAVIGATOR,
            content: volumesGridContent(volumeId)
        });
    };

    onHashChanged = function () {
        let ids = [];

        if (location.hash !== "" && location.hash.length > 1) {
            ids = location.hash.slice(1).split(":");
        }

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
    };

    previousChapter = function (bookId, chapter) {
        let book = books[bookId];
        if (book !== undefined) {
            if (chapter > 1) {
                return [bookId, chapter - 1, titleForBookChapter(book, chapter - 1)];
            }
            let previousBook = books[bookId - 1];
            if (previousBook !== undefined) {
                return [previousBook.id, previousBook.numChapters, titleForBookChapter(previousBook, previousBook.numChapters)];
            }
        }
    };

    nextChapter = function (bookId, chapter) {
        let book = books[bookId];
        if (book !== undefined) {
            if (chapter < book.numChapters) {
                return [bookId, chapter + 1, titleForBookChapter(book, chapter + 1)];
            }
            let nextBook = books[bookId + 1];
            if (nextBook !== undefined) {
                let nextChapterValue = 0;
                if (nextBook.numChapters > 0) {
                    nextChapterValue = 1;
                }
                return [nextBook.id, nextChapterValue, titleForBookChapter(nextBook, nextChapterValue)];
            }
        }
    };

    titleForBookChapter = function (book, chapter) {
        if (book !== undefined) {
            if (chapter > 0) {
                return `${book.tocName} ${chapter}`;
            }
            return book.tocName;
        }
    };

    volumesGridContent = function (volumeId) {
        let gridContent = "";

        volumes.forEach(function (volume) {
            if (volumeId === undefined || volumeId === volume.id) {
                gridContent += htmlDiv({
                    classKey: CLASS_VOLUME,
                    content: htmlAnchor(volume) + htmlElement(TAG_HEADER5, volume.fullName)
                });

                gridContent += booksGrid(volume);
            }
        });

        return gridContent + BOTTOM_PADDING;
    };

    /*-------------------------------------------------------------------
     *                      PUBLIC API
     */
    return {
        init,
        onHashChanged,
        hash
    };

}());
