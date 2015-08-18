//-------------------------------------------------------------------------
// base helper methods
//-------------------------------------------------------------------------
export function get(id) {
    return document.getElementById(id);
}

export function html(id, html) {
    get(id).innerHTML = html;
}

export function show(id) {
    get(id).style.visibility = 'visible';
}

export function hide(id) {
    get(id).style.visibility = 'hidden';
}

export function timestamp() {
    return new Date().getTime();
}
