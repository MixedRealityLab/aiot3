
$(document).ready(function(){

	//$("#bCode").scannerDetection();

	console.log('all is well');


	
	$(document).scannerDetection();
	$(document).bind('scannerDetectionComplete',function(e,data){
            console.log('complete '+data.string);
            $("#bCode").val(data.string);
            document.getElementById("bCode").innerHTML = data.string;

        })
        .bind('scannerDetectionError',function(e,data){
            console.log('detection error '+data.string);
        })
        .bind('scannerDetectionReceive',function(e,data){
            console.log('Recieve');
            console.log(data.evt.which);
        })

    $(document).scannerDetection('success');



    
});