function confirm(msg) {
  $('div.confirm').append().text(msg).fadeIn().delay(2000).fadeOut().remove();
}
function error(msg) {
  $('div.confirm').append().text(msg).addClass('error').fadeIn().delay(2000);
}

function closeInfoBox() {
  $('div.confirm').fadeOut().remove();
}

function nullOrEmpty(val) {
  return (val === null || val === '');
}
