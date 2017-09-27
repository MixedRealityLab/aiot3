
function scanOut(){
    //*********************** just scan when  'SCAN OUT TAB' is active *********************
    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        var activeTab2 = $('.nav-tabs .active').text();

        //if ($('.nav-tabs .active').text() == 'SCAN IN') {
        console.log(activeTab2);
        $(document).scannerDetection();
        $(document).bind('scannerDetectionComplete', function (e, data) {
            console.log('complete: ' + data.string);

            //alert(data.string);

            if ($('.nav-tabs .active').text() == 'SCAN OUT') {
                console.log('scanning OUT');
                document.getElementById("bCodeMessageOut").innerHTML = 'Scanning out code ' + data.string + '  <i class="fa fa-spinner fa-spin" style="font-size:24px"> </i>';
                document.getElementById("codeProductOut").value = data.string;

                $('#myModalWasted').modal('show');

                $('#myModalWasted').modal({
                    backdrop: 'static',
                    keyboard: false
                });


                $('#myModalWasted').on('click', function (event) {
                    var idButton = event.target.id;
                    if (idButton == 'btnUsedUp'){
                        document.getElementById("wastedProductOut").value = 0;
                        document.getElementById("scanoutForm").submit();
                    }
                    if (idButton == 'btnWasted') {
                        document.getElementById("wastedProductOut").value = 1;
                        document.getElementById("scanoutForm").submit();


                    }
                });



            }
            else{
                return
            }

            /*else {
                if ($('.nav-tabs .active').text() == 'ESSENTIALS' || $('.nav-tabs .active').text() == 'CALENDAR' || $('.nav-tabs .active').text() == 'INBOX')
                {
                    //alert('Go to "SCAN IN" or "SCAN OUT" tab to scan an essential');
                    window.location.reload();

                    //ask user what he want to do with barcode scanned
                    //case 1: go to scan in
                    //case 2: go to scan out
                    // case 3: nothing back to essential.

                    //bootbox.alert("Hello world!", function () {
                    //    console.log("Alert Callback");
                    //});

                }
            }*/

        });


        activeTab2 = $('.nav-tabs .active').text();


    });
    //*************************************************************************************


}

function scanOutReload() {
    //document.location.href = "http://localhost:3000";
    var activeTab2 = $('.nav-tabs .active').text();
    console.log(activeTab2);
    var getUserId = $("#HideUserId").val();
    $.ajax({
        url: '/scanOutAgain',
        type: 'POST',
        data: {userId: getUserId},
        success: function (response) {
            //getData[name] = response; //
            console.log(response);
            document.getElementById('itemAddedMessageOut').innerHTML = 'Ready to Scan Out essentials';
            document.getElementById('itemAddedDescOut').innerHTML = '';
            var x = ''; // when db will be connected check if this is showing data ok.
            for (i in response.userInventoryOut) {
                x += response.userInventoryOut[i].id + "<h4>";
            }

            console.log(x);
            document.getElementById("panelBodyScanOut").innerHTML = "<h4>" + x;//response[0].description;
            //console.log(response.userInventory[0].description);


            //*********************** just scan when  'SCAN IN TAB' is active NOT WORKING *********************
            activeTab2 = $('.nav-tabs .active').text();
            console.log(activeTab2);
            $(document).scannerDetection();
            $(document).bind('scannerDetectionComplete', function (e, data) {
                console.log('complete: ' + data.string);
                console.log('response message:'+response.messageItem);
                //alert(data.string);

                if ($('.nav-tabs .active').text() == 'SCAN OUT' && response.messageItem == 5) {
                    console.log('scanning OUT');
                    document.getElementById("bCodeMessageOut").innerHTML = 'Scanning code ' + data.string + '  <i class="fa fa-spinner fa-spin" style="font-size:24px"> </i>';
                    document.getElementById("codeProductOut").value = data.string;

                    $('#myModalWasted').modal('show');
                    $('#myModalWasted').on('click', function (event) {
                        var idButton = event.target.id;
                        if (idButton == 'btnUsedUp') {
                            document.getElementById("wastedProductOut").value = 0;
                            document.getElementById("scanoutForm").submit();
                        }
                        if (idButton == 'btnWasted')  {
                            document.getElementById("wastedProductOut").value = 1;
                            document.getElementById("scanoutForm").submit();


                        }
                    });


                }
                else{
                    return
                }
             /*   else {

                    if ($('.nav-tabs .active').text() == 'ESSENTIALS' || $('.nav-tabs .active').text() == 'CALENDAR' || $('.nav-tabs .active').text() == 'INBOX') {

                        window.location.reload();

                        //ask user what he want to do with barcode scanned
                        //case 1: go to scan in
                        //case 2: go to scan out
                        //case 3: nothing back to essential.
                    }
                }*/
                activeTab2 = $('.nav-tabs .active').text();


            });
            //*************************************************************************************
        }
    });

}

