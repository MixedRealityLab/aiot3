
$(document).ready(function() {
    var getUserId = $("#HideUserId").val();
    console.log(getUserId);

    //IN STOCK ESSENTIALS DATATABLE
    var table = $('#products_data').DataTable({
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

    //IN STOCK ESSENTIALS DETAILS
    $('#products_data tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        var source = "inStock";
        console.log(data);
        detailsView(getUserId,data,source);


        //********* HIDE ********
        /*
        $('#myModal').modal('show');
        document.getElementById("descriptionModal").innerHTML = "Product Description: " + data.description;
        document.getElementById("eanCode").innerHTML = "Barcode: " + data.ean;
        document.getElementById("brand").innerHTML = "Brand: " + data.brand_name;
        document.getElementById("quantity").innerHTML = "Quantity: " + data.quantity + data.quantity_units;
        console.log(data.inventory_id);


        //-------- prediction date --------/

        $.ajax({
            url: '/getInOutEvents2',
            type: 'POST',
            data: {userId: getUserId, inventoryId: data.inventory_id},
            datatype: 'json',
            success: function (response) {
                console.log('success', response);
                document.getElementById("prediction").innerHTML = "Prediction/Run Out: " + response.predictedRunOut;
                document.getElementById("average").innerHTML = "Average Consumption (days):" + response.averageDays;
            },
            error: function (xhr, status, error) {
                //alert(xhr.responseText); // error occur
            }
        });

        //-------------------------


        //---- in/out history tables ----

        $('#myModal').on('shown.bs.modal', function () {
            // will only come inside after the modal is shown

            $.fn.dataTable.tables({visible: true, api: true}).columns.adjust();


            var tableInOutEvent = $('#in_out_events_table').DataTable({
                "bFilter": false,
                "bInfo": false,
                "ajax": {
                    url: '/getInOutEvents2',
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

        });
       //---------------------

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



            }


            var today = new Date();
            var dd = ("0" + (today.getDate())).slice(-2);
            var mm = ("0" + (today.getMonth() + 1)).slice(-2);
            var yyyy = today.getFullYear();
            today = dd + '-' + mm + '-' + yyyy;
            //$("#dateIn").attr("value", today);
            var wasted = 0;
            var dIn = today;


            function dateInFirst() {
                return $.ajax({
                    url: '/getFirstAdded',
                    type: 'POST',
                    data: {userId:getUserId, inventoryId: data.inventory_id},
                    datatype: 'json',
                    async: false,
                    success: function(response) {

                    }
                });
            }




            var minDate = '';
            if (idButton == 'btnUsedManual' || idButton == 'btnWastedManual') {

                if (idButton == 'btnUsedManual'){
                    wasted = 0;
                }

                if (idButton == 'btnWastedManual'){
                    wasted = 1;
                }



                $('#myModalDate').modal('show');
                $('#myModalDate').on('shown.bs.modal', function (e) {

                });


                if ($('#myModalDate').data('bs.modal').isShown == true) {
                    $("#btncloseSO").addClass("disabled");
                    //console.log('modalDate opened');
                    dateInFirst().done(function (result) {
                        minDate = result.data[0].timestamp;
                        console.log(minDate);
                        $('#datetimepicker6').datetimepicker({
                            format: 'MM/DD/YYYY HH:mm:ss',
                            defaultDate: moment().local(),
                            minDate: minDate,
                            maxDate : moment(),
                        });

                        $('#datetimepicker6').data("DateTimePicker").minDate(minDate);
                    }).fail(function () {
                        console.log('error');

                    });


                }


                $("#myModalDate").on("hide.bs.modal", function () {
                    dIn = document.getElementById("dateIn").value;
                    $('#datetimepicker6').data("DateTimePicker").clear();

                });

                $("#btncloseSO").removeClass("disabled");







                 $('#myModalDate').on('click', function (event) {
                     //console.log(event);
                     if (event.target.id == 'btncloseSO'){
                         document.getElementById("codeProductOutManual").value = data.ean;
                         document.getElementById("inventoryIdManual").value = data.inventory_id;
                         document.getElementById("userIdManual").value = getUserId;
                         document.getElementById("productIdManual").value = data.inventory_product_id;
                         document.getElementById("wastedProductOutManual").value = wasted
                         document.getElementById("dateIn").value = dIn;
                         document.getElementById("scanoutFormManual").submit();
                     }
              });

            }


        });
        */
        //********* HIDE ********

    });

        //Out of Stock label active.
        document.getElementById('outStockLabel').onclick = function (e) {
            document.getElementById('inStockLabel').style.color = 'Grey';
            document.getElementById('inStockLabel').style.textDecorationColor = 'White';
            document.getElementById('outStockLabel').style.color = 'Blue';
            document.getElementById('outStockLabel').style.textDecorationColor = 'underline';
            $('#products_dataOut').DataTable().ajax.reload();

        }

        //In Stock label active.
        document.getElementById('inStockLabel').onclick = function (e) {
            document.getElementById('outStockLabel').style.color = 'Grey';
            document.getElementById('inStockLabel').style.textDecorationColor = 'Blue';
            document.getElementById('inStockLabel').style.color = 'Blue';

        }
        console.log('REF:' + window.location.href);


    // OUT OF STOCK ESSENTIALS DATATABLE
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

    //OUT OF STOCK ESSENTIALS DETAILS
    $('#products_dataOut tbody').on('click', 'button', function () {
        //$('#ModalOut').modal('show');
        var dataOut = tableOut.row($(this).parents('tr')).data();
        var source = "outStock";
        console.log(dataOut);
        detailsView(getUserId,dataOut,source);
    });

    }); //END DOCUMENT READY

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




