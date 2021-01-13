/*
* File:   scriptures.js
* AUTHOR: Stephen W. Liddle as implemented by Riley Hales
* DATE:   2021
*
* DESCRIPTION:  JS for The Scriptures, Mapped.
*               IS 542 Project 1
*/

/*global
    console, XMLHttpRequest
 */
/*property
    books, forEach, hash, init, log, maxBookId, minBookId, onHashChanged,
    onerror, onload, open, parse, push, response, send, status
*/

const Scriptures = (function () {
    "use strict";

    /*---------------------------------------------------------------
    *           CONSTANTS
    */
    const URL_BOOKS = "https://scriptures.byu.edu/mapscrip/model/books.php";
    const URL_VOLUMES = "https://scriptures.byu.edu/mapscrip/model/volumes.php";

    /*---------------------------------------------------------------
    *           PRIVATE VARIABLES
    */
    let books;
    let volumes;

    /*---------------------------------------------------------------
    *           PRIVATE METHOD DECLARATIONS
    */
    let ajax;
    let init;
    let cacheBooks;

    /*---------------------------------------------------------------
    *           PRIVATE METHODS
    */
    ajax = function (url, successCallback, failureCallback) {
        let request = new XMLHttpRequest();
        request.open("GET", url, true);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let data = JSON.parse(request.response);
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

    cacheBooks = function (onInitializedCallback) {
        volumes.forEach(volume => {
            let volumeBooks = [];
            let bookId = volume.minBookId;

            while (bookId <= volume.maxBookId) {
                volumeBooks.push(books[bookId])
                bookId += 1;
            }

            volume.books = volumeBooks;
        });
        if (typeof onInitializedCallback === "function") {
            onInitializedCallback();
        }
    }

    init = function (callback) {
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax(URL_BOOKS,
            data => {
                books = data;
                booksLoaded = true;
                if (volumesLoaded) {
                    cacheBooks(callback);
                }
            });
        ajax(URL_VOLUMES,
            data => {
                volumes = data;
                volumesLoaded = true;
                if (booksLoaded) {
                    cacheBooks(callback);
                }
            });
    };


    /*---------------------------------------------------------------
    *           PUBLIC API
    */
    return {
        init: init
    };

}());