/**
 * JavaScript code for the "myshifts" page - EMPLOYEES ONLY
 * Loads an employee's shifts within a given week range (mon-sun) and displays them in a table.
 */

let weekCounter = 0;

$(document).ready(function () {
    getShifts();
});

/**
 * Gets the an employee's shifts for a given week (according to the weekCounter's value)
 * and displays them in the table.
 * @param {*} weekIncrement An integer indicating the number weeks ahead 
 *  e.g. 
 *      "+1" = next week
 *      "+2" = two weeks from now
 *      "0" = this current week (default value)
 *      "-1" = last week
 *      "-2" = two weeks ago
 */
function getShifts(weekIncrement=0) {
    const today = moment().add(weekCounter+=weekIncrement, 'week');
    const from = today.startOf('isoweek').unix();       // Monday 00:00
    const to = today.endOf('isoweek').unix();           // Sunday 23:59

    /**
     * NOTE:
     * Use "http://localhost:7979/getshits" as the GET URL for local development
    */

    // Make AJAX call to server, to receive shifts for current week
    $.get(`http://localhost:7979/getshifts?from=${from}&to=${to}`)
    // $.get(`https://clocker.in/getshifts?from=${from}&to=${to}`)
    
    .done((data) => {
        if (data.success) {
            
            // Update the "week range"
            $("#dateRange").text(moment.unix(from).format("Do MMMM, YYYY") + " - " + moment.unix(to).format("Do MMMM, YYYY"));

            // Clear the shifts currently displayed
            $("#shiftsList").empty();

            // No shifts found for this week, display error
            if (data.shifts.length == 0) {
                $('#shiftsList').append(`
                    <tr class="text-center text-uppercase font-italic font-weight-bold">
                        <td colspan="4"><h4>Zero shifts found for this week</h4></td>
                    </tr>
                `)
            }

            // Display each shift
            data.shifts.forEach((shift) => {
                var colour = "";    // The colour of the shift's status (text only)

                // Determine the 'status' field
                if (shift.clockout_time) {
                    shift.status = "Clocked-out";
                    colour = "text-success";
                } else if (shift.clockin_time) {
                    shift.status = "Clocked-in";
                    colour = "text-info";
                } else {
                    shift.status="Ready";
                }

                // Add shift row to table
                $('#shiftsList').append(`
                    <tr>
                        <td>${moment.unix(shift.start).format("Do MMMM hh:mma")}</td>
                        <td>${moment.unix(shift.end).format("Do MMMM hh:mma")}</td>
                        <td><a href="/workplaces/${shift.workplace}" target="_blank">${shift.workplace_name}</a></td>
                        <td class='${colour}'>${shift.status}</td>
                    </tr>
                `);
            })

        } else {
            // Display error message
            bootbox.alert("Could not connect to server. Check your connection and try again.");
        }
    });
}