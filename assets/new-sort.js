function extractTextBetween(subject, start, end) {
	try{
		return subject.split(start)[1].split(end)[0];
	} catch(e){
		console.log("Exception when extracting text", e);
	}
}

function updateUrlParams(cat_value, sort_value, search_value, tag_value) {
   window.history.replaceState(null, null, `?${$.param({
     category: cat_value,
     sort_by: sort_value,
     search: search_value,
     type: tag_value
    })}`);
}

function restoreScrollPosition() {
    var scrollPosition = localStorage.getItem('scrollPosition');
    if (scrollPosition !== null) {
      $("html, body").animate({ scrollTop: parseInt(scrollPosition) }, {
        duration: 0,
        easing: 'linear'
      });
      if ($(window).scrollTop() >= parseInt(scrollPosition)) {
        localStorage.removeItem('scrollPosition');
      }
    }
}

function fetchProductsPage(cat_value, sort_value, search_value, tag_value, withHistory) {
  let url = '/collections/all';
  if (!!search_value) {
    const withTag = `tag:${tag_value}%20`;
    url = `search?type=product&q=${tag_value ? withTag : ''}${search_value}&options[prefix]=last${sort_value ? `&sort_by=${sort_value}` : ''}`;
  } else {
    url = `/collections/${cat_value}/${tag_value}?sort_by=${sort_value}`;
  }
  
   fetch(url).then(function (response) {
    return response.text();
  }).then(function (html) {
     if (html.includes('404 Not Found') || html.includes('Check the spelling or use a different word or phrase.') || html.includes('No products found')) {
       document.getElementById("ProductGridContainer").innerHTML = '<div class="product-not-found">No products found. Please try again.</div>';
       $('.collections-loader').css('display', 'none');  
     } else {
        var match = extractTextBetween(html, '<div id="StartSingleCollectionGridTemplate"></div>', '<div id="EndSingleCollectionGridTemplate"></div>');
        document.getElementById("ProductGridContainer").innerHTML = match;
        var endlessScroll = new Ajaxinate({
          cache: true,
          history: true,
          callback: function() {
            if (withHistory && (!/Mobi|Android/i.test(navigator.userAgent) || $(window).width() > 768)) {
                restoreScrollPosition();
            }
          }
        });

        $('.grid-collection-with-sidebar .collection.page-width').css('opacity', '1');
        $('.collections-loader').css('display', 'none');
       if (!withHistory) {
         $(window).scrollTop(0);
       }
     } 
  }).catch(function (err) {
      console.warn('Something went wrong.', err);
     document.getElementById("ProductGridContainer").innerHTML = '<div class="product-not-found">No products found. Please try again.</div>';
       $('.collections-loader').css('display', 'none');
  });
}

function setActiveSortItem(listItems, value) {
  $(listItems).each(function(){
      var $this = $(this);
      if($this.attr('value').indexOf(value) !== -1){
          $this.addClass('active').siblings().removeClass("active");
      }
  })
}

function setActiveTag(value) {
  $(`#${value}-accordion-header`).addClass('active').siblings().removeClass("active");
  var content = $(`#${value}-accordion-header`).next('.accordion-content');
  content.slideToggle();
}

function getProductsFromUrlParams() {
  let cat;
  let sort;
  let searchVal;
  var searchParams = new URLSearchParams(window.location.search);
  sort = searchParams.get('sort_by');
  cat = searchParams.get('category');
  searchVal = searchParams.get('search');
  tag = searchParams.get('type');

  if (cat || sort || searchVal || tag) {
    fetchProductsPage(cat, sort, searchVal, tag, true);
    sort && setActiveSortItem('#sort-by li', sort);
    cat && setActiveSortItem('#women-category li', cat);
    tag && setActiveTag(tag);
    if (tag === "women" && !!cat) {
      setActiveSortItem('#women-category li', cat);
    }

    if (tag === "men" && !!cat) {
      setActiveSortItem('#men-category li', cat);
    }

    if (cat === "archive") {
      setActiveTag(cat);
      tag.length > 2 && setActiveSortItem('#archive-category li', tag);
    }
  } else {
      fetchProductsPage('new-arrivals', null, '', null, true);
  }
}

function setCategoryScrollText() {
  // polyfill
window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var speed = 2000;
(function currencyItem(){
    var currencyPairWidth = $('#category .select-item:first-child').outerWidth();
    if ($(window).width() < 1025) {
    $("#category.collection-select").animate({marginLeft:-currencyPairWidth},speed, 'linear', function(){
                $(this).css({marginLeft:0}).find("li:last").after($(this).find("li:first"));
        });
        requestAnimationFrame(currencyItem);
    } else {
      $("#category.collection-select").stop( true, true );
    }
})();
}

function setSortScrollText() {
  // polyfill
window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var speed = 5000;
(function currencyItem(){
    var currencyPairWidth = $('#sort-by .select-item:first-child').outerWidth();
  if ($(window).width() < 500) {
    $("#sort-by.collection-select").animate({marginLeft:-currencyPairWidth},speed, 'linear', function(){
      $(this).css({marginLeft:0}).find("li:last").after($(this).find("li:first"));
    });
    requestAnimationFrame(currencyItem);
  } else {
    $("#sort-by.collection-select").stop( true, true );
  }
})();
}

// Debounce function to delay execution until the user stops typing
function debounce(func, delay) {
    let timeout;
    return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), delay);
    };
}

let category = 'all';
let sort = $('#sort-by').find(".active").attr("value");
let tag, searchValue;

