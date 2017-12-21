
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

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tdi.first().removeClass('fa-minus-square');
            tdi.first().addClass('fa-plus-square');
        }
        else {
            // Open this row
            row.child(format(row.data())).show();
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
        var row = table.row( tr );

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tdi.first().removeClass('fa-minus-square');
            tdi.first().addClass('fa-plus-square');
        }
        else {
            // Open this row
            row.child(formatAfter(row.data())).show();
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


function myFunction() {


    if(document.getElementById("radio1")){

        $('input[type="radio"]').on('click', function(e) {
            console.log(e.type);
        });

    } else {
        alert("Element does not exist");
    }
}

function feedbackInformation(value){
    var radioValue = $("input[name='valueBefore']:checked"). val();
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



function format(d){


    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
        '<tr>' +
        '</tr>' +
        '<tr>' +
        '<form action="">'+
        '<input type="radio" id="radio1" name="valueBefore" value="notUsed" onclick="feedbackInformation(this);"> Not Used'+
        '<input type="radio" id="radio2" name="valueBefore" value="forgot" onclick="feedbackInformation(this);"> Forgot to scan out'+
        '<input type="radio" id="radio3" name="valueBefore" value="other"  onclick="feedbackInformation(this);"> Other '+
        '</form>'+

    '</table>';




}

function formatAfter(d){

    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
        '<tr>' +
        '</tr>' +
        '<tr>' +
        '<form action="">'+
        '<input type="radio" name="valueAfter" value="notUsed"> Not Used'+
        '<input type="radio" name="valueAfter" value="forgot"> Forgot to scan out'+
        '<input type="radio" name="valueAfter" value="other"> Other '+
        '</form>'
    '</table>';
}