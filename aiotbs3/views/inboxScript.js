$(document).on("ready", function(){
            $("#myModal").wizard({
                onfinish:function(){
                    console.log("Hola mundo");
                }
            });
        });