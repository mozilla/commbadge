gulp:
	@node_modules/.bin/gulp

init:
	@npm install
	@node_modules/.bin/bower install
	@node_modules/.bin/gulp update
	@cp src/media/js/settings_local.js.dist src/media/js/settings_local.js

update:
	@node_modules/.bin/gulp update

build:
	@node_modules/.bin/gulp build

css:
	@node_modules/.bin/gulp css_compile

templates:
	@node_modules/.bin/gulp templates_build

clean:
	@node_modules/.bin/gulp clean

serve:
	@node_modules/.bin/gulp
