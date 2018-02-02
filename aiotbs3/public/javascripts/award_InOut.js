$(document).ready(function() {
    var getUserId = $("#HideUserId").val();
    //document.getElementById("reward").innerHTML = "£ "+response.award;

    $.ajax({
        url: '/getTotal_in_out',
        type: 'POST',
        data: {userId: getUserId},
        datatype: 'json',
        success: function (response) {
            console.log('success', response);
            document.getElementById("reward").innerHTML = "£ "+response.reward;
        },
        error: function (xhr, status, error) {
            //alert(xhr.responseText); // error occur

        }
    });



});