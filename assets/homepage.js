function horizontalWheel(container) {
  /** Max `scrollLeft` value */
  let scrollWidth;

  /** Desired scroll distance per animation frame */
  let getScrollStep = () => scrollWidth / 120 /* ADJUST TO YOUR WISH */ ;

  /** Target value for `scrollLeft` */
  let targetLeft;

  function scrollLeft() {
    let beforeLeft = container.scrollLeft;
    let wantDx = getScrollStep();
    let diff = targetLeft - container.scrollLeft;
    let dX = wantDx >= Math.abs(diff) ? diff : Math.sign(diff) * wantDx;

    // Performing horizontal scroll
    container.scrollBy(dX, 0);

    // Break if smaller `diff` instead of `wantDx` was used
    if (dX === diff)
      return;

    // Break if can't scroll anymore or target reached
    if (beforeLeft === container.scrollLeft || container.scrollLeft === targetLeft)
      return;
    requestAnimationFrame(scrollLeft);
  }

  container.addEventListener('wheel', e => {
    e.preventDefault();

    scrollWidth = container.scrollWidth - container.clientWidth;
    targetLeft = Math.min(scrollWidth, Math.max(0, container.scrollLeft + e.deltaY));

    requestAnimationFrame(scrollLeft);
  });
}

window.addEventListener('load', () => {
  let list = document.querySelector('.template-index .section');
  horizontalWheel(list);
});

$(document).ready(function (){
  var isGalleryViewed = sessionStorage.getItem("GalleryIsViewed");

  if (isGalleryViewed) {
     $('.home-gallery-entrance').addClass('hidden');
    $('.home-gallery-wrapper').addClass('show-gallery');
    $('.home-gallery-nav').addClass('show-gallery');
  } else {
    window.setTimeout(function() {
      $('.gallery-backdrop').removeClass('hide-on-entrance');
      $('.entrance-buttons').removeClass('hide-on-entrance');
      $('.gallery-arch').removeClass('hide-on-entrance');
       $('.gallery-backdrop').addClass('show-on-entrance');
      $('.entrance-buttons').addClass('show-on-entrance');
      $('.gallery-arch').addClass('show-on-entrance');
      $('.entrance-logo').addClass('hide-on-entrance');
    }, 2500);
  }
  
  document.getElementById('center-gallery-item').scrollIntoView({ inline: 'center' });
 
  $('.gallery-frame').hover(
  function() {
    $(this).closest('.gallery-frame-container').find('.to-blink').toggleClass('show');
  });

  $('#enter-gallery').click(function(){
    $('.home-gallery-entrance').addClass('zoom-in-and-fade-out');
    $('.home-gallery-wrapper').addClass('show-gallery');
    $('.home-gallery-nav').addClass('show-gallery');
    window.setTimeout(function() {
      $('.home-gallery-entrance').addClass('hidden');
    }, 2000);

     if (window.sessionStorage) {
            sessionStorage.setItem("GalleryIsViewed", true);
     }
  });
});