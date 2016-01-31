TPL = tpl/
TPL_EXT = .jade
TPL_OUT = .html

STYLE = styles/
STYLE_EXT = .less
STYLE_OUT = .css

OUT = out/

all: templates styles

templates: $(patsubst $(TPL)%$(TPL_EXT),$(OUT)%$(TPL_OUT),$(wildcard $(TPL)*$(TPL_EXT)))

$(OUT)%$(TPL_OUT): $(TPL)%$(TPL_EXT)
	jade $^ -o $(OUT)

styles: $(patsubst $(STYLE)%$(STYLE_EXT),$(OUT)%$(STYLE_OUT),$(wildcard $(STYLE)*$(STYLE_EXT)))

$(OUT)%$(STYLE_OUT): $(STYLE)%$(STYLE_EXT)
	lessc $^ $@

.PHONY: clean touch
clean:
	rm $(OUT)home.html $(OUT)main.css

touch:
	touch $(TPL)/*
	touch $(STYLE)/*