function scanIn(){
    //*********************** just scan when  'SCAN IN TAB' is active *********************
    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        var activeTab2 = $('.nav-tabs .active').text();
        //if ($('.nav-tabs .active').text() == 'SCAN IN') {
        console.log(activeTab2);
        $(document).scannerDetection();
        $(document).bind('scannerDetectionComplete', function (e, data) {
            console.log('complete: ' + data.string);
            //alert(data.string);

            if ($('.nav-tabs .active').text() == 'SCAN IN') {
                console.log('scanning in');
                document.getElementById("bCodeMessage").innerHTML = 'Scanning code ' + data.string + ' <i class="fa fa-spinner fa-spin" style="font-size:24px"> </i>';
                document.getElementById("codeProduct").value = data.string;
                document.getElementById("codeForm").submit();


            }

            else{
                return
            }
            //else {
            //alert('What do you want to do with this code? :'+ data.string );
            //if ($('.nav-tabs .active').text() == 'ESSENTIALS' || $('.nav-tabs .active').text() == 'CALENDAR' || $('.nav-tabs .active').text() == 'INBOX'){
            //alert('Go to "SCAN IN" or "SCAN OUT" tab to scan an essential');
            //window.location.reload();
            //ask user what he want to do with barcode scanned
            //case 1: go to scan in
            //case 2: go to scan out
            //case 3: nothing back to essential.
            //}

        });

    });


    activeTab2 = $('.nav-tabs .active').text();
    //}

    //});
    //*************************************************************************************

}


function scanAgain() {
    //document.location.href="http://localhost:3000";
    var activeTab2 = $('.nav-tabs .active').text();
    console.log(activeTab2);
    var getUserId = $("#HideUserId").val();

    $.ajax({
        url: '/scanInAgain',
        type: 'POST',
        data: {userId: getUserId},
        success: function (response) {
            //getData[name] = response; //
            console.log(response);
            document.getElementById('itemAddedMessage').innerHTML = 'Ready to Scan In essentials';
            document.getElementById('itemAddedDesc').innerHTML = '';
            var x= ''; // when db will be connected check if this is showing data ok.
            for (i in response.userInventory) {
                //.x += response.userInventory[i].description + "<h4>";
                x += response.userInventory[i].id + "<h4>";
            }
            console.log(x);
            document.getElementById("panelBodyScanIn").innerHTML = "<h4>"+x;//response[0].description;
            //console.log(response.userInventory[0].description);


            //*********************** just scan when  'SCAN IN TAB' is active NOT WORKING *********************
            //$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
            activeTab2 = $('.nav-tabs .active').text();
            //if ($('.nav-tabs .active').text() == 'SCAN IN') {
            console.log(activeTab2);
            $(document).scannerDetection();
            $(document).bind('scannerDetectionComplete', function (e, data) {
                console.log('complete: ' + data.string);
                //alert(data.string);

                if ($('.nav-tabs .active').text() == 'SCAN IN' && response.messageItem == 4) {
                    console.log('scanning in');
                    document.getElementById("bCodeMessage").innerHTML = 'Scanning code ' + data.string + '  <i class="fa fa-spinner fa-spin" style="font-size:24px"> </i>';;
                    document.getElementById("codeProduct").value = data.string;
                    document.getElementById("codeForm").submit();


                }
                else{
                    return
                }
                //else {
                  //  if ($('.nav-tabs .active').text() == 'ESSENTIALS' || $('.nav-tabs .active').text() == 'CALENDAR' || $('.nav-tabs .active').text() == 'INBOX') {
                        // alert('Go to "SCAN IN" or "SCAN OUT" tab to scan an essential');
                        //window.location.reload();
                        //ask user what he want to do with barcode scanned
                        //case 1: go to scan in
                        //case 2: go to scan out
                        //case 3: nothing back to essential.
                    //}

                //}
                activeTab2 = $('.nav-tabs .active').text();


            });
            //*************************************************************************************
        }
    });

}
