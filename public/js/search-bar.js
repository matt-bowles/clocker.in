/**
 * Required JavaScript file for when adding the search bar partial
 */

var inputs;
var queryText;
var searchBar;
var entities;

$(document).ready(function () {
    
    // The input that the user is typing the search into
    searchBar = $('#searchBar input');

    // Surround text elements you want the user to search with the "searchable" class
    entities = $('#entityContainer, .searchable');

    // For some reason the first row is always visible and I don't know why, so just delete it
    delete entities[0];

    $(searchBar).keyup(function (e) { 

        // Update the user's search text
        queryText = $(searchBar).val().toLowerCase();

        for (var i=1; i<entities.length; i++) {
            var entity = $(entities[i]);

            // The 'searchable' text of each entity
            text = $(entity).text().trim().toLowerCase();

            // Filter by query text
            if (!text.includes(queryText)) {
                $(entity).parent().hide();
            } else {
                $(entity).parent().show();
            }
        }
    });
});