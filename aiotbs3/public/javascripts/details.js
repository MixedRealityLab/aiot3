
function detailsView(userId, data, source){
    var getUserId = userId;

    console.log("userId:"+userId);//check
    console.log("data:"+data.ean);//check
    console.log("source:"+source);//check


    $('#myModal').modal('show');
    if (source == "outStock"){

        document.getElementById('btnStop').style.visibility = 'hidden';
        document.getElementById('btnUsedManual').style.visibility = 'hidden';
        document.getElementById('btnWastedManual').style.visibility = 'hidden';

    }
    else {
        document.getElementById('btnStop').style.visibility = 'visible';
        document.getElementById('btnUsedManual').style.visibility = 'visible';
        document.getElementById('btnWastedManual').style.visibility = 'visible';

    }


    document.getElementById("descriptionModal").innerHTML = "Product Description: " + data.description;
    document.getElementById("eanCode").innerHTML = "Barcode: " + data.ean;
    document.getElementById("brand").innerHTML = "Brand: " + data.brand_name;
    document.getElementById("quantity").innerHTML = "Quantity: " + data.quantity + data.quantity_units;


    //******* GET PREDICTION DATE AND AVERAGE DAYS*****/
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
            //alert(xhr.responseText); // error occurr, do something with this error
        }
    });

    // IN-OUT HISTORICAL TABLE

    $('#myModal').on('shown.bs.modal', function () {
        // will only come inside after the modal is shown
        $.fn.dataTable.tables({visible: true, api: true}).columns.adjust();

        //IN - OUT DATATABLE
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
        //END IN-OUT DATATABLE

    });

    // ALLOW SCAN OUT USING BUTTONS (NOT BARCODE SCANNER)
    $('#myModal').on('click', function (event) {
        var today = new Date();
        var dd = ("0" + (today.getDate())).slice(-2);
        var mm = ("0" + (today.getMonth() + 1)).slice(-2);
        var yyyy = today.getFullYear();
        today = dd + '-' + mm + '-' + yyyy;
        var wasted = 0;
        var dIn = today;
        var idButton = event.target.id;


        if (idButton == 'btnStop') {
            // CREATE AJAX CALL TO DELETE AL DATA ABOUT THAT PRODUCT
            userLog(getUserId,10,"remove permanently item xxx"+data.inventory_id);

            $('#modalWarningDelete').modal('show');



        }

        //FUNCTION TO GET THE DATE IN FIRST --- CHECK THE PURPOSE
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

        // IDENTIFY IF THE PRODUCT SCANNED OUT MANUALLY WAS "WASTED" OR "USED"
        var minDate = '';
        if (idButton == 'btnUsedManual' || idButton == 'btnWastedManual') {

            if (idButton == 'btnUsedManual'){
                wasted = 0;
                userLog(getUserId,11,"button used");

            }

            if (idButton == 'btnWastedManual'){
                wasted = 1;
                userLog(getUserId,12,"button wasted");

            }

            $('#myModalDate').modal('show');
            $('#myModalDate').on('shown.bs.modal', function (e) {

            });

            //GETTING DATA TO MANUAL SCAN OUT PROCESS
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

            //DATETIME PICKER TO MANUAL SCAN-OUT PROCESS
            $("#myModalDate").on("hide.bs.modal", function () {
                dIn = document.getElementById("dateIn").value;
                $('#datetimepicker6').data("DateTimePicker").clear();

            });

            $("#btncloseSO").removeClass("disabled");


            //SUBMIT PROCESS TO SCAN-OUT MANUALLY A PRODUCT
            $('#myModalDate').on('click', function (event) {
                //console.log(event);
                if (event.target.id == 'btncloseSO'){
                    userLog(getUserId,18,"product scanned out manually");
                    document.getElementById("codeProductOutManual").value = data.ean;
                    document.getElementById("inventoryIdManual").value = data.inventory_id;
                    document.getElementById("userIdManual").value = getUserId;
                    document.getElementById("productIdManual").value = data.inventory_product_id;
                    document.getElementById("wastedProductOutManual").value = wasted;
                    document.getElementById("dateIn").value = dIn;
                    document.getElementById("scanoutFormManual").submit();
                }
            });

        }


    });


}