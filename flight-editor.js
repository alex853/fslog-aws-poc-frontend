var FlightEditor = {
    onAddClicked: function (index) {
        var previousRecord = records[index];

        var type = previousRecord['Type'];
        var isPreviousTransfer = type === 'transfer';
        var isPreviousFlight = (type !== 'transfer') && (type !== 'discontinuity');

        var dialog = $('#flightEditorModal');
        dialog.action = 'add-flight';

        dialog.find('.modal-title').text('Add Flight');

        $('#flightEditorModal-dateOfFlight').val(new Date().toISOString().split('T')[0]);
        $('#flightEditorModal-callsign').val(isPreviousFlight ? previousRecord['Callsign'] : undefined);
        $('#flightEditorModal-flightNumber').val(isPreviousFlight ? previousRecord['FlightNumber'] : undefined);
        $('#flightEditorModal-aircraftType').val(isPreviousFlight ? previousRecord['AircraftType'] : undefined);
        $('#flightEditorModal-aircraftRegistration').val(isPreviousFlight ? previousRecord['AircraftRegistration'] : undefined);
        $('#flightEditorModal-departure').val(isPreviousFlight || isPreviousTransfer ? previousRecord['Destination'] : undefined);
        $('#flightEditorModal-destination').val(undefined);

        dialog.modal();
    },

    updateCrowFlightDistance: function () {
        var from = nonEmpty($('#flightEditorModal-departure').val());
        var to = nonEmpty($('#flightEditorModal-destination').val());

        $.ajax({
            url: distanceUrl + '/v1/distance?from=$from$&to=$to$'.replace('$from$', from.toUpperCase()).replace('$to$', to.toUpperCase()),
            method: 'GET',
            success: function (response) {
                var distanceStr = response;
                $('#flightEditorModal-crowFlightDistance').val(distanceStr);
            },
            error: function (e) {
                $('#flightEditorModal-crowFlightDistance').val("N/A");
            }
        });
    },

    updateDuration: function () {
        var timeOut = parseHHMM(nonEmpty($('#flightEditorModal-timeOut').val()));
        var timeIn = parseHHMM(nonEmpty($('#flightEditorModal-timeIn').val()));

        var durationStr = null;
        if (timeOut !== undefined && timeIn !== undefined) {
            var durationMinutes = timeIn['total'] - timeOut['total'];
            if (durationMinutes < 0) {
                durationMinutes += 24 * 60;
            }
            durationStr = formatMinutesAsHMM(durationMinutes);
        }
        $('#flightEditorModal-duration').val(durationStr);
    },


    apply: function () {
        var dialog = $('#flightEditorModal');
        var action = dialog.action;

        var form = $('#flightEditorModal-form')[0];
        var valid = form.checkValidity();
        form.classList.add('was-validated');
        if (!valid) {
            return;
        }

        dialog.modal('hide');

        var flight = {
            "UserID": 1,
            "BeginningDT": $('#flightEditorModal-dateOfFlight').val() + 'T' + $('#flightEditorModal-timeOut').val() + ':00',
            "Type": "flight",
            "Date": $('#flightEditorModal-dateOfFlight').val(),
            "Callsign": nonEmpty($('#flightEditorModal-callsign').val()),
            "FlightNumber": nonEmpty($('#flightEditorModal-flightNumber').val()),
            "AircraftType": nonEmpty($('#flightEditorModal-aircraftType').val()),
            "AircraftRegistration": nonEmpty($('#flightEditorModal-aircraftRegistration').val()),
            "Departure": nonEmpty($('#flightEditorModal-departure').val()),
            "Destination": nonEmpty($('#flightEditorModal-destination').val()),
            "TimeOut": nonEmpty($('#flightEditorModal-timeOut').val()),
            "TimeOff": nonEmpty($('#flightEditorModal-timeOff').val()),
            "TimeOn": nonEmpty($('#flightEditorModal-timeOn').val()),
            "TimeIn": nonEmpty($('#flightEditorModal-timeIn').val()),
            "Duration": nonEmpty($('#flightEditorModal-duration').val()),
            "Distance": nonEmpty($('#flightEditorModal-distance').val()),
            "Comment": nonEmpty($('#flightEditorModal-comment').val()),
            "Remarks": nonEmpty($('#flightEditorModal-remarks').val())
        };

        $.ajax({
            url: gatewayUrl,
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(flight),
            success: function (response) {
                showAlert("Flight added successfully", "success", 5000);
                // todo add flight to grid and update grid
            },
            error: function (e) {
                showAlert("Error happened!", "danger", 5000);
                console.log(e.responseText);
            }
        });
    }
}

$(document).ready(function () {
    $('#flightEditorModal-departure').keyup(function () {
        FlightEditor.updateCrowFlightDistance();
    });

    $('#flightEditorModal-destination').keyup(function () {
        FlightEditor.updateCrowFlightDistance();
    });

    $('#flightEditorModal-timeOut').change(function () {
        FlightEditor.updateDuration();
    });

    $('#flightEditorModal-timeIn').change(function () {
        FlightEditor.updateDuration();
    });
});