# SPDX-License-Identifier: GPL-3.0-or-later

.PHONY: start addon/build addon/clean

start:
	@npm --silent start || true

addon/build:
	@npm --silent run addon-build

addon/clean:
	@npm --silent run addon-clean
