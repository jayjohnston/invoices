grecaptcha.ready(function() {
  grecaptcha.execute(GRC, {action: 'submit'})
    .then(function(token) {
      $('#token').val(token);
    });
});
