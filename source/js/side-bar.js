$(document).ready(function() {
  var $menubar = $('.btn-menubar');
  var $ddmenu  = $('.dd-menu');
  $menubar.click(function() { 
    var $checkDdmenuVisible = $ddmenu.is(":visible");
    if($checkDdmenuVisible == true) {
      $ddmenu.slideUp(); 
    }else {
      $ddmenu.slideDown(); 
    }
  });
  $menubar.click(function(e) { e.stopPropagation(); });
  $(document).click(function() { 
    $ddmenu.slideUp(); 
  }); 
});
