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
            //document.getElementById("prediction").innerHTML = "Prediction/Run Out: " + response.predictedRunOut;
            //document.getElementById("average").innerHTML = "Average Consumption (days):" + response.averageDays;
            document.getElementById("reward").innerHTML = "£ "+response.reward;
        },
        error: function (xhr, status, error) {
            //alert(xhr.responseText); // error occur
            //console.log("not logged");
            //document.getElementById("award").innerHTML = 0;
        }
    });



});