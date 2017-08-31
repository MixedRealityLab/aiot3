

$(document).ready(function() {
    var getUserId=$("#HideUserId").val();
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
            {data: "stock_current"},
            {data: "predicted_need_date"},
            {data: null,
                defaultContent: "<button type='buttonEspecial'>icon</button>"}

        ],
        "lengthChange": false,
        "length": 10
    } );



    $('#products_data tbody').on('click', 'button', function () {
        var data = table.row( $(this).parents('tr') ).data();
        $('#myModal').modal('show');
        document.getElementById("descriptionModal").innerHTML = "Product Description:"+data.description;
        document.getElementById("statusData").innerHTML ="";
        //console.log('inventory id:'+ data.inventory_id);


        $('#myModal').on('click', function (event) {
            var idButton = event.target.id;

            console.log(idButton);

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

            if (idButton == 'btnBin'){
               $.ajax({
                    url: '/bin',
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
    var tableOut = $('#products_dataOut').DataTable( {
        //"ajax": '/javascripts/data.txt',
        //"lengthChange": false,
        //"length": 10,
        //"columnDefs": [ {
        //    "targets": -1,
        //    "data": null,
        //    "defaultContent": "<button id='buttonOut' type='buttonEspecial'>icon</button>" //<img src='/img/three.png' width='35%' height='25%' id='dagger' onclick='myFunction()'>"
        //} ]

        "ajax": {
            url: '/getInventoryDataOut',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns":[
            {data: "description"},
            {data: "timestamp"},
            {data: "timestamp"},
            {data: null,
                defaultContent: "<button type='buttonEspecial'>icon</button>"}

        ],
        "lengthChange": false,
        "length": 10

    } );

    $('#products_dataOut tbody').on('click', 'button', function () {
        //var data = table.row( $(this).parents('tr') ).data(); //get data from scanned out inventory
        $('#ModalOut').modal('show');
        document.getElementById("ModalOutLabel").innerHTML = "Details :";//+data.description;
    } );
    //******************************************************************************************************************

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

            //window.location.reload();


        }
    });
});