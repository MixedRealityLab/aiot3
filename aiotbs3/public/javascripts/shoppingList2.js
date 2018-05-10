//this is a second javascript to generate shopping list without using modal, accessing directly by url

$(document).ready(function() {

    var getUserId = $("#HideUserId").val();
    //console.log('userId:'+$("#HideUserId").val());
    console.log('userId:'+getUserId);

    //IN STOCK ESSENTIALS DATATABLE
    var ListTable = $('#shoppinglist_data2').DataTable({
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getInitialShoppingList',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columnDefs": [
            { "visible": false, "targets": 2 }
        ],
        "columns": [
            {
                data: null,
                defaultContent:"<input type=checkbox onchange=\"if ($(this).is(':checked')) { $(this).closest('tr').addClass('used'); } else { $(this).closest('tr').removeClass('used'); } \">"
            },
            {data: "description"},
            {data: "stock"},//{data: "level"},
            {data: "predicted_need_date2"},
            {
                data: null,
                defaultContent: "<button id='hideButton' type='buttonEspecial' class='btn btn-warning btn-xs'> <i class='glyphicon glyphicon-eye-close'></i> </button>"
            }


        ],
        "drawCallback": function ( settings ) {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;

            api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group"><td colspan="5">'+group+'</td></tr>'
                    );

                    last = group;
                }
            } );
        },
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "destroy": true,
        "scrollY": '300px'

    });



        // Order by the grouping
        $('#shoppinglist_data2 tbody').on( 'click', 'tr.group', function () {
            var currentOrder = ListTable.order()[0];
            if ( currentOrder[0] === 2 && currentOrder[1] === 'asc' ) {
                ListTable.order( [ 2, 'desc' ] ).draw();
            }
            else {
                ListTable.order( [ 2, 'asc' ] ).draw();
            }
        } );


    //hide items from shopping list suggested
    $('#shoppinglist_data2 tbody').on('click', 'button', function () {
        //var dataHide = ListTable.row($(this).parents('tr')).data(); //to get all data from a row
        ListTable.row($(this).parents('tr')).remove().draw();
    });



    //add new essentials button
    $('.addNew').click(function(){
        $('#modalNewRow').modal('show');
    });

    //add description of a new essential
    $('.addNew2').click(function(){
        var newDescription = document.getElementById("decriptionNewItem").value;
        $('#modalNewRow').modal('hide');

        //add a new row in datatable
        ListTable.row.add( {
            "description": newDescription,
            "stock":" New Items",
            "predicted_need_date2":   " "
        } ).draw();

        document.getElementById("decriptionNewItem").value = ""; //clear input text

    });



});