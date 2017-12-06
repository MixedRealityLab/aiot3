$(document).ready(function() {
    var getUserId = 3;//$("#HideUserId").val();

    // page is now ready, initialize the calendar...
    var today = new Date();
    var dd = ("0" + (today.getDate())).slice(-2);
    var mm = ("0" + (today.getMonth() + 1)).slice(-2);
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;


    function formatJSONDate(jsonDate) {
        var newDate = dateFormat(jsonDate, "dd/mm/yyyy");
        return newDate;
    }

    $('#calendar').fullCalendar({
        //themeSystem: 'yeti',
        //defaultView: 'basicWeek',
        locale:'en-gb',
        format:'ddd M',
        header: {
            left: 'prev',
            center: 'title',
            right: 'next, month,basicWeek'
        },
        views: {
            basicWeek: { // name of view
                //titleFormat: 'DD,MM '

                // other view-specific options here
            }
        },
        defaultView: 'basicWeek',
        defaultDate: today,
        weekNumbers: false,
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        /*events: [
            {
                title: 'All Day Event',
                start: '2017-12-04'
            },
            {
                title: 'All Day Event',
                start: '2017-12-04'
            },
            {
                title: 'Long Event',
                start: '2017-11-07',
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: '2017-12-09T16:00:00'
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: '2017-12-09T16:00:00'
            },
            {
                title: 'Conference',
                start: '2017-12-11',
                end: '2017-12-13'
            },
            {
                title: 'Meeting',
                start: '2017-12-12T10:30:00',
                end: '2017-12-12T12:30:00'
            },
            {
                title: 'Lunch',
                start: '2017-12-12T12:00:00'
            },
            {
                title: 'Meeting',
                start: '2017-21-12T14:30:00'
            },
            {
                title: 'Happy Hour',
                start: '2017-12-12T17:30:00'
            },
            {
                title: 'Dinner',
                start: '2017-12-12T20:00:00'
            },
            {
                title: 'Birthday Party',
                start: '2017-11-13T07:00:00'
            },
            {
                title: 'Click for Google',
                url: 'http://google.com/',
                start: '2017-11-28'
            }
        ]*/
        events: function (start, end, timezone, callback) {


            $.ajax({
                url: '/getInventoryDataPrediction',
                type: 'POST',
                dataType: 'json',
                data: {userId: getUserId},

                success: function (result) {
                    var events = [];
                    $.each(result, function (i, item) {

                        events.push({
                            title: result[i].description,
                            start: result[i].predicted_need_date,// will be parsed
                            end: new Date(result[i].predicted_need_date).getDate()// will be parsed
                        });
                    })
                    callback(events);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    alert(thrownError);

                }


            });
        }


    });


});