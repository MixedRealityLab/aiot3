  $(document).ready(function(){

      document.getElementById("id01_0").innerHTML = "Checking Internet connection";
      document.getElementById("id01_1").innerHTML = "Checking Barcode scanner";
      var messageStatus= 0;
        // Smart Wizard events
        $("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
            $("#message-box").append("<br /> > <strong>leaveStep</strong> called on " + stepNumber + ". Direction: " + stepDirection);
            //alert("leave:"+stepNumber+ " Direction:"+ stepDirection );
            /*var res = confirm("Do you want to leave the step "+stepNumber+"?");
            if(!res){
                $("#message-box").append(" <strong>leaveStep</strong> Cancelled");
            }else{
                $("#message-box").append(" <strong>leaveStep</strong> Allowed");
            }
            return res;*/
        });

        // This event should initialize before initializing smartWizard
        // Otherwise this event wont load on first page load
        $("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection, stepPosition) {
            $("#message-box").append(" > <strong>showStep</strong> called on " + stepNumber + ". Direction: " + stepDirection+ ". Position: " + stepPosition);


            switch(stepNumber){
                case 0:
                    if(navigator.onLine){
                        console.log(navigator.onLine);
                        messageStatus = 0;
                        setTimeout(internetConnection(messageStatus),3000);
                    }else{
                        messageStatus = 1;
                        console.log('***'+navigator.onLine);
                        setTimeout(internetConnection(messageStatus),3000);
                    }
                    break;

                case 1:
                    console.log('step-2');
                    break;

                case 2:
                    console.log('step-3');
                    break;

                case 3:
                    console.log('step-4');
                    setTimeout(myTimeout1,6000); //move to step-5
                    break;

                case 4:
                    console.log('step-5');
                    bscanner();
                    //setTimeout(myTimeout3,3000);
                    break;

                case 5:
                    console.log('step-6');
                    setTimeout(myTimeout2,3000);
                    break;

                case 6:
                    console.log('step-7');
                    setTimeout(myTimeout1,3000);
                    break;

                case 7:
                    console.log('step-8');
                    document.getElementById("lineModalLabel").innerHTML = "Details Barcode xxx";
                    setTimeout(myTimeout4,3000);
                    break;



            }


          /*
            if (stepNumber==0) {
                if(navigator.onLine) {
                    setTimeout(internetConnection,6000);
                }
                else{
                    document.getElementById("id02_0").innerHTML = "Internet connection *WRONG*";
                    document.getElementById("id02_1").innerHTML = "Barcode scanner ***";

                }

            } else if

            if (stepNumber==3) {
                setTimeout(myTimeout1,6000); //move to step-5

            }

            if (stepNumber==4) {
                //alert(stepDirection + "Position:"+ stepPosition);
                //ready to scan
                //barcodeScanning3();


            };

            if (stepNumber==5){
                //alert(stepDirection + "Position:"+ stepPosition);
               //setTimeout(myTimeout2,6000); //move to step-5

            }

            if (stepNumber==6){
                //setTimeout(myTimeout1,6000); //move to step-8
            }

            if (stepNumber==7){
                document.getElementById("lineModalLabel").innerHTML = "Details Barcode xxx";
            }
        */

        });

        $("#smartwizard").on("beginReset", function(e) {
            $("#message-box").append("<br /> > <strong>beginReset</strong> called");
        });

        $("#smartwizard").on("endReset", function(e) {
            $("#message-box").append(" > <strong>endReset</strong> called");
        });

        $("#smartwizard").on("themeChanged", function(e, theme) {
            $("#message-box").append("<br /> > <strong>themeChanged</strong> called. New theme: " + theme);
        });

        // Toolbar extra buttons
        var btnFinish = $('<button></button>').text('Finish')
        .addClass('btn btn-info')
        .on('click', function(){ alert('Finish Clicked'); });
        var btnCancel = $('<button></button>').text('Cancel')
        .addClass('btn btn-danger')
        .on('click', function(){ $('#smartwizard').smartWizard("reset"); });

        // Smart Wizard initialize
        $('#smartwizard').smartWizard({
            selected: 0,
            theme: 'circles',
            transitionEffect:'fade',
            keyNavigation:false, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
            autoAdjustHeight:true, // Automatically adjust content height
            cycleSteps: false, // Allows to cycle the navigation of steps
            backButtonSupport: false, // Enable the back button support
            useURLhash: true, // Enable selection of the step based on url hash


            toolbarSettings: {
                showNextButton: false,
                showPreviousButton: false
                //toolbarPosition: 'bottom',
                //toolbarExtraButtons: [btnFinish, btnCancel]
        },
        anchorSettings: {
                anchorClickable: false,
                enableAllAnchors: true,
                markAllPreviousStepsAsDone: true,
                enableAnchorOnDoneStep: true,
                removeDoneStepOnNavigateBack: true
        }
    });




        // External Button Events
        $("#reset-btn").on("click", function() {
            // Reset wizard
            $('#smartwizard').smartWizard("reset");
            return true;
        });

        $("#prev-btn").on("click", function() {
            // Navigate previous
            $('#smartwizard').smartWizard("prev");
            return true;
        });

        $("#next-btn").on("click", function() {
            // Navigate next
            $('#smartwizard').smartWizard("next");
            return true;
        });

        $("#theme_selector").on("change", function() {
            // Change theme
            $('#smartwizard').smartWizard("theme", $(this).val());
            return true;
        });




        //barcode scanner just loaded in step-5
       /* function barcodeScanning(){
            var barcode="";
            //if (stepNumber==4){
                    $(document).keydown(function(e) {

                        var code = (e.keyCode ? e.keyCode : e.which);
                        if(code==13)// Enter key hit
                        {
                            alert(code);
                            alert(barcode);
                            if(barcode=='42174318'){  //go to the server and ask if barcode is on the database


                                setTimeout(myTimeout1,3000); // if the code is on the db, then go to the next step, adding the new item scanned

                                document.getElementById("id06_0").innerHTML = "Item "+barcode + " added"; //barcode;
                                //document.getElementById("id02_0").innerHTML = "Internet connection *OK*";
                                setTimeout(myTimeout2,8000);
                                barcode="";

                            }
                            else{
                                //alert('unknown code')  //the barcode is not available in db and tesco api, we need to ask the user
                                // run smartwizard specific step - step-7 is about unkownitem
                                //var elm = $("a[href*='" + step7 + "']", this.nav);
                                //alert(elm[0])**;
                                //****
                                //window.location.hash="#step-7";
                                //window.location.reload();
                                //barcode="";
                            }


                        }
                        else if(code==9)// Tab key hit
                        {
                            alert(barcode);
                        }
                        else
                        {
                            barcode=barcode+String.fromCharCode(code);
                            //window.location.hash="#step-7";42174318

                            //window.location.reload();
                            //barcode=""
                        }
                    });
            }*/


        //barcode scanner 2 just loaded in step-5
        function barcodeScanning2(){
            var barcode="";
            $(document).keydown(function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if(code==13)// Enter key hit
                {
                    //alert(code);
                    //alert(barcode);
                    alert('13')

                }
                else if(code==9)// Tab key hit
                {
                    alert(barcode);
                }
                else
                {
                    barcode=barcode+String.fromCharCode(code);
                    alert('xxx');

                }

            });
    }

        function barcodeScanning3(stepNumber){
            $('#code-scan').focus();
            $(function () {
                $('#code-scan').codeScanner({
                onScan: function ($element, barcode) {
                    console.log(barcode);
                    console.log("hash:" + window.location.hash);

                    if(barcode=='42174318' && window.location.hash=='#step-5'){
                        setTimeout(myTimeoutStep5,3000);
                        document.getElementById("id06_0").innerHTML = "Item "+ barcode + " added"; //barcode;
                        console.log(stepNumber);

                    }else if(barcode!='42174318' && window.location.hash=='#step-5' ){
                        var a=0;
                        setTimeout(myTimeoutStep7,3000);
                    }
                 //$('#smartwizard').smartWizard("prev");
                 //setTimeout(myTimeout2,2000);
                 //document.getElementsByTagName('btnPrevious')[0].click();
                 //console.log(window.location);
                 //stepNumber = 4;

                }

            });

            });

        }

        function getBarcode(){
            $(document).keydown(function(e) {

                        var code = (e.keyCode ? e.keyCode : e.which);
                        if(code==13)// Enter key hit
                        {
                            console.log("code-13");


                        }
                        else if(code==9)// Tab key hit
                        {
                            console.log("tab");
                        }
                        else
                        {
                            barcode=barcode+String.fromCharCode(code);

                        }
                    });

            //return barcode;

        }



        function bscanner(){
            barcode = getBarcode();
            if (barcode=='42174318'){
                setTimeout(myTimeout1,3000);
                document.getElementById("id06_0").innerHTML = "Item "+ barcode + " added"; //barcode;
            } else{
                setTimeout(myTimeout3,3000);
                document.getElementById("id06_0").innerHTML = "Item "+ barcode + " added"; //barcode;
            }
        }


        function internetConnection(messageStatus) {
            console.log('iconnection **')
            $('#smartwizard').smartWizard("next");
            if (messageStatus == 0){
                document.getElementById("id02_0").innerHTML = "Internet connection *OK*";
                document.getElementById("id02_1").innerHTML = "Barcode scanner ***";
                setTimeout(barcodeScannerOn,6000);
                //$('#smartwizard').smartWizard("next");

            }else{
                if (messageStatus == 1){
                    document.getElementById("id02_0").innerHTML = "Internet connection Fail";
                    document.getElementById("id02_1").innerHTML = "Barcode scanner ***";
                    //setTimeout(internetOn,6000);
                    //$("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
                        //return confirm("Do you want to leave the step "+stepNumber+"?");
                    //});
                }
            }
        }


        function barcodeScannerOn(){
            document.getElementById("id03_0").innerHTML = "Internet connection *OK*";
            document.getElementById("id03_1").innerHTML = "Barcode scanner *OK**";
            $('#smartwizard').smartWizard("next");
            setTimeout(myTimeout1,6000); //move to step-4

        }

        function internetOn(){
            document.getElementById("id02_0").innerHTML = "Plese check your internet connection";
            $('#smartwizard').smartWizard("reset");
        }

        function myTimeout1() {
            $('#smartwizard').smartWizard("next"); //*
        }

        function myTimeout2() {
            $('#smartwizard').smartWizard("prev");
        }

        function myTimeout3() {
            $('#smartwizard').smartWizard("next2");
        }

        function myTimeout4() {
            $('#smartwizard').smartWizard("prev2");
        }



        function myTimeoutStep5(barcode){
            $('#smartwizard').smartWizard("next"); //*
            //document.getElementsByTagName('btnNext')[0].click();
            //return true;
        }




        function myTimeoutStep6(){
            $('#smartwizard').smartWizard("prev");
            //window.location.hash = "step-5";
            //step="step-5"
            //var elm = $("a[href*='" + step + "']", this.nav);
            //alert(elm[0]);
            //window.location.reload();
            //window.location = elm[0];
            console.log(window.location.hash);

        }

        function myTimeoutStep7(){
             $('#smartwizard').smartWizard("next");
        }



    });


