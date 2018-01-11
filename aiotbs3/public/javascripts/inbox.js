
$(document).ready(function() {
    var getUserId = $("#HideUserId").val();


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
        "scrollY": '300px'
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
        "scrollY": '300px'
    } );


    // Add event listener for opening and closing details
    $('#beforeOut tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var tdi = tr.find("i.fa");
        var row = table.row( tr );

        //console.log(tdi);


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
    } );

    table.on("user-select", function (e, dt, type, cell, originalEvent) {
        if ($(cell.node()).hasClass("details-control")) {
            e.preventDefault();
        }
    });

    // Add event listener for opening and closing details
    $('#afterOut tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var tdi = tr.find("i.fa");
        var row = table2.row( tr );

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
    } );

    table2.on("user-select", function (e, dt, type, cell, originalEvent) {
        if ($(cell.node()).hasClass("details-control")) {
            e.preventDefault();
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
