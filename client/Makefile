TPL = tpl
TPL_EXT = .jade
TPL_OUT = .html

STYLE = styles
STYLE_EXT = .less
STYLE_OUT = .css

OUT = out

all: templates styles
	cp -r css $(OUT)
	cp -r js $(OUT)
	cp -r fonts $(OUT)
	cp main.js $(OUT)/js/main.js

templates: $(patsubst $(TPL)/%$(TPL_EXT),$(OUT)/%$(TPL_OUT),$(wildcard $(TPL)/*$(TPL_EXT)))

$(OUT)/%$(TPL_OUT): $(TPL)/%$(TPL_EXT)
	jade $^ -o $(OUT)

styles: $(patsubst $(STYLE)/%$(STYLE_EXT),$(OUT)/css/%$(STYLE_OUT),$(wildcard $(STYLE)/*$(STYLE_EXT)))

$(OUT)/css/%$(STYLE_OUT): $(STYLE)/%$(STYLE_EXT)
	lessc $^ $@

.PHONY: clean touch
clean:
	rm -r $(OUT)/*
