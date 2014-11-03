-include bower_components/marketplace-gulp/Makefile

init:
	@npm install
	@node_modules/.bin/bower install
	@node_modules/.bin/gulp update
	@cp src/media/js/settings_local.js.dist src/media/js/settings_local.js
