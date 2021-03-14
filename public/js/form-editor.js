/**
 * Adds an edit button (toggleable) to each 'input' tag in a form
 */

$(document).ready(function () {
    var editButtons = $('.fa-edit');

    // Add "cursor: pointer" style to each edit button (i.e. the 'hover' mouse)
    editButtons.css("cursor", "pointer");

    editButtons.click(function (e) { 
        e.preventDefault();
        // Toggle readonly attribute of the sibling element (for the respective edit button)
        var inputField = $(this).siblings('input');
        inputField.prop('readonly', !inputField.attr('readonly'));
    });
});