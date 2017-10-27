
$(document).ready(function() {
    var getUserId = $("#HideUserId").val();

    //var getUserId= document.getElementById("HideUserId").value;
    console.log(getUserId);
    //$('#alertScanOut').hide();

    var table = $('#products_data').DataTable({
        //"processing": true,
        //"serverSide": true,
        "ajax": {
            url: '/getInventoryData',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [
            {data: "description"},
            {data: "stock_level"},//{data: "level"},
            {data: "predicted_need_date"},
            {
                data: null,
                defaultContent: "<button type='buttonEspecial' class='btn btn-primary btn-sm'> <i class='glyphicon glyphicon-option-horizontal'></i> </button>"
            }

        ],
        "lengthChange": false,
        "length": 10
    });


    $('#products_data tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        $('#myModal').modal('show');
        document.getElementById("descriptionModal").innerHTML = "Product Description: " + data.description;
        document.getElementById("eanCode").innerHTML = "Barcode: " + data.ean;
        document.getElementById("brand").innerHTML = "Brand: " + data.brand_name;
        document.getElementById("quantity").innerHTML = "Quantity: " + data.quantity + data.quantity_units;
        //document.getElementById("metadata").innerHTML ="Full Data: "+ data.metadata;
        console.log(data.inventory_id);

        //******************************************* in/out history tables *******************************************

        $('#myModal').on('shown.bs.modal', function () {
            // will only come inside after the modal is shown

            $.fn.dataTable.tables({visible: true, api: true}).columns.adjust();


            var tableInOutEvent = $('#in_out_events_table').DataTable({
                "bFilter": false,
                "bInfo": false,
                "ajax": {
                    url: '/getInOutEvents',
                    type: 'POST',
                    data: {userId: getUserId, inventoryId: data.inventory_id}

                },
                "columns": [
                    {data: "added"},
                    {data: "used_up"}

                ],
                "lengthChange": false,
                "length": 10,
                "paging": false,
                "destroy": true,
                "scrollY": '150px'
            });
            //**************************************************************************************************

        });


        $('#myModal').on('click', function (event) {

            var idButton = event.target.id;
            if (idButton == 'btnEdit') {

                $.ajax({
                    url: '/editProduct',
                    type: 'POST',
                    data: {inventoryId: data.inventory_id, newStockLevel: 1},
                    datatype: 'json',
                    success: function (response) {
                        console.log('success', response);
                        document.getElementById("statusData").innerHTML = "Server response:" + response.msg;

                    },
                    error: function (xhr, status, error) {
                        alert(xhr.responseText); // error occur
                    }
                });

            }
            if (idButton == 'btnStop') {

                $.ajax({
                    url: '/stopTrack',
                    type: 'POST',
                    data: {inventoryId: data.inventory_id},
                    datatype: 'json',
                    success: function (response) {
                        console.log('success', response);
                        document.getElementById("statusData").innerHTML = "Stop track product:" + response.msg;


                    },
                    error: function (xhr, status, error) {
                        // alert(xhr.responseText); // error occur
                    }
                });

            }


            var today = new Date();
            var dd = ("0" + (today.getDate())).slice(-2);
            var mm = ("0" + (today.getMonth() + 1)).slice(-2);
            var yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;
            $("#dateIn").attr("value", today);
            var wasted = 0;
            /*if (idButton == 'btnUsedManual') {


                $('#myModalDate').modal('show');

                $('#myModalDate').on('shown.bs.modal', function (e) {
                    $("#dateIn").attr("value", today);
                    $('.datepicker').datepicker();

                });

                $('#myModalDate').on('click', function (event) {
                    if (event.target.id == 'btncloseSO') {
                        console.log(event.target.id);
                        console.log(data.ean);

                        $.ajax({
                            url: '/scanOutProductManual',
                            type: 'POST',
                            data: {
                                userId: getUserId,
                                inventoryId: data.inventory_id,
                                wastedProductOut: 0,
                                codeProductOut: data.ean,
                                outDate: today,
                                productId: data.inventory_product_id
                            },
                            success: function (response) {
                                $('#myModal').modal('hide');
                                console.log('success', response);
                                //alert(response);
                                $('#alertScanOut').show();
                                $('#alertScanOut').fadeIn();
                                $('#alertScanOut').slideDown();
                                setTimeout(function () {
                                    $('#alertScanOut').hide();
                                    $('#products_data').DataTable().ajax.reload();
                                }, 3000);

                            }

                        });


                    }
                });


            }*/

            if (idButton == 'btnUsedManual' || idButton == 'btnWastedManual') {

                $('#myModalDate').modal('show');

                $('#myModalDate').on('shown.bs.modal', function (e) {
                   $("#dateIn").attr("value", today);
                   $('.datepicker').datepicker();

                });

                if (idButton == 'btnUsedManual'){
                    wasted = 0;
                }

                if (idButton == 'btnWastedManual'){
                    wasted = 1;
                }

                 $('#myModalDate').on('click', function (event) {
                     if (event.target.id == 'btncloseSO'){
                         document.getElementById("codeProductOutManual").value = data.ean;
                         document.getElementById("inventoryIdManual").value = data.inventory_id;
                         document.getElementById("userIdManual").value = getUserId;
                         document.getElementById("productIdManual").value = data.inventory_product_id;
                         document.getElementById("wastedProductOutManual").value = wasted;
                         document.getElementById("dateIn").value = today;
                         document.getElementById("scanoutFormManual").submit();
                     }
              });

            }


        });

    });
        document.getElementById('outStockLabel').onclick = function (e) {
            document.getElementById('inStockLabel').style.color = 'Grey';
            document.getElementById('inStockLabel').style.textDecorationColor = 'White';
            document.getElementById('outStockLabel').style.color = 'Blue';
            document.getElementById('outStockLabel').style.textDecorationColor = 'underline';
            //active essentials out stock tab
            //document.getElementById('EssentialsOutStock').setAttribute(activaTab())
            // products_dataOut
            $('#products_dataOut').DataTable().ajax.reload();

        }


        document.getElementById('inStockLabel').onclick = function (e) {
            document.getElementById('outStockLabel').style.color = 'Grey';
            document.getElementById('inStockLabel').style.textDecorationColor = 'Blue';
            document.getElementById('inStockLabel').style.color = 'Blue';

        }


        console.log('REF:' + window.location.href);


        //******************* ESSENTIALS SCAN OUT DATATABLE ****************************************************************

        //console.log(inventorySelected);
        var tableOut = $('#products_dataOut').DataTable({
            "ajax": {
                url: '/getInventoryDataOut',
                type: 'POST',
                data: {userId: getUserId}

            },
            "columns": [
                {data: "description"},
                {data: "last_added"},
                {data: "used_up"},
                {
                    data: null,
                    defaultContent: "<button type='buttonEspecial' class='btn btn-primary btn-sm'> <i class='glyphicon glyphicon-option-horizontal'></i></button>"
                }

            ],
            "lengthChange": false,
            "length": 10

        });

        $('#products_dataOut tbody').on('click', 'button', function () {
            $('#ModalOut').modal('show');
            document.getElementById("ModalOutLabel").innerHTML = "Details :";//+data.description;
        });
        //******************************************************************************************************************


//********************************** in/out history tables *************************************************************
        //var dataSelected = table.row( $('#products_data').parents('tr') ).data();
        //console.log(dataSelected.inventory_id);


// *********************************************************************************************************************


    });

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
                    if (idButton == 'btnScanIn') {
                        console.log('go to scan in');
                    }
                    if (idButton == 'btnScanOut') {
                        console.log('go to scan out');
                    }
                });


            }
        });
    });




