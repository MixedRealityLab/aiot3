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
            {data: "description"},
            //{data: "stock_level"},//{data: "level"},
            {data: "stock"},
            {
                data: null,
                defaultContent: "<button type='buttonEspecial' class='btn btn-light btn-sm'> <i class='glyphicon glyphicon-eye-close'></i> </button>"
            }


        ],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "destroy": true,
        "scrollY": '300px'

    });
    });



    //IN STOCK ESSENTIALS DATATABLE



});