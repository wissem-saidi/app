$(function () {
	$('.datepicker').datepicker({
 	   startView: "decade", 
	   language: 'fr',
       	   autoclose: true
	});
	
	$('.timepicker').timepicker({
	    showInputs: false,
	    showMeridian: false
	});
	
	$('.datatable').DataTable({
      'paging'      : true,
      'lengthChange': false,
      'searching'   : true,
      'ordering'    : true,
      'info'        : true,
      'autoWidth'   : false
    })
});

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}
