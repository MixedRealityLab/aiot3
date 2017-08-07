
var containerCollection = document.getElementsByTagName("container");


function loadTimer(){
    setTimeout(function(){
        checkStatus();

    }, 5000);
}

function loadScanner(){
    setTimeout(function(){
        checkScanner();
    }, 4000);
}

//messages options



var checkStatus = function() {
    if (navigator.onLine) {
        //document.body.innerHTML = "YAY! you're online!!!!!"
        document.getElementById("message1").innerHTML = 'Internet Connection   <span class="glyphicon glyphicon-ok-circle" style="font-size:40px;color:green"></span>';
        document.getElementById("message2").innerHTML = 'Barcode Scanner Connection  <i class="fa fa-spinner fa-spin" style="font-size:32px"></i>';
        var onlineReady = document.getElementById("message1").innerHTML;
        loadScanner();
        readyScan();



    } else {
        //document.getElementById("message1").innerHTML = 'Internet Connection Lost';
        document.getElementById("message1").innerHTML = 'Internet Connection  <span class="glyphicon glyphicon-remove-circle" style="font-size:40px;color:red"></span>';
        //document.getElementById("message1").innerHTML = 'Internet connection  <i class="fa fa-spinner fa-spin" style="font-size:32px"></i>';

    }
}
checkStatus()


var checkScanner = function(){
    document.getElementById("message2").innerHTML = 'Barcode Scanner Connection  <span class="glyphicon glyphicon-ok-circle" style="font-size:40px;color:green"></span>';
    var bsReady = document.getElementById("message2").innerHTML;
}
checkScanner()



function readyScan(){
    //alert('now ready');
    document.getElementById("message1").innerHTML = '';
    document.getElementById("message2").innerHTML = '';
    document.getElementById("container2").innerHTML ='<h2>new container</h2>';
}

window.addEventListener('online',function () {
    checkStatus();

});

window.addEventListener('offline',function () {
    checkStatus();
});






$(document).ready(function(){
    document.getElementById("message1").innerHTML = 'Internet connection  <i class="fa fa-spinner fa-spin" style="font-size:32px"></i>';
    document.getElementById("message2").innerHTML = 'Barcode scanner connection  <i class="fa fa-spinner fa-spin" style="font-size:32px"></i>';
    loadTimer();

});