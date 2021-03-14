
var timeoutLength = 5000;   // In milliseconds

window.onload = () => {
    fadeFlashes();
}

/**
 * Deletes all alerts (flash messages) on a page after a specified amount of time (5 seconds by default).
 */
function fadeFlashes() {
    var flashes = document.getElementsByClassName('alert');
    if (flashes.length > 0) {
        setTimeout(() => {
            $('.alert').alert('close');
        }, timeoutLength);
    }
}

/**
 * Creates a flash message at the top of the page, and then fades it.
 */
function createFlashMessage(msg, type) {

    var content = $(
        `
        <div class="alert alert-${type} fade show" role="alert">
        ${msg}
        </div>
        `);
    $(document.body).prepend(content);

    fadeFlashes();
}