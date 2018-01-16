
$(document).ready(function() {
    var getUserId = $("#HideUserId").val();
    var dataBefore = '';
    var dataAfter = '';
    var afterBefore = 0;

    var table = $('#beforeOut').DataTable( {
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getScannedOutBeforePrediction',
            type: 'POST',
            data: {userId: getUserId}

        },
        select:"single",
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": '',
                "render": function () {
                    return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
                },
                width:"15px"
            },
            {data: "description"}

        ],
        "order": [[1, 'asc']],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "scrollY": '300px',
        drawCallback : function() {
            processInfoBefore(this.api().page.info());
        }
    } );




    var table2 = $('#afterOut').DataTable( {
        "bFilter": false,
        "bInfo": false,
        "ordering": false,
        "ajax": {
            url: '/getScannedOutAfterPrediction',
            type: 'POST',
            data: {userId: getUserId}

        },
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": '',
                "render": function () {
                    return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
                },
                width:"15px"
            },
            {data: "description"}

        ],
        "order": [[1, 'asc']],
        "lengthChange": false,
        "length": 10,
        "paging": false,
        "scrollY": '300px',
        drawCallback : function() {
            processInfoAfter(this.api().page.info());
        }
    } );


    //info tables
    //var infoBefore = table.page.info();
    //var infoAfter =  table2.page.info();

    //console.log(infoAfter);
    //document.getElementById("spanbefore").innerText = infoBefore.length;

    function processInfoBefore(info) {
        console.log(info.recordsTotal);
        //do your stuff here
        document.getElementById("spanbefore").innerText = info.recordsTotal;
    }

    function processInfoAfter(info) {
        console.log(info.recordsTotal);
        //do your stuff here
        document.getElementById("spanafter").innerText = info.recordsTotal;
    }


    // Add event listener for opening and closing details
    $('#beforeOut tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var tdi = tr.find("i.fa");
        var row = table.row( tr );
        afterBefore = 0;




        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tdi.first().removeClass('fa-minus-square');
            tdi.first().addClass('fa-plus-square');
        }
        else {
            // Open this row
            row.child(format_early(row.data())).show();
            tr.addClass('shown');
            tdi.first().removeClass('fa-plus-square');
            tdi.first().addClass('fa-minus-square');
            //myFunction();

        }

        dataBefore = table.row($(this).parents('tr')).data();

        //console.log(dataBefore);




    } );

    table.on("user-select", function (e, dt, type, cell, originalEvent) {
        if ($(cell.node()).hasClass("details-control")) {
            e.preventDefault();
            console.log("click row before");
        }
    });

    // Add event listener for opening and closing details
    $('#afterOut tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var tdi = tr.find("i.fa");
        var row = table2.row( tr );
        afterBefore = 1;

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tdi.first().removeClass('fa-minus-square');
            tdi.first().addClass('fa-plus-square');
        }
        else {
            // Open this row
            row.child(format_late(row.data())).show();
            tr.addClass('shown');
            tdi.first().removeClass('fa-plus-square');
            tdi.first().addClass('fa-minus-square');
        }

        dataAfter = table2.row($(this).parents('tr')).data();
        console.log("click row after");

    } );

    table2.on("user-select", function (e, dt, type, cell, originalEvent) {
        if ($(cell.node()).hasClass("details-control")) {
            e.preventDefault();
            //console.log("click row after");
        }
    });


    //sending data to update feedback
    $('#otherModal').on('click', function (event) {
        var idButton = event.target.id;
        if (event.target.id == 'btnSaveFeedback'){
            //if($("#feedback_text").val().trim().length < 1)
            //{
            //    alert("Please Enter Text...");
            //    return;
            //}

            if(document.getElementById("feedback_text").value == "")
            {
                alert("Please add feedback text...");
                //return;

            }
            else{

                if(afterBefore == 0){
                    console.log("saving feedback before");
                    console.log(dataBefore);
                    document.getElementById("feedback_status").value = 1;
                    document.getElementById("feedback_after_before").value = 0;
                    document.getElementById("prediction_id").value = dataBefore.prediction_id;
                    document.getElementById("inventory_id").value = dataBefore.inventory_id;
                    document.getElementById("feedbackPrediction").submit();






                }
                else{
                    console.log("saving feedback after");
                    console.log(dataAfter);
                    var feedbackText =  document.getElementById("feedback_text").value;
                    //document.getElementById("feedback_status").value = 1;
                    //document.getElementById("feedback_after_before").value = 1;
                    //document.getElementById("prediction_id").value = dataAfter.prediction_id;
                    //document.getElementById("inventory_id").value = dataAfter.inventory_id;
                    //document.getElementById("feedbackPrediction").submit();


                    $.ajax({
                        url: '/feedbackPredictionAjax',
                        type: 'POST',
                        data: {feedback_status: 1, feedback_after_before: 1, prediction_id:dataAfter.prediction_id, inventory_id:dataAfter.inventory_id, feedbackText:feedbackText },
                        datatype: 'json',
                        success: function (response) {
                            console.log('success', response);
                            //document.getElementById("statusData").innerHTML = "Server response:" + response.msg;

                        },
                        error: function (xhr, status, error) {
                            alert(xhr.responseText); // error occur
                        }
                    });

                }




            }


        }


    });


} );



function feedbackInformation(value){
    var radioValue = $("input[name='valueBeforeAfter']:checked"). val();
    console.log(radioValue);
    if(radioValue=='other')
    {
        $('#otherModal').modal('show');
    }
    else
    {
        $('#feedbackModal').modal('show');
        //feedbackBody
        if (radioValue=='notUsed') {
            document.getElementById("feedbackBody").innerHTML = 'Product Not Used';
        }
        else{
            document.getElementById("feedbackBody").innerHTML = 'Product forgot to scan out';
        }
    }

}



function format_early(d){
    // `d` is the original data object for the row
    document.getElementById("feedback_text").value = '';
    $('#otherModal').modal('show');

    // language=HTML
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
        //'<tr>' +
        //'</tr>' +
        //'<tr>' +
        //'<form action="">'+
        //'</form>' +
        '<center><i>Tell us why the product was used early </i></center>' +
        //'<input type="text" name="valueEarly">'+
        //'<input type="radio" id="radio1" name="valueBeforeAfter" value="notUsed" onclick="feedbackInformation(this);"> Not Used'+
        //'<input type="radio" id="radio2" name="valueBeforeAfter" value="forgot" onclick="feedbackInformation(this);"> Forgot to scan out'+
        //'<input type="radio" id="radio3" name="valueBeforeAfter" value="other"  onclick="feedbackInformation(this);"> Other '+
        '</table>';
}


function format_late(d){
    // `d` is the original data object for the row
    document.getElementById("feedback_text").value = '';
    $('#otherModal').modal('show');
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
        '<tr>' +
        '</tr>' +
        '<tr>' +
        '<center><i>Tell us why the product was used later </i></center>' +
        '<p></p>'+
        //'<form action="">'+
        //'<input type="radio" id="radio1" name="valueBeforeAfter" value="notUsed" onclick="feedbackInformation(this);"> Not Used'+
        //'<input type="radio" id="radio2" name="valueBeforeAfter" value="forgot" onclick="feedbackInformation(this);"> Forgot to scan out'+
        //'<input type="radio" id="radio3" name="valueBeforeAfter" value="other"  onclick="feedbackInformation(this);"> Other '+
        //'</form>' +

        '</table>';

}
