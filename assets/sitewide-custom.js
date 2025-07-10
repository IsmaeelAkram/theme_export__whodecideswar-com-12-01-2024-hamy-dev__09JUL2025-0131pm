//Menu toggle-button for small screens
$(document).ready(function (){
  setActiveNavMenuItem();
  
  $("#menu-open").on("click", function() {
    $("#menu-pane").toggleClass("hidden");
    $("html").addClass("overflow-hidden");
  });

  $("#menu-close").on("click", function() {
    $("#menu-pane").toggleClass("hidden");
    $("html").removeClass("overflow-hidden");
  });
});

function setActiveNavMenuItem() {
  var current = location.pathname;

    $('.nav li a').each(function(){
        var $this = $(this);

        // if the current path is like this link, make it active
        if($this.attr('href') === current){
            $this.parent().addClass('active');
        }
  });
}