$(document).ready(function(){
  function extractTextBetween(subject, start, end) {
	try{
		return subject.split(start)[1].split(end)[0];
	} catch(e){
		console.log("Exception when extracting text", e);
	}
}

  function updateUrlParams(searchVal, sortVal) {
  if (searchVal) {
    window.history.replaceState(null, null, `?${$.param({
     search: searchVal
    })}`);
  }
    if (searchVal && sortVal) {
    window.history.replaceState(null, null, `?${$.param({
     search: searchVal,
     sort_by: sortVal
    })}`);
  }
}

function fetchProductsPage(linkURL) {
  fetch(linkURL).then(function (response) {
    return response.text();
  }).then(function (html) {
     if (html.includes('Check the spelling or use a different word or phrase.')) {
       document.getElementById("ProductGridContainer").innerHTML = '<div class="product-not-found">No products found. Check the spelling or use a different word or phrase.</div>';
     } else {
       $("#category li").removeClass("active");
        var match = extractTextBetween(html, '<div id="StartSingleCollectionGridTemplate"></div>', '<div id="EndSingleCollectionGridTemplate"></div>');
        document.getElementById("ProductGridContainer").innerHTML = match;
        var endlessScroll = new Ajaxinate();
     } 
  }).catch(function (err) {
      console.warn('Something went wrong.', err);
     document.getElementById("ProductGridContainer").innerHTML = '<div class="product-not-found">No products found. Check the spelling or use a different word or phrase.</div>';
  });
}

    /// Live search
    var preLoadLoadGif = '<img src="https://cdn.shopify.com/s/files/1/0054/4492/7601/t/7/assets/ajax-loader.gif?v=1701114272" />';
    var searchTimeoutThrottle = 500;
    var searchTimeoutID = -1;
    var currReqObj = null;
    var $resultsBox = $('#ProductGridContainer');
    var originalResultBox = $('#ProductGridContainer').html();
    $('#search-field').on('input', function(){
        //Only search if search string longer than 2, and it has changed
	if($(this).val().length > 2 && $(this).val() != $(this).data('oldval')) {
            //Reset previous value
            $(this).data('oldval', $(this).val());
            
            // Kill outstanding ajax request
            if(currReqObj != null) currReqObj.abort();
            
            // Kill previous search
            clearTimeout(searchTimeoutID);
          
          	var $form = $('#search-form');
          
          	//Search term
          	var term = '*' + $form.find('input[name="q"]').val() + '*';
            
            //URL for full search page
            var sort = $('#sort-by').find(".active").attr("value");
            let linkURL = $form.attr('action') + '?type=product&q=' + term;
            if (!!sort) {
              linkURL = $form.attr('action') + '?type=product&q=' + term + '&sort_by=' + sort;
            }
            // updateUrlParams(term, sort);
            //Show loading
            $resultsBox.html(preLoadLoadGif);
            
            // Do next search (in X milliseconds)
            searchTimeoutID = setTimeout(function(){
                //Ajax hit on search page
              // fetchProductsPage(linkURL);
            }, searchTimeoutThrottle);
        } else if ($(this).val().length <= 2) {
            //Deleted text? Clear results
            $resultsBox.innerHTML = originalResultBox;
        }
    }).attr('autocomplete', 'off').data('oldval', '').bind('focusin', function(){
        //Focus, show results
        $resultsBox.fadeIn(200);
    }).bind('click', function(e){
        //Click, prevent body from receiving click event
        e.stopPropagation();
    });

  $("#search-open-button").on("click", function() {
  $(this).toggleClass("hidden");
    $("#search-area").toggleClass("show");
});

$("#search-cancel-button").on("click", function() {
  $("#search-open-button").toggleClass("hidden");
  $("#search-area").toggleClass("show");
  $('#search-field').val("");
});
  
    //Search box should mimic live search string: products only, partial match
    // $('#search-form').on('submit', function(e){
    //   e.preventDefault();
    //   var term = '*' + $(this).find('input[name="q"]').val() + '*';
    //   var linkURL = $(this).attr('action') + '?type=product&q=' + term;
    //   window.location = linkURL;
    // });

    // search ends
});