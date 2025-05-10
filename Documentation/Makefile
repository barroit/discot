# SPDX-License-Identifier: GPL-3.0-or-later

SPHINXOPTS	?=
SPHINXBUILD	= sphinx-build
SPHINXAUTOBUILD	= sphinx-autobuild
SOURCEDIR	= .
BUILDDIR	= build

.PHONY: help live-html

live-html:
	@$(SPHINXAUTOBUILD) $(SOURCEDIR) $(BUILDDIR)/html

help:
	@$(SPHINXBUILD) -M help $(SOURCEDIR) $(BUILDDIR) $(SPHINXOPTS)

%:
	@$(SPHINXBUILD) -M $@ $(SOURCEDIR) $(BUILDDIR) $(SPHINXOPTS)
