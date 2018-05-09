var editor;

$(document).ready(function() {
    var getUserId = $("#HideUserId").val();
    //console.log('userId:'+$("#HideUserId").val());
    console.log('userId:'+getUserId);


    //modal css work
    $('.modal-child').on('show.bs.modal', function () {
        var modalParent = $(this).attr('data-modal-parent');
        $(modalParent).css('opacity', 0);
    });

    $('.modal-child').on('hidden.bs.modal', function () {
        var modalParent = $(this).attr('data-modal-parent');
        $(modalParent).css('opacity', 1);
    });


    $('#myList').on('shown.bs.modal', function () {
    $.fn.dataTable.tables({visible: true, api: true}).columns.adjust();

    //IN STOCK ESSENTIALS DATATABLE
    var ListTable = $('#shoppinglist_data').DataTable({
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getInitialShoppingList',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [
            {
                data: null,
                //defaultContent: "<div class=\"checkbox\">\n" +
                //"      <label><input type=\"checkbox\" value=\"\"> </label>\n" +
                //"    </div>"
                defaultContent:"<input type=checkbox onchange=\"if ($(this).is(':checked')) { $(this).closest('tr').addClass('used'); } else { $(this).closest('tr').removeClass('used'); } \">"
            },
            {data: "description"},
            //{data: "stock_level"},//{data: "level"},
            {data: "predicted_need_date2"},
            {
                data: null,
                defaultContent: "<button id='hideButton' type='buttonEspecial' class='btn btn-warning btn-sm'> <i class='glyphicon glyphicon-eye-close'></i> </button>"
            }


        ],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "destroy": true,
        "scrollY": '300px'

    });


    //hide items from shopping list suggested
    $('#shoppinglist_data tbody').on('click', 'button', function () {
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
            "predicted_need_date2":   " "
        } ).draw();

        document.getElementById("decriptionNewItem").value = ""; //clear input text

    });

    });

});