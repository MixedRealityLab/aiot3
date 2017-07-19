
/*$(function () {
	var activeTab = $('[href=' + location.hash + ']');
	activeTab && activeTab.tab('show');
});
*/
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = this.href.split('#');
    $('.nav a').filter('a[href="#'+target[1]+'"]').tab('show');
    $('#step-4.row.setup-content').click();
})