TPL = tpl
TPL_EXT = .jade
TPL_OUT = .html

STYLE = styles
STYLE_EXT = .less
STYLE_OUT = .css

JS = js
JS_EXT = .js
JS_OUT = .js

OUT = out

all: templates styles js
	cp -r css $(OUT)
	cp -r fonts $(OUT)
	cp money.svg $(OUT)/money.svg
	cp logo.png $(OUT)/favicon.png

templates: $(OUT)/index$(TPL_OUT)
#$(patsubst $(TPL)/%$(TPL_EXT),$(OUT)/%$(TPL_OUT),$(wildcard $(TPL)/*$(TPL_EXT)))

$(OUT)/%$(TPL_OUT): $(TPL)/%$(TPL_EXT)
	jade $^ -o $(OUT)

styles: $(patsubst $(STYLE)/%$(STYLE_EXT),$(OUT)/css/%$(STYLE_OUT),$(wildcard $(STYLE)/*$(STYLE_EXT)))

$(OUT)/css/%$(STYLE_OUT): $(STYLE)/%$(STYLE_EXT)
	lessc $^ $@

js: $(patsubst $(JS)/%$(JS_EXT),$(OUT)/js/%$(JS_OUT),$(wildcard $(JS)/*$(JS_EXT)))

$(OUT)/$(JS)/%$(JS_OUT): $(JS)/%$(JS_EXT)
	cp $^ $@

.PHONY: clean
clean:
	rm -r $(OUT)
	mkdir $(OUT)
	mkdir $(OUT)/$(JS)
