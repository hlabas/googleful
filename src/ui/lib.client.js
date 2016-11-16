function confirm(msg) {
  $('div.confirm').append().text(msg).fadeIn().delay(2000).fadeOut().remove();
}

function nullOrEmpty(val) {
  return (val === null || val === '');
}
