
$(document).ready(function() {
    var getUserId = $("#HideUserId").val();

    //var getUserId= document.getElementById("HideUserId").value;
    console.log(getUserId);

    var table = $('#products_data').DataTable( {
        //"processing": true,
        //"serverSide": true,
        "ajax": {
            url: '/getInventoryData',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns":[
            {data: "description"},
            {data: "stock_level"},//{data: "level"},
            {data: "predicted_need_date"},
            {data: null,
                defaultContent: "<button type='buttonEspecial' class='btn btn-primary btn-sm'> <i class='glyphicon glyphicon-option-horizontal'></i> </button>"}

        ],
        "lengthChange": false,
        "length": 10
    } );



    $('#products_data tbody').on('click', 'button', function () {
        var data = table.row( $(this).parents('tr') ).data();
        $('#myModal').modal('show');
        document.getElementById("descriptionModal").innerHTML = "Product Description: "+ data.description;
        document.getElementById("eanCode").innerHTML = "Barcode: "+ data.ean;
        document.getElementById("brand").innerHTML = "Brand: "+ data.brand_name;
        document.getElementById("quantity").innerHTML ="Quantity: "+ data.quantity + data.quantity_units;
        //document.getElementById("metadata").innerHTML ="Full Data: "+ data.metadata;
        console.log(data.inventory_id);

        //******************************************* in/out history tables *******************************************
        var tableInEvent = $('#in_events_table').DataTable( {
            "bFilter": false,
            "bInfo": false,
            "ajax": {
                url: '/getInEvents',
                type: 'POST',
                data: {inventoryId: data.inventory_id}

            },
            "columns":[
                {data: "timestamp"}

            ],
            "lengthChange": false,
            "length": 10,
            "paging": false,
            "destroy":true,
            "scrollY": '150px'
        } );

        var tableOutEvent = $('#out_events_table').DataTable( {
            "bFilter": false,
            "bInfo": false,
            "ajax": {
                url: '/getOutEvents',
                type: 'POST',
                data: {inventoryId: data.inventory_id}

            },
            "columns":[
                {data: "timestamp"}

            ],
            "lengthChange": false,
            "length": 10,
            "paging": false,
            "destroy":true,
            "scrollY": '150px'
        } );
        //**************************************************************************************************

        $('#myModal').on('click', function (event) {
            var idButton = event.target.id;


            if (idButton == 'btnEdit') {

                $.ajax({
                    url: '/editProduct',
                    type: 'POST',
                    data: {inventoryId: data.inventory_id, newStockLevel:1},
                    datatype: 'json',
                    success: function (response) {
                        console.log('success', response);
                        document.getElementById("statusData").innerHTML = "Server response:"+response.msg;

                    },
                    error: function(xhr, status, error) {
                        alert(xhr.responseText); // error occur
                    }
                });

            }
            if (idButton == 'btnStop'){

                $.ajax({
                    url: '/stopTrack',
                    type: 'POST',
                    data: {inventoryId: data.inventory_id},
                    datatype: 'json',
                    success: function (response) {
                        console.log('success', response);
                        document.getElementById("statusData").innerHTML = "Stop track product:"+response.msg;


                    },
                    error: function(xhr, status, error) {
                        alert(xhr.responseText); // error occur
                    }
                });

            }

            if (idButton == 'btnUsedManual'){


               $('#myModalDate').modal('show');

                $('#myModalDate').on('click', function (event) {
                    if (event.target.id == 'btncloseSO'){
                        console.log(event.target.id);
                        $('#myModal').modal('hide');

                    }

                });



                /*$.ajax({
                    url: '/outByUser',
                    type: 'POST',
                    data: {inventoryId: data.inventory_id},
                    datatype: 'json',
                    success: function (response) {
                        console.log('success', response);
                        document.getElementById("statusData").innerHTML = "not working";

                    },
                    error: function(xhr, status, error) {
                        alert(xhr.responseText); // error occur
                    }
                });*/

            }

            if (idButton == 'btnWastedManual'){
                $.ajax({
                    url: '/outByUser',
                    type: 'POST',
                    data: {inventoryId: data.inventory_id},
                    datatype: 'json',
                    success: function (response) {
                        console.log('success', response);
                        document.getElementById("statusData").innerHTML = "not working";

                    },
                    error: function(xhr, status, error) {
                        alert(xhr.responseText); // error occur
                    }
                });

            }



        });
        //console.log(data);



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


    console.log('REF:'+window.location.href);


    //******************* ESSENTIALS SCAN OUT DATATABLE ****************************************************************

    //console.log(inventorySelected);
    var tableOut = $('#products_dataOut').DataTable( {
        "ajax": {
            url: '/getInventoryDataOut',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns":[
            {data: "description"},
            {data: "last_added"},
            {data: "used_up"},
            {data: null,
                defaultContent: "<button type='buttonEspecial' class='btn btn-primary btn-sm'> <i class='glyphicon glyphicon-option-horizontal'></i></button>"}

        ],
        "lengthChange": false,
        "length": 10

    } );

    $('#products_dataOut tbody').on('click', 'button', function () {
        $('#ModalOut').modal('show');
        document.getElementById("ModalOutLabel").innerHTML = "Details :";//+data.description;
    } );
    //******************************************************************************************************************



//********************************** in/out history tables *************************************************************
    //var dataSelected = table.row( $('#products_data').parents('tr') ).data();
    //console.log(dataSelected.inventory_id);








// *********************************************************************************************************************



} );

var activeTab2 = $('.nav-tabs .active').text();

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    var activeTab2 = $('.nav-tabs .active').text();
    console.log(activeTab2);
    $(document).scannerDetection();
    $(document).bind('scannerDetectionComplete', function (e, data) {
        console.log('complete: ' + data.string);

        if ($('.nav-tabs .active').text() == 'ESSENTIALS') {
            //alert('Go to "SCAN IN" or "SCAN OUT" tab to scan an essential');
            $('#myModalRedirect').modal('show');
            $('#myModalRedirect').on('click', function (event) {
                var idButton = event.target.id;
                if (idButton == 'btnScanIn'){
                    console.log('go to scan in');
                }
                if (idButton == 'btnScanOut') {
                    console.log('go to scan out');
                }
            });


        }
    });
});



