/*$(document).ready(function(){
   $('#addUnknownItem').submit(function(e) {
    var postData = $(this).serializeArray();
    var formURL = $(this).attr("action");
    console.log('success!')
    $.ajax({
        url: formURL,
        type: "POST",
        data: postData,
        success: function(data) {
        console.log('success!')
      }
    });
    e.preventDefault(); //STOP default action
});
});
*/

//$(document).on('submit', 'form#addUnknownItem', function(e) {
    //e.preventDefault();
    
  //  activaTab('scanIn');
    //console.log('success!')
    /*$.post('/addUnknownItem', $(this).serialize(), function(response) {
        $('#dialog').html(response);
        $('#dialog').modal('show');
    });*/
//});

function activaTab(tabID){
    $('.nav-tabs a[href="#' + tabID + '"]').tab('show');
};

//$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
//    var target = this.href.split('#');
//    $('.nav a').filter('a[href="#'+target[1]+'"]').tab('show');
//})


$("#addUnknownItem").submit(function(event) {
    event.preventDefault();
    var val = $(this).find('input[type="text"]').val();
    activaTab('scanIn');
    console.log('success!')

    // I like to use defers :)
    deferred = $.post("/addItem", { val: val });

    deferred.success(function () {
        // Do your stuff.
    });

    deferred.error(function () {
        // Handle any errors here.
    });
});


//step-6.row.setup-content