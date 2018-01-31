function userLog(userId, category,metadata ) {
    var timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

    $.ajax({
        url: '/userLog',
        type: 'POST',
        data: {userId: userId,category:category,timestamp: timestamp, metadata: metadata },
        success: function (response) {
            //location.href = '/';
        }

    });


}