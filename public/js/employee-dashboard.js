var previous = null;                // The shift that the user last clicked on
var current = null;                 // The shift that is currently selected

$(document).ready(function () {

    var shiftRows = $('.shift_row');

    $(shiftRows).click(function (row) { 

        // I can't really remember how this works
        // but basically it prevents the user from selecting 'all shifts' in one go
        previous = current;
        current = $(row.currentTarget);
        status = current.data().status;

        // Check if clocked-in, and change the button text accordingly
        if (status == "CLOCKED_IN") {
            $('#clockBtn').text("Clock-out");
        }
        else if (status == "CLOCKED_OUT") {
            previous = null;
            current = null;

            createFlashMessage("You've already clocked-out of this shift.", "danger");
            return;
        } else {
            $('#clockBtn').text("Clock-in");
        }

        if (status != 'CLOCKED_OUT') {
            $(current).toggleClass("font-weight-bold");
            $(current).find('input').prop("checked", true);
        }
        try {
            if (previous.data('status') != 'CLOCKED_OUT') {
                $(previous).toggleClass("font-weight-bold");
                $(previous).find('input').prop("checked", false);
            }
        } catch (err) { /* Catching the null value here */ }
        
        // Clock button is enabled as soon as a shift is selected
        $('#clockBtn').attr('disabled', false);
    });
    
});

/**
 * Used to clock in or out of a shift
 */
function clock() {
    // Attempt to get employee position...
    navigator.geolocation.getCurrentPosition((pos) => {
            
            // The shift's relevant data stored as json, so it can be submitted to the server
            var shiftData = {
                shift_id: $(current).data('id'),
                status: ($(current).data('status') == "READY") ? "CLOCK_IN" : "CLOCK_OUT",
                empCoords: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                },
                workplace: $(current).data('workplace')
            }

            // Make ajax call to server, which will register the "clock"
            
            /**
             * NOTE:
             * Use "http://localhost:7979/clock" as the POST URL for local development
            */

            $.post("http://localhost:7979/clock", {data: JSON.stringify(shiftData)})
            // $.post("https://clocker.in/clock", {data: JSON.stringify(shiftData)})

            // Response received from server
            .done((data) => {

                // Check if the server couldn't process the request for whatever reason
                // Perhaps they weren't in the workplace boundaries...
                if (data.success != true) {
                    createFlashMessage(data.message, "danger");
                    return;
                }

                createFlashMessage(data.message, "success");

                // If they clocked-out, change button text to "Clock-in"
                if ($(current).data('status') == 'CLOCKED_IN') {
                    $("#clockBtn").text("Clock-in");
                    $(current).data('status', "CLOCKED_OUT");
                    $(current.find(".status")).text("Clocked out at: " + moment.unix(data.timestamp).format("DD MMM. hh:mm A"));

                    // 'Unselect' (unbold) the shift to signal that they can't clock-in
                    $(current).toggleClass('font-weight-bold');

                    $('#clockBtn').attr('disabled', true);
                }
                
                // ... else change button text to "Clock-out"
                else {
                    $("#clockBtn").text("Clock-out");
                    $(current).data('status', "CLOCKED_IN");
                    $(current.find(".status")).text("Clocked in at: " + moment.unix(data.timestamp).format("DD MMM. hh:mm A"));
                }
            });
    }, () => {
        // An error occured
        createFlashMessage("Could not get geolocation - please refresh page", "danger");
    });
}
