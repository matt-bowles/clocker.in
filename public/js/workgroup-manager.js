var empsInWorkgroup;

$(document).ready(function () {
    // Initialise empsInWorkgroup array if it doesn't exist
    if ($('#empsInWorkgroup').val()) {
        // Add brackets so it can be parsed as array
        empsInWorkgroup = JSON.parse($('#empsInWorkgroup').val());
    } else {
        empsInWorkgroup = [];
    }

    $('#resetBtn').click(() => reset());
});

/**
 * Adds an employee to the workgroup
 * @param {} emp 
 */
function add(emp) {
    if (empsInWorkgroup.length < $('#maxEmployees').val()) {
        var row = $(emp).detach();

        // Switch out add button for remove button
        $(row.find(".add").replaceWith(removeButton));
        $(row).attr("onclick", "remove($(this))");

        // Add row to the table
        $("#inWg").append(row);

        empsInWorkgroup.push($(row.data().id)[0]);
        updateHiddenValue();
    } else {
        // Max employee number reached, do not add employee
        createFlashMessage(`Cannot add employee (max. employee limit of ${$('#maxEmployees').val()} reached)`, "danger");
    }
}

/**
 * Removes an employee from the workgroup
 * @param {*} emp 
 */
function remove(emp) {
    var row = $(emp).detach();

    // Switch out remove button for add button
    $(row.find(".remove").replaceWith(getAddButton));
    $(row).attr("onclick", "add($(this))");

    // Add row to the table
    $("#notInWg").append(row);

    empsInWorkgroup = empsInWorkgroup.filter(item => item !== $(row.data().id)[0]);
    updateHiddenValue();
}

/**
 * Moves all rows back to "Not in Workgroup" column
 */
function reset() {
    var rows = $('#inWg').find('tr');

    for (var i=0; i<rows.length; i++) {
        remove(rows[i]);
    }
}

/**
 * Updates the value sent in the POST request that contains the IDs of all employees in the workgroup
 */
function updateHiddenValue() {
    $('#empsInWorkgroup').val(JSON.stringify(empsInWorkgroup));

    // Update num. of employees in workgroup
    $('#numEmployees').html(empsInWorkgroup.length);

    // Disable save button if 0 employees in workgroup, enable otherwise
    $('#saveBtn').attr('disabled',
        empsInWorkgroup.length > 0 ? false : true
    ) 
}

function getAddButton() {
    return ('<span class="add float-right">+</span>');
}

function removeButton() {
    return ('<span class="remove float-right">-</span>');
}