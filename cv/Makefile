# Makefile for Awesome CV

CV      = cv
LATEX   = xelatex
LATEXMK = latexmk
BUILDDIR = build

.PHONY: all clean

all: $(CV).pdf

$(CV).pdf: $(CV).tex awesome-cv.cls resume/*.tex
	$(LATEXMK) -xelatex -output-directory=$(BUILDDIR) $(CV).tex
	cp $(BUILDDIR)/$(CV).pdf .

clean:
	rm -rf $(BUILDDIR) *.aux *.log *.out *.fls *.fdb_latexmk
