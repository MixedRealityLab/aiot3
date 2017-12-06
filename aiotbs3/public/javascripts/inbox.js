
/*$(document).ready(function() {
    var table = $('#beforeOut').DataTable( {
        "bFilter": false,
        "bInfo": false,
        "ajax": "../ajax/data/objects.txt",
        "columns": [
            {
                "className":  false
            },
            { "data": "name" }
        ],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "destroy": true,
        "scrollY": '150px'
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
} );*/