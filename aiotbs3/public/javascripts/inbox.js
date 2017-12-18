
$(document).ready(function() {
    var getUserId = $("#HideUserId").val();

    var table = $('#beforeOut').DataTable( {
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getScannedOutBeforePrediction',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [

            {data: "description"}

        ],

        "lengthChange": false,
        "length": 10,
        "paging": false,
        "scrollY": '200px'
    } );



    var table = $('#afterOut').DataTable( {
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getScannedOutAfterPrediction',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [

            {data: "description"}

        ],

        "lengthChange": false,
        "length": 10,
        "paging": false,
        "scrollY": '200px'
    } );


    // Add event listener for opening and closing details
    $('#beforeOut tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    } );
} );