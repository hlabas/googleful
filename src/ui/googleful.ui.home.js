
function onGetContentTypesClick() {
  google.script.run
      .withSuccessHandler(getContentTypesSuccess)
      .getContentTypes(mode);
}

function getContentTypesSuccess(result) {
  console.log('Result', result);
}
