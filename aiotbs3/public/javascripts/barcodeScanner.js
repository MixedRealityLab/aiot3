
$(document).ready(function(){
    var activeTab2='';
    var hash = window.location.hash;


    console.log('all is well');
    //load essentials tab as active
    $('#maintab a[href="#inStock"]').tab('show');   //$('#maintab a[href="#inbox"]').tab('show'); // change to an specific tab


    //get activated and previous tabs access
    $('#maintab').on('shown.bs.tab', function (e) {
        console.log(e.target); // newly activated tab
        //console.log(e.relatedTarget); // previous active tab
    })

    //***********************************************************
    // get hash & tab access by url
    /*
        hash && $('ul.nav a[href="' + hash + '"]').tab('show');

        $('.nav-tabs a').click(function (e) {
            $(this).tab('show');
            var scrollmem = $('body').scrollTop();
            window.location.hash = this.hash;
            $('html,body').scrollTop(scrollmem);

        });
    */
    //***********************************************************



    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        activeTab2 = $('.nav-tabs .active').text();
        console.log('TAB CHANGED to: '+ $('.nav-tabs .active').text());

        if (activeTab2 == 'SCAN IN'){
            console.log('TAB CHANGED to: '+ $('.nav-tabs .active').text()); // check if user change to SCAN IN tab

            //just execute scan in process if the active tab is 'scan in'. It's need it to do the same with scan out
            $(document).scannerDetection();
            $(document).bind('scannerDetectionComplete',function(e,data){
                console.log('complete: '+data.string);
                document.getElementById("bCodeMessage").innerHTML = 'Scanning code: '+data.string;

                if(data.string){
                    console.log('scanning in');
                    document.getElementById("codeProduct").value = data.string;
                    document.getElementById("codeForm").submit();

                    //$('#maintab a[href="#scanIn"]').tab('show');
                    activeTab2='';
                }
            })



                .bind('scannerDetectionError',function(e,data){
                    console.log('detection error '+data.string);
                    codeKnown = false;
                })
                .bind('scannerDetectionReceive',function(e,data){
                    console.log('Received');
                    console.log(data.evt.which);
                })

        }
        activeTab2='';
        console.log('TAB CHANGED to: '+ $('.nav-tabs .active').text());


    })

});