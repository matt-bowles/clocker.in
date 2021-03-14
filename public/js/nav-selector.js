/**
 * Visually highlights the navlink for the current page
 */

$(document).ready(function () {
    var regex = /\/\w+s/g;  // Basically any word that ends with an "s" (shifts, accounts)
    var pageTitle = window.location.href.match(regex).slice(-1)[0];

    var navlinks = $('#nav-links').children();

    for (i=0; i<navlinks.length; i++) {
        if ($(navlinks[i]).attr('href') == pageTitle) {
            // Do the styling here
            $(navlinks[i].children[0]).addClass('bg-light');
        }
    }
});