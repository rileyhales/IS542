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
    console, map, google, window
*/
/*property
    books, forEach, init, maxBookId, minBookId, onerror, onload, open, parse,
    push, response, send, status, classKey, content, href, id, numChapters,
    onerror, onload, open, parse, response, send, status, gridName, getElementById,
    hash, innerHTML, fullName, split, slice, log, length, onHashChanged, tocName,
    position, title, label, animation, lat, lng, map, Animation, DROP, maps, Marker,
    setMap, getElementsByClassName, every, location, parentBookId, onHashChange,
    showLocation, exec, getAttribute, querySelectorAll, panTo, setZoom, zoom,
    LatLngBounds, fitBounds, extend, text, includes
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
    const DIV_CRUMBS_NAV = "crumbnav";
    const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
    const DIV_SCRIPTURES = "scriptures";
    const INDEX_FLAG = 11;
    const INDEX_LATITUDE = 3;
    const INDEX_LONGITUDE = 4;
    const INDEX_PLACENAME = 2;
    const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
    const LOCATION_AMERICAS = {lat: 0, lng: -82.25, zoom: 3};
    const LOCATION_JERUSALEM = {lat: 31.7683, lng: 35.2137, zoom: 8};
    const LOCATION_USA = {lat: 39.5, lng: -98.5833, zoom: 5};
    const MAX_MARKER_ZOOM = 10;
    const REQUEST_GET = "GET";
    const REQUEST_STATUS_OK = 200;
    const REQUEST_STATUS_ERROR = 400;
    const TAG_HEADER5 = "h5";

    /*-------------------------------------------------------------------
     *                      PRIVATE VARIABLES
     */
    let books;
    let volumes;
    let gmMarkers = [];

    /*-------------------------------------------------------------------
     *                      PRIVATE METHOD DECLARATIONS
     */
    let ajax;
    let addMarker;
    let bookChapterValid;
    let booksGrid;
    let booksGridContent;
    let breadcrumbs;
    let cacheBooks;
    let changeHash;
    let chaptersGrid;
    let chaptersGridContent;
    let clearMarkers;
    let encodedScripturesUrl;
    let getCurrentHash;
    let getScripturesCallback;
    let getScripturesFailure;
    let htmlAnchor;
    let htmlDiv;
    let htmlElement;
    let htmlHashLink;
    let htmlLink;
    let htmlNextButton;
    let init;
    let navigateBook;
    let navigateChapter;
    let navigateHome;
    let nextChapter;
    let onHashChange;
    let previousChapter;
    let setupMarkers;
    let showLocation;
    let titleForBookChapter;
    let volumesGridContent;
    let zoomMap;

    /*-------------------------------------------------------------------
     *                      (PRIVATE) HTML BUILDING FUNCTIONS
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
    htmlHashLink = function (hashVol, hashBook, hashChap, title, content) {
        return `<a href="javascript:void(0)" onclick="Scriptures.hash(${hashVol}, ${hashBook}, ${hashChap})" title="${title}">${content}</a>`;
    };
    htmlNextButton = function (hashVol, hashBook, hashChap, nextprevious) {
        return `<a href="javascript:void(0)" onclick="Scriptures.transition(${hashVol}, ${hashBook}, ${hashChap}, '${nextprevious}')" title="${nextprevious}">${nextprevious}</a>`;
    };

    /*-------------------------------------------------------------------
     *                      (PRIVATE) GOOGLE MAPS METHODS
     */
    addMarker = function (name, lat, lon) {
        let needNewMarker = gmMarkers.every(function (existingMarker) {
            if (Number(lat) === existingMarker.position.lat() && Number(lon) === existingMarker.position.lng()) {
                if (!existingMarker.label.includes(name)) {
                    existingMarker.label += `, ${name}`;
                }
                return false;
            }
            return true;
        });

        if (!needNewMarker) {
            return;
        }

        let marker = new google.maps.Marker({
            position: {lat: Number(lat), lng: Number(lon)},
            map,
            title: name,
            label: name,
            animation: google.maps.Animation.DROP
        });
        gmMarkers.push(marker);
    };

    setupMarkers = function () {
        clearMarkers();
        document.querySelectorAll("a[onclick^=\"showLocation(\"]").forEach(function (element) {
            let matches = LAT_LON_PARSER.exec(element.getAttribute("onclick"));

            if (matches) {
                let placename = matches[INDEX_PLACENAME];
                let flag = matches[INDEX_FLAG];
                if (flag !== "") {
                    placename += ` ${flag}`;
                }

                addMarker(placename, matches[INDEX_LATITUDE], matches[INDEX_LONGITUDE]);
            }
        });
        zoomMap();
    };

    showLocation = function (geotagId, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewAltitude, viewHeading) {
        map.panTo({lat: latitude, lng: longitude});
        map.setZoom((viewAltitude >= MAX_MARKER_ZOOM ? MAX_MARKER_ZOOM : viewAltitude));
    };

    zoomMap = function () {
        if (gmMarkers.length <= 0) {
            let currentHash = getCurrentHash();
            currentHash = (currentHash === undefined ? 0 : Number(currentHash[0]));
            if (currentHash[0] <= 2 || currentHash === 5) {
                // if there is no hash or we're in one of the bible volumes or PGP zoom to jerusalem
                map.panTo(LOCATION_JERUSALEM);
                map.setZoom(LOCATION_JERUSALEM.zoom);
            } else if (currentHash [0] === 3) {
                // if hash indicates we're in the Book of Mormon, zoom to "americas"
                map.panTo(LOCATION_AMERICAS);
                map.setZoom(LOCATION_AMERICAS.zoom);
            } else if (currentHash [0] === 4) {
                // if hash indicates we're in D&C, zoom to USA
                map.panTo(LOCATION_USA);
                map.setZoom(LOCATION_USA.zoom);
            }
        } else if (gmMarkers.length === 1) {
            map.panTo(gmMarkers[0].position);
            map.setZoom(MAX_MARKER_ZOOM);
        } else {
            let bounds = new google.maps.LatLngBounds();
            gmMarkers.forEach(function (marker) {
                bounds.extend(marker.position);
            });
            map.fitBounds(bounds);
        }
    };

    /*-------------------------------------------------------------------
     *         REMAINING PRIVATE METHODS (NAVIGATION STUFF), ALPHABETICAL
     */

    ajax = function (url, successCallback, failureCallback, skipJsonParse) {
        fetch(url)
            .then(response => {
                if (response.ok && skipJsonParse) {
                    return response.text()
                }
                if (response.ok && !skipJsonParse) {
                    return response.json()
                }
            })
            .then(processedResponse => {
                successCallback(processedResponse)
            })
            .catch(error => {
                failureCallback(error)
            })
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

    breadcrumbs = function () {
        let currentHash = getCurrentHash();
        let crumbDiv = document.getElementById(DIV_CRUMBS_NAV);
        crumbDiv.innerHTML = htmlHashLink(undefined, undefined, undefined, "Home", "Home");
        if (currentHash === undefined) {
            return;
        }
        if (currentHash.length >= 1) {
            crumbDiv.innerHTML += ` > ${htmlHashLink(currentHash[0], undefined, undefined, volumes[currentHash[0] - 1].fullName, volumes[currentHash[0] - 1].fullName)}`;
        }
        if (currentHash.length >= 2) {
            crumbDiv.innerHTML += ` > ${htmlHashLink(currentHash[0], currentHash[1], undefined, books[currentHash[1]].fullName, books[currentHash[1]].fullName)}`;
        }
        if (currentHash.length >= 3) {
            crumbDiv.innerHTML += ` > ${htmlHashLink(currentHash[0], currentHash[1], currentHash[2], currentHash[2], currentHash[2])}`;
        }
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
                href: `#${book.parentBookId}:${book.id}:${chapter}`,
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

    clearMarkers = function () {
        gmMarkers.forEach(function (marker) {
            marker.setMap(null);
        });
        gmMarkers = [];
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

    getCurrentHash = function () {
        let currentHash = window.location.hash.slice(1).split(":");
        if (currentHash.length === 1 && currentHash[0] === "") {
            return undefined;
        }
        return currentHash;
    };

    const DIV_SCRIP1 = "scrip1";
    const DIV_SCRIP2 = "scrip2";
    let scripDivOnScreen = DIV_SCRIP1;
    let scripDivOffScreen = DIV_SCRIP2;
    const ANIMATE_TIME = 350;
    let animateType = "crossfade";

    let transition = function (volume, book, chapter, nextprevious) {
        animateType = nextprevious;
        changeHash(volume, book, chapter);
    }
    let crossfade = function () {
        $(`#${scripDivOffScreen}`).css({"left": "0px", "opacity": 0})
        $(`#${scripDivOffScreen}`).animate({"opacity": 1, "z-index": 2}, {"duration": ANIMATE_TIME})
        $(`#${scripDivOnScreen}`).animate({"opacity": 0, "z-index": 1}, {"duration": ANIMATE_TIME})
        switchVisibleDivTracker();
    }

    let switchVisibleDivTracker = function () {
        if (scripDivOnScreen === DIV_SCRIP1) {
            scripDivOnScreen = DIV_SCRIP2;
            scripDivOffScreen = DIV_SCRIP1;
        } else {
            scripDivOnScreen = DIV_SCRIP1;
            scripDivOffScreen = DIV_SCRIP2;
        }
    }

    getScripturesCallback = function (chapterHtml) {
        // Generate the next/previous buttons
        let currentHash = getCurrentHash();
        let prevHash = previousChapter(Number(currentHash[1]), Number(currentHash[2]));
        let previousButton = (prevHash === undefined ? "" : htmlNextButton(prevHash[0], prevHash[1], prevHash[2], "Previous"));
        let nextHash = nextChapter(Number(currentHash[1]), Number(currentHash[2]));
        let nextButton = (nextHash === undefined ? "" : htmlNextButton(nextHash[0], nextHash[1], nextHash[2], "Next"));

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
        setupMarkers();
    };

    getScripturesFailure = function (err) {
        console.log(err);
        document.getElementById(scripDivOnScreen).innerHTML = "Unable to retrieve chapter from database";
    };

    changeHash = function (volumeId, bookId, chapterId) {
        window.location.hash = `#${(volumeId === undefined ? "" : volumeId)}${(bookId === undefined ? "" : ":" + bookId)}${(chapterId === undefined ? "" : ":" + chapterId)}`;
    };

    init = function (callback) {
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

    navigateBook = function (bookId) {
        let book = books[bookId];
        if (book.numChapters <= 1) {
            navigateChapter(bookId, book.numChapters);
        } else {
            document.getElementById(scripDivOffScreen).innerHTML = htmlDiv({
                id: "divtitle",
                content: chaptersGrid(book)
            });
            crossfade();
        }
    };
    navigateChapter = function (bookId, chapter) {
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

    navigateHome = function (volumeId) {
        document.getElementById(scripDivOffScreen).innerHTML = htmlDiv({
            id: DIV_SCRIPTURES_NAVIGATOR,
            content: volumesGridContent(volumeId)
        });
        crossfade();
    };

    nextChapter = function (bookId, chapter) {
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

    onHashChange = function () {
        let ids = [];

        if (location.hash !== "" && location.hash.length > 1) {
            ids = getCurrentHash();
        }

        clearMarkers();
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
        zoomMap();
    };

    previousChapter = function (bookId, chapter) {
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
        onHashChange,
        hash: changeHash,
        showLocation,
        transition,
    };

}());
