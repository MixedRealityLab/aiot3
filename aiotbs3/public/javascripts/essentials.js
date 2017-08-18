//basic datatable use
/*
$(document).ready(function(){
    $('#products_data').DataTable();
});
*/

//******************************************** without server **********************************************************
/*
//using click button
$(document).ready(function() {
        var table = $('#products_data').DataTable( {
            //"ajax": "/data.txt",
            "ajax": '/javascripts/data.txt',
            "lengthChange": false,
            "length": 10,
            "columnDefs": [ {
                "targets": -1,
                "data": null,
                "defaultContent": "<button type='buttonEspecial'>icon</button>" //<img src='/img/three.png' width='35%' height='25%' id='dagger' onclick='myFunction()'>"
                //"defaultContent":"  <input id='buttonDots' type='image' src='/img/three.png' width='32' height='32'>"
            } ]

        } );
*/
//**********************************************************************************************************************
/*var data= [
    { "Description" : "heinz",
        "stock_amount": "4",
        "stock_unit": "tins"

    }
];*/

$(document).ready(function() {
    var table = $('#products_data').DataTable( {
        //"processing": true,
        //"serverSide": true,
        "ajax": {
            url: '/getInventoryData',
            type: 'POST',
            data: {userId: 1}

        },
        "columns":[
            {data: "description"},
            {data: "stock_amount"},
            {data: "predicted_need_date"},
            {data: null,
                defaultContent: "<button type='buttonEspecial'>icon</button>"}

        ],
        "lengthChange": false,
        "length": 10//,
        //"columnDefs": [ {
           // "targets": -1,
           // "data": null,
           // "defaultContent": "<button type='buttonEspecial'>icon</button>" //<img src='/img/three.png' width='35%' height='25%' id='dagger' onclick='myFunction()'>"
            //"defaultContent":"  <input id='buttonDots' type='image' src='/img/three.png' width='32' height='32'>"
        //} ]

    } );




    var tableOut = $('#products_dataOut').DataTable( {
        "ajax": '/javascripts/data.txt',
       "lengthChange": false,
        "length": 10
    } );



    $('#products_data tbody').on('click', 'button', function () {
        var data = table.row( $(this).parents('tr') ).data();
        $('#myModal').modal('show');
        //document.getElementById("descriptionModal").innerHTML = "Details :"+data[0];
        document.getElementById("descriptionModal").innerHTML = "Details :"+data.description;
        // initializes and invokes show immediately
        //alert( data[0] +"'s salary is: "+ data[ 2] );
    } );



    document.getElementById('outStockLabel').onclick = function (e) {
        document.getElementById('inStockLabel').style.color = 'Grey';
        document.getElementById('inStockLabel').style.textDecorationColor = 'White';
        document.getElementById('outStockLabel').style.color='Blue';
        document.getElementById('outStockLabel').style.textDecorationColor='underline';
        //active essentials out stock tab
        //document.getElementById('EssentialsOutStock').setAttribute(activaTab())

    }


    document.getElementById('inStockLabel').onclick = function (e) {
        document.getElementById('outStockLabel').style.color='Grey';
        document.getElementById('inStockLabel').style.textDecorationColor = 'Blue';
        document.getElementById('inStockLabel').style.color='Blue';

    }


} );

/*
//using modal with responsive api
$(document).ready(function() {
    $('#products_data').DataTable({
        responsive: true,
        responsive: {
            details: {
                display: $.fn.dataTable.Responsive.display.modal({
                    header: function (row) {
                        var data = row.data();
                        return 'Details for ' + data[0] + ' ' + data[1];
                    }
                }),
                renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                        return '<tr>' +
                            '<td>' + col.title + ':' + '</td> ' +
                            '<td>' + col.data + '</td>' +
                            '</tr>';
                    }).join('');

                    return $('<table/>').append(data);
                }
            }


        }
    });
});
*/

/* Formatting function for row details - modify as you need */

/*function format ( d ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
        '<td>Full name:</td>'+
        '<td>'+d.name+'</td>'+
        '</tr>'+
        '<tr>'+
        '<td>Extension number:</td>'+
        '<td>'+d.extn+'</td>'+
        '</tr>'+
        '<tr>'+
        '<td>Extra info:</td>'+
        '<td>And any further details here (images etc)...</td>'+
        '</tr>'+
        '</table>';
}


$(document).ready(function() {

    $('#products_data').DataTable( {
        //"processing": true,
        //"serverSide": true
        //"ajax": "../data_models/scripts/inventory.js"
        /*"ajax": "../data_models/data.txt",
        "columns": [
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
            { "data": "productDescription" },
            { "data": "productStock" },
            { "data": "productPrediction" },
            { "data": "productRunOut" }
        ],
        "order": [[1, 'asc']]*/
 //   } );

/*
    // Add event listener for opening and closing details
    $("#products_data tbody").on('click', 'td.details-control', function () {
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