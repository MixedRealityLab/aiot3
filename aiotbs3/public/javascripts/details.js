
function detailsView(userId, data, source) {
    var getUserId = userId;

    var minDate = '';
    var minDate2 = '';
    var maxDateFirst = '';

    console.log("userId:" + userId);//check
    console.log("data:" + data.ean);//check
    console.log("source:" + source);//check


    $('#myModal').modal('show');
    if (source == "outStock") {
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


    function dateInFirst() {
        return $.ajax({
            url: '/getFirstAdded',
            type: 'POST',
            data: {userId: getUserId, inventoryId: data.inventory_id},
            datatype: 'json',
            async: false,
            success: function (response) {

            }
        });
    }


//******* GET PREDICTION DATE AND AVERAGE DAYS, ALSO GET MINDATE TO USE IN MANUAL SCAN OUT*****/
    $.ajax({
        url: '/getInOutEvents2',
        type: 'POST',
        data: {userId: getUserId, inventoryId: data.inventory_id},
        datatype: 'json',
        success: function (response) {
            console.log('success', response);
            document.getElementById("prediction").innerHTML = "Prediction/Run Out: " + response.predictedRunOut;
            document.getElementById("average").innerHTML = "Average Consumption (days per item): " + response.averageDays;


            //get minDate from each item selected and use ajax call to get first scanIn
            dateInFirst().done(function (result) {
                minDate = result.data[0].timestamp;
                console.log(typeof(minDate));
                minDate2 = moment(minDate).add(1, 'm');  //adding 1 minute to original date
                minDate2 = minDate2.format('MM/DD/YYYY HH:mm:ss'); //this format is required by the widget


                maxDateFirst = moment().local();
                maxDateFirst = moment(maxDateFirst).format('MM/DD/YYYY HH:mm A'); //this format is required by the widget
                console.log('minDate Original:' + minDate);
                console.log('minDate2 + 1 minute:' + minDate2);
                console.log('maxDate:' + maxDateFirst);
            }).fail(function () {
                console.log('error getting ajax first scanIn');

            });
            //end get minData

        },
        error: function (xhr, status, error) {
            //alert(xhr.responseText); // error occurr, do something with this error
        }
    });

    // IN-OUT HISTORICAL TABLE

    $('#myModal').on('shown.bs.modal', function () {
        //here just after the modal is shown
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


        console.log('modal Details shown');


    });

    // ALLOW SCAN OUT USING BUTTONS (NOT BARCODE SCANNER)
    $('#myModal').on('click', function (event) {

        console.log('modal Details click event');

        //var today = new Date();
        //var dd = ("0" + (today.getDate())).slice(-2);
        //var mm = ("0" + (today.getMonth() + 1)).slice(-2);
        //var yyyy = today.getFullYear();
        //var time = Date.now();
        //today = dd + '-' + mm + '-' + yyyy;
        //var dIn = today;

        var wasted = 0;
        var idButton = event.target.id;


        if (idButton == 'btnStop') {
            // CREATE AJAX CALL TO DELETE AL DATA ABOUT THAT PRODUCT
            userLog(getUserId, 10, "remove permanently item nro:" + data.inventory_id);
            $('#modalWarningDelete').modal('show');
            $('#modalWarningDelete').on('click', function (event) {

                if (event.target.id == 'removeItemButton') {
                    console.log("remove button");
                    document.getElementById("inventoryIdDelete").value = data.inventory_id;
                    document.getElementById("userIdDelete").value = getUserId;
                    document.getElementById("deleteItemForm").submit();

                }
            });
        }


        // IDENTIFY IF THE PRODUCT SCANNED OUT MANUALLY WAS "WASTED" OR "USED"

        document.getElementById("demo").innerHTML = "";
        if (idButton == 'btnUsedManual' || idButton == 'btnWastedManual') {

            if (idButton == 'btnUsedManual') {
                wasted = 0;
                userLog(getUserId, 11, "button used");
                callModalDate(minDate2, maxDateFirst, wasted); //call modal to specify date

            }

            if (idButton == 'btnWastedManual') {
                wasted = 1;
                userLog(getUserId, 12, "button wasted");
                callModalDate(minDate2, maxDateFirst, wasted);

            }


        }


    });


    //FUNCTION TO CALL MODALDATE TO SELECT AN SCAN-OUT TIME
    function callModalDate(minDate2, maxDateFirst, wasted) {
        var dateInput = '';

        $('#myModalDate').modal('show');
        $('#myModalDate').on('shown.bs.modal', function (e) {


        });


        if ($('#myModalDate').data('bs.modal').isShown == true) {

            console.log('my modal date show');
            if(wasted == 1){

                document.getElementById("modalDateTitle").innerHTML = 'Wasted date';
            }

            if(wasted == 0){
                document.getElementById("modalDateTitle").innerHTML = 'Used up date';
            }


            //first load of datetimepicker
            $('#datetimepicker6').datetimepicker({
                format: 'MM/DD/YYYY HH:mm:ss',
                minDate: minDate2,
                maxDate: moment(new Date()),//maxDateFirst,
                defaultDate: moment().local(),
                useCurrent: false,
            });

            //every time that I show datetimepicker, then load default
            $('#datetimepicker6').datetimepicker({defaultDate: moment().local(),})
                .on('dp.show', function (e) {
                    console.log('showing datetimepicker');
                    $('#datetimepicker6').data("DateTimePicker").minDate(minDate2); //upgrade minDate each time datetimepicker is upgraded

                    dateInput = moment().local();
                    dateInput = dateInput.format();
                    console.log('Date chosen on show: ' + dateInput);
                    $("#btncloseSO").removeClass("disabled");

                });

            //every time datetimepicker change, then get selected date
            $('#datetimepicker6').datetimepicker()
                .on('dp.change', function (e) {
                    console.log('changing datetimepicker');

                    if (e.date) {
                        console.log('Date input default: ' + e.date.format());
                        $("#btncloseSO").removeClass("disabled");
                        dateInput = e.date.format();

                    }
                    else {
                        $("#btncloseSO").addClass("disabled");
                    }
                });
            console.log('Date chosen: ' + dateInput);


            //every time datetimepicker is hide
            $('#datetimepicker6').datetimepicker()
                .on('dp.hide', function (e) {
                    console.log('hiding datetimepicker');

                });


            //every time datetimepicker is updated (change months using arrows)
            $('#datetimepicker6').datetimepicker()
                .on('dp.update', function (e) {
                    console.log('updating datetimepicker');
                    console.log("Displayed year/month " + e.viewDate.format("YYYY MMMM"));

                });


        }


        //clear datetimepicker each time that a modal is closed
        $("#myModalDate").on("hide.bs.modal", function () {
            console.log('closing myModal datetime');
            $('#datetimepicker6').data("DateTimePicker").clear();
            //$('#datetimepicker6').datetimepicker({defaultDate: moment().local(),});
            //$('#datetimepicker6').data("DateTimePicker").date(moment());
            //$('#datetimepicker6').prop("resetDatePicker", true).find(':input').val('');


        });


        //EACH TIME SAVE BUTTON IS CLICKED THEN VALIDATE INPUT DATE ISN'T NULL
        document.getElementById('btncloseSO').onclick = function () {
            var inpObj = dateInput;//document.getElementById("dateIn").value;
            console.log(inpObj);

            if (!inpObj) {
                //alert("Please, select a date before save");
                document.getElementById("demo").innerHTML = 'Please, select a date before save';
                console.log(inpObj);
                console.log('input date is null');
                userLog(getUserId, 18, "not date selected/input date null");

            } else {
                document.getElementById("demo").innerHTML = " ";
                console.log(inpObj);
                console.log('input date is ok');
                userLog(getUserId, 18, "product scanned out manually");
                document.getElementById("codeProductOutManual").value = data.ean;
                document.getElementById("inventoryIdManual").value = data.inventory_id;
                document.getElementById("userIdManual").value = getUserId;
                document.getElementById("productIdManual").value = data.inventory_product_id;
                document.getElementById("wastedProductOutManual").value = wasted;
                document.getElementById("dateIn").value = dateInput;
                document.getElementById("scanoutFormManual").submit();

                $('#myModalDate').modal('hide');
            }


        };

        document.getElementById('btncloseX').onclick = function () {
            $('#myModalDate').modal('hide');
        };


    }


}











