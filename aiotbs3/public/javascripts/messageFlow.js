$(document).ready(function(){
    document.getElementById("message1").innerHTML = 'Check Internet connection';
    document.getElementById("message2").innerHTML = 'Check barcode scanner connection';
    //alert('....');

    if(navigator.onLine){
        document.getElementById("message1").innerHTML = 'Internet connection OK';

    }else{
        document.getElementById("message1").innerHTML = 'Internet connection WRONG';
    }

});