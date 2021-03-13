const anchor = function (volume) {
    return `<a name="v${volume.id}" />`;
};
const div = function (parameters) {
    let classString = (parameters.classKey === undefined ? "" : ` class="${parameters.classKey}"`);
    let contentString = (parameters.content === undefined ? "" : parameters.content);
    let idString = (parameters.id === undefined ? "" : ` id="${parameters.id}"`);
    return `<div${idString}${classString}>${contentString}</div>`;
};
const element = function (tagName, content) {
    return `<${tagName}>${content}</${tagName}>`;
};
const link = function (parameters) {
    let classString = (parameters.classKey === undefined ? "" : ` class="${parameters.classKey}"`);
    let contentString = (parameters.content === undefined ? "" : parameters.content);
    let idString = (parameters.id === undefined ? "" : ` id="${parameters.id}"`);
    let hrefString = (parameters.href === undefined ? "" : ` href="${parameters.href}"`);
    return `<a${idString}${classString}${hrefString}>${contentString}</a>`;
};
const hashlink = function (hashVol, hashBook, hashChap, title, content) {
    return `<a href="javascript:void(0)" onclick="Scriptures.setHash(${hashVol}, ${hashBook}, ${hashChap})" title="${title}">${content}</a>`;
};
const nextbutton = function (hashVol, hashBook, hashChap, nextprevious) {
    return `<a href="javascript:void(0)" onclick="Scriptures.transition(${hashVol}, ${hashBook}, ${hashChap}, '${nextprevious}')" title="${nextprevious}">${nextprevious}</a>`;
};

const HTML = {
    anchor,
    div,
    element,
    link,
    hashlink,
    nextbutton
};

export default Object.freeze(HTML);