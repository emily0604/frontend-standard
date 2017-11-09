// Toggle the sidebars
// When the toggle button is clicked:
// 1. The sidebar is toggled: on/off
// 2. The button itselft changes the icon fold/unfold

$(function() {

  'use strict';
  let $sidebarToggleIcon = $('.sidebar__toggle-btn .anticon');
  let $messagesSidebarToggleIcon = $('.messages__sidebar__toggle-btn .anticon');

  $('.sidebar__toggle-btn, .sidebar--off__close-btn').on('click', function(e) {
    e.preventDefault();
    $('.sidebar').toggleClass('sidebar--off');
    $sidebarToggleIcon.toggleClass('icon-menufold icon-menuunfold');
  });

  $('.messages__sidebar__toggle-btn, .messages__sidebar--off__close-btn').on('click', function(e) {
    e.preventDefault();
    $('.messages__sidebar').toggleClass('messages__sidebar--off');
    $messagesSidebarToggleIcon.toggleClass('icon-menuunfold icon-menufold');
  });

})
