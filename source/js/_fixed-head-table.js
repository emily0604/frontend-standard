function fixedHeadTable(container) {
  'use strict';

  // Store references to table elements
  let thead = container.querySelector('thead');
  let tbody = container.querySelector('tbody');

  // Add inline styles to fix the header row and leftmost column
  function relayout() {
    let ths = [].slice.call(thead.querySelectorAll('th'));
    let tbodyTrs = [].slice.call(tbody.querySelectorAll('tr'));

    //Remove inline styles to resort to the default table layout algorithm
    tbody.setAttribute('style', '');
    thead.style.width = '';
    thead.style.position = '';
    thead.style.top = '';
    thead.style.left = '';
    thead.style.zIndex = '';
    ths.forEach(th => {
      th.style.display = '';
      th.style.width = '';
      th.style.position = '';
      th.style.top = '';
      th.style.left = '';
    });
    tbodyTrs.forEach(tr => tr.setAttribute('style', ''));
    [].slice.call(tbody.querySelectorAll('td'))
      .forEach(td => {
        td.style.width = '';
        td.style.position = '';
        td.style.left = '';
      });

     //Store width and height of each th
     // Use getBoundingClientRect()'s dimensions including paddings and borders.

    let thStyles = ths.map(th => {
      let rect = th.getBoundingClientRect();
      let style = document.defaultView.getComputedStyle(th, '');
      return {
        boundingWidth: rect.width,
        boundingHeight: rect.height,
        width: parseInt(style.width, 10),
        paddingLeft: parseInt(style.paddingLeft, 10)
      };
    });

    // Set widths of thead and tbody
    let totalWidth = thStyles.reduce((sum, cur) => {
      return sum + cur.boundingWidth;
    }, 0);
    tbody.style.display = 'block';
    tbody.style.width = totalWidth + 'px';
    thead.style.width = totalWidth - thStyles[0].boundingWidth + 'px';

    // Position thead
    thead.style.position = 'absolute';
    thead.style.top = '0';
    thead.style.left = thStyles[0].boundingWidth + 'px';
    thead.style.zIndex = 2;

    // Set widths of the th elements in thead. And for the fixed th, set its position
    ths.forEach((th, i) => {
      th.style.width = thStyles[i].width + 'px';
      if (i === 0) {
        th.style.position = 'absolute';
        th.style.top = '0';
        th.style.left = -thStyles[0].boundingWidth + 'px';
      }
    });

    // Set margin-top for tbody - the fixed header is showed off here
    tbody.style.marginTop = thStyles[0].boundingHeight + 'px';

    // Set widths of the td elements in tbody. For the fixed td, set its position
    tbodyTrs.forEach((tr, i) => {
      tr.style.display = 'block';
      tr.style.paddingLeft = thStyles[0].boundingWidth + 'px';
      [].slice.call(tr.querySelectorAll('td'))
        .forEach((td, j) => {
          td.style.width = thStyles[j].width + 'px';
          if (j === 0) {
            td.style.position = 'absolute';
            td.style.left = '0';
          }
        });
    });
  };

  // Call the function
  relayout();

  // Update table cell dimensions on resize
  window.addEventListener('resize', resizeController, false);

  // Update table cell dimensions on sidebar toggle
  document.querySelector('.sidebar__toggle-btn').addEventListener('click', resizeController, false);

  let resizeTimeout;
  function resizeController() {
    if (!resizeTimeout) {
      resizeTimeout = setTimeout(function() {
        resizeTimeout = null;
        relayout();
      }, 100);
    }
  };

  // Fix thead and first column on scroll
  container.addEventListener('scroll', function() {
    thead.style.transform = 'translate3d(0,' + this.scrollTop + 'px, 0)';
    let hTransform = 'translate3d(' + this.scrollLeft + 'px, 0, 0)';
    thead.querySelector('th').style.transform = hTransform;
    [].slice.call(tbody.querySelectorAll('tr > td:first-child'))
      .forEach(function(td, i) {
        td.style.transform = hTransform;
      });
  });

  //Return an object that exposes the relayout function
  return {
    relayout: relayout
  };
}
