  $(document).ready(function(){
    
            // Smart Wizard events
            $("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
                $("#message-box").append("<br /> > <strong>leaveStep</strong> called on " + stepNumber + ". Direction: " + stepDirection);
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
                
                if (stepNumber==0) {
                    if(navigator.onLine) { 
                        setTimeout(internetConnection,6000);
                    }
                    else{
                        document.getElementById("id02_0").innerHTML = "Internet connection *WRONG*";
                        document.getElementById("id02_1").innerHTML = "Barcode scanner ***";

                    }
                   
                }

                if (stepNumber==3) {
                    setTimeout(myTimeout1,6000); //move to step-5

                }

                if (stepNumber==4) {
                    //alert('paso 5');
                    //ready to scan
                    barcodeScanning();

                };


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
                    toolbarPosition: 'bottom',
                    toolbarExtraButtons: [btnFinish, btnCancel]
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
            function barcodeScanning(){
                var barcode="";
                $(document).keydown(function(e) {

                    var code = (e.keyCode ? e.keyCode : e.which);
                    if(code==13)// Enter key hit
                    {
                        alert(barcode);
                        if(barcode=='42174318'){  //go to the server and ask if barcode is on the database
                            $('#smartwizard').smartWizard("next");   // if the code is on the db, then go to the next step, adding the new item scanned
                            
                            barcode=""; 

                        }
                        else{
                            alert('unknown code')  //the barcode is not available in db and tesco api, we need to ask the user
                            // run smartwizard specific step - step-7 is about unkownitem
                            //$("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection, stepPosition) {});
                            //$('#smartwizard').smartWizard(5);
                            barcode="";
                        }

                    }
                    else if(code==9)// Tab key hit
                    {
                        alert(barcode);
                    }
                    else
                    {
                        barcode=barcode+String.fromCharCode(code);
                    }
                });

            }
            
            //
            function internetConnection() {
                    $('#smartwizard').smartWizard("next");
                    document.getElementById("id02_0").innerHTML = "Internet connection *OK*";
                    document.getElementById("id02_1").innerHTML = "Barcode scanner ***";
                    setTimeout(barcodeScannerOn,6000);
                    //$('#smartwizard').smartWizard("next");


                }
 
            function barcodeScannerOn(){
                //setTimeout(myTimeout1,6000); //move to step-3
                document.getElementById("id03_0").innerHTML = "Internet connection *OK*";
                document.getElementById("id03_1").innerHTML = "Barcode scanner *OK**";
                $('#smartwizard').smartWizard("next");
                setTimeout(myTimeout1,6000); //move to step-4

            }

            function myTimeout1() {
                $('#smartwizard').smartWizard("next");
            }

 
      }); 

  //$(window).on(checkInternet);

