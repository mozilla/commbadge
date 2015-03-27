casper.test.begin('Test homepage loads', {
    test: function(test) {
        helpers.startCasper();

        var signInSelector = '#page .button.persona';
        casper.waitForSelector(signInSelector, function() {
            test.assertSelectorHasText(signInSelector, 'Sign in / Sign up');
        });

        helpers.done(test);
    }
});
