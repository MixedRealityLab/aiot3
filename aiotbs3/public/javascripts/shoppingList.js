var editor;

$(document).ready(function() {
    var getUserId = 3;//$("#HideUserId").val();
    console.log(getUserId);


    //modal css work
    $('.modal-child').on('show.bs.modal', function () {
        var modalParent = $(this).attr('data-modal-parent');
        $(modalParent).css('opacity', 0);
    });

    $('.modal-child').on('hidden.bs.modal', function () {
        var modalParent = $(this).attr('data-modal-parent');
        $(modalParent).css('opacity', 1);
    });




    //IN STOCK ESSENTIALS DATATABLE
    var ListTable = $('#shoppinglist_data').DataTable({
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getInventoryData',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [
            {data: "description"},
            {data: "stock_level"},//{data: "level"},
            {data: "predicted_need_date"},
            //{
            //    data: null,
            //    defaultContent: "<button type='buttonEspecial' class='btn btn-success btn-sm'> <i class='glyphicon glyphicon-plus'></i> </button>"
            //},
            //{
            //    data: null,
            //    defaultContent: "<button type='buttonEspecial' class='btn btn-danger btn-sm'> <i class='glyphicon glyphicon-trash'></i> </button>"
            //}

        ],
        "order": [[1, 'asc']],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "scrollY": '300px',

    });




    //IN STOCK ESSENTIALS DATATABLE


    editor = new $.fn.dataTable.Editor( {
        ajax: "../php/staff.php",
        table: "#shoppinglist_dataNA",
        fields: [ {
            label: "First name:",
            name: "first_name"
        }, {
            label: "Last name:",
            name: "last_name"
        }, {
            label: "Position:",
            name: "position"
        }, {
            label: "Office:",
            name: "office"
        }, {
            label: "Extension:",
            name: "extn"
        }, {
            label: "Start date:",
            name: "start_date",
            type: "datetime"
        }, {
            label: "Salary:",
            name: "salary"
        }
        ]
    } );


    $('#shoppinglist_dataNA').on( 'click', 'tbody td.editable', function (e) {
        editor.inline( this );
    } );


    var ListTableNoAutonomous = $('#shoppinglist_dataNA').DataTable({
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getInventoryData',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [
            {data: "description"},
            {data: "stock_level", className: 'editable'},//{data: "level"},
            {data: "predicted_need_date"},
            {
                data: null,
                defaultContent: "<button type='buttonEspecial' class='btn btn-success btn-sm'> <i class='glyphicon glyphicon-plus'></i> </button>"
            },
            {
                data: null,
                defaultContent: "<button type='buttonEspecial' class='btn btn-danger btn-sm'> <i class='glyphicon glyphicon-trash'></i> </button>"
            }

        ],
        "order": [[1, 'asc']],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "scrollY": '300px',

    });


});