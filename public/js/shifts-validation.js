var empSelect;
var wgSelect;

var startDtp;
var endDtp;

$(document).ready(function () {
    empSelect = $('#empSelect');
    wgSelect = $('#wgSelect');

    startDtp = $('#start_dtpicker');
    endDtp = $('#end_dtpicker');

    // In case data is pre-loaded
    checkSelectElements();

    // Assign events to select elements
    $(empSelect).change(() => {
        checkSelectElements();
        makeSureShiftDoesntOverlap();
    });
    $(wgSelect).change(() => {
        checkSelectElements();
        makeSureShiftDoesntOverlap();
    });

    // Assign events to datetime pickers
    $(startDtp).on('change.datetimepicker', (e) => {
        startDtp.time = e.date;
        validateShiftTimes();
        makeSureShiftDoesntOverlap();
    });
    $(endDtp).on('change.datetimepicker', (e) => {
        endDtp.time = e.date;
        validateShiftTimes();
        makeSureShiftDoesntOverlap();
    });

    $('#time_error').hide();
    
});

/**
 * Enables and disables the select elements on the page.
 * 
 * E.g. if employee is selected, disable workplace selector, and vice versa.
 */
function checkSelectElements() {

    // Employee is selected, disable workgroup select
    if ($(empSelect).val() != "" && $(empSelect).val() != undefined) {
        $(wgSelect).attr("disabled", true);
    }

    // Workgroup is selected, disable employee select
    else if ($(wgSelect).val() != "" && $(wgSelect).val() != undefined) {
        $(empSelect).attr("disabled", true);
    }

    // Neither are selected, enable both
    else {
        $(empSelect).attr("disabled", false);
        $(wgSelect).attr("disabled", false);
    }
}

/**
 * Makes sure that the shift doesn't end before it begins.
 */
function validateShiftTimes() {
    if (startDtp.time >= endDtp.time) {
        createFlashMessage("Shift starting time must precede end time", "danger")
        $('#saveBtn').attr("disabled", true);
    } else {
        $('#saveBtn').attr("disabled", false);
    }
}

/**
 * Queries the database to confirm that if the current shift were to be submitted, it would not
 * overlap with any others (where common employees are shared).
 */
async function makeSureShiftDoesntOverlap() {
    if (startDtp.time < endDtp.time) {
        
        var start = moment(startDtp.time).unix();
        var end = moment(endDtp.time).unix();

        // The url that the GET request will be sent to 
        let url = `http://localhost:7979/validateshifthours?start=${start}&end=${end}&`;
        // let url = `https://clocker.in/validateshifthours?start=${start}&end=${end}&`;

        // Set employee URL parameter (if applicable)
        if (empSelect.val() != "" && empSelect.val() != undefined) {
            url += `employee=${empSelect.val()}`;
        }

        // Set workgroup URL parameter (if applicable)
        else if (wgSelect.val() != "" && wgSelect.val() != undefined) {
            url += `workgroup=${wgSelect.val()}`;
        }

        // Basically, only send request if a emp/wg is selected
        if (url.substr(-1) !== "&") {
            $.get(url, (shifts) => {
                if (shifts.length != 0) {

                    // Format alert message to be displayed in modal
                    alertMsg = `${shifts.length} conflicts were found:`;
                    shifts.forEach((shift) => {
                        alertMsg += `<br><a href="/shifts/${shift.shift_id}">
                        ${moment.unix(shift.shift_start).format("Do MMMM hh:mma")} -\
                        ${moment.unix(shift.shift_end).format("Do MMMM hh:mma")}
                        </a>`
                    })

                    // Display overlaps
                    bootbox.alert(alertMsg);

                    // Disable submit button
                    $('#saveBtn').attr("disabled", true);
                } else {
                    $('#saveBtn').attr("disabled", false);
                }
            })
        }
    }
}