$('#sort-by li').click(function(e){
  $(this).addClass('active').siblings().removeClass("active");
  sort = $(this).attr("value");

  updateUrlParams(category, sort, searchValue, tag);
  fetchProductsPage(category, sort, searchValue, tag);
});

$('#men-category li').click(function () {
  var searchVal = $('#search-field')[0].value;
  $(this).addClass('active').siblings().removeClass("active");
  $('.collection-select').not($(this).closest('.collection-select')).find('li').removeClass("active");
  
  category = $(this).attr("value");
  sort = $('#sort-by').find(".active").attr("value");
  const searchCancel = $('.search-area.show #search-cancel-button');
  searchCancel.click();
  searchValue = null;
  updateUrlParams(category, sort, searchValue, "men");
  fetchProductsPage(category, sort, searchValue, "men");
});

$('#women-category li').click(function () {
  $(this).addClass('active').siblings().removeClass("active");
  $('.collection-select').not($(this).closest('.collection-select')).find('li').removeClass("active");
  
  category = $(this).attr("value");
  sort = $('#sort-by').find(".active").attr("value");
  const searchCancel = $('.search-area.show #search-cancel-button');
  searchCancel.click();
  searchValue = null;
  updateUrlParams(category, sort, searchValue, "women");
  fetchProductsPage(category, sort, searchValue, "women");
});

$('#archive-category li').click(function () {
  $(this).addClass('active').siblings().removeClass("active");
  $('.collection-select').not($(this).closest('.collection-select')).find('li').removeClass("active");
  
  tag = $(this).attr("value");
  sort = $('#sort-by').find(".active").attr("value");
  category = "archive";
  
  const searchCancel = $('.search-area.show #search-cancel-button');
  searchCancel.click();
  searchValue = null;
  
  updateUrlParams(category, sort, searchValue, tag);
  fetchProductsPage(category, sort, searchValue, tag);
});

$(document).on('click', '.full-unstyled-link', function() {
  const scrollPosition = $(window).scrollTop();
  localStorage.setItem('scrollPosition', scrollPosition);
});


$(document).ready(function() {
  var scrollPosition = localStorage.getItem('scrollPosition');
    // if (scrollPosition !== null && scrollPosition > 100) {
    //     getProductsFromUrlParams();
    // }
  getProductsFromUrlParams();

  $('#reset-button').click(function() {
    $('.accordion-header').removeClass("active");
    $('.select-item').removeClass("active");
    $('.accordion-content').slideUp();
    updateUrlParams('new-arrivals', null, "", "");
    fetchProductsPage('new-arrivals', null, "", "");
    const searchCancel = $('.search-area.show #search-cancel-button');
    searchCancel.click();
    $(window).scrollTop(0);
    sort = null;
    tag = null;
    searchValue = "";
  });

  $('#women-accordion .accordion-header').click(function() {
    if (!$(this).hasClass("active")) {
      $(this).addClass('active');
      tag = "women";
      category= 'all';
      var content = $(this).next('.accordion-content');
      // Slide up all other accordion contents and remove active states
        $('.accordion-content').not(content).slideUp();
        $('.accordion-header').not(this).removeClass("active");
        $('.collection-select li').not('#women-category li').removeClass("active");
      
      content.slideToggle();

      $("html, body").animate({ scrollTop: 0 });
      
      $(this).closest('.gender-accordion-item').find('.collection-select li').removeClass('active');
      $(this).closest('.gender-accordion-item').find('.collection-select li:first').addClass('active');
      
      updateUrlParams(category, sort, searchValue, tag);
      fetchProductsPage(category, sort, searchValue, tag);
    }
  });

  $('#men-accordion .accordion-header').click(function() {
    if (!$(this).hasClass("active")) {
      $(this).toggleClass('active');
      tag = "men";
      category= 'all';
      var content = $(this).next('.accordion-content');
      // Slide up all other accordion contents and remove active states
        $('.accordion-content').not(content).slideUp();
        $('.accordion-header').not(this).removeClass("active");
        $('.collection-select li').not('#men-category li').removeClass("active");
      
      content.slideDown();

      $("html, body").animate({ scrollTop: 0 });
      
      $(this).closest('.gender-accordion-item').find('.collection-select li').removeClass('active');
      $(this).closest('.gender-accordion-item').find('.collection-select li:first').addClass('active');
      
      updateUrlParams(category, sort, searchValue, tag);
      fetchProductsPage(category, sort, searchValue, tag);
    }
  });

  $('#archive-accordion .accordion-header').click(function() {
    if (!$(this).hasClass("active")) {
      $(this).addClass('active');
      tag = "";
      category= 'archive';
      var content = $(this).next('.accordion-content');
      // Slide up all other accordion contents and remove active states
        $('.accordion-content').not(content).slideUp();
        $('.accordion-header').not(this).removeClass("active");
        $('.collection-select li').not('#archive-category li').removeClass("active");
      
      content.slideToggle();
      
      $("html, body").animate({ scrollTop: 0 });
      
      updateUrlParams(category, sort, searchValue, tag);
      fetchProductsPage(category, sort, searchValue, tag);
    }
  });

    const searchField = $('#search-field');
    function handleSearch() {
      const formattedSearchTerm = encodeURIComponent(searchField.val()).replace(/%20/g, '+');
      searchValue = formattedSearchTerm;
      fetchProductsPage(category, sort, searchValue, tag);
    }
    searchField.on('input', debounce(handleSearch, 300));

    // Save the scroll position before refreshing the page
      $(window).on('beforeunload', function() {
          localStorage.setItem('scrollPosition', $(window).scrollTop());
      });
});