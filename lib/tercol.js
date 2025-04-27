// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

const ESC = '\x1b'

const BOLD	= `${ESC}[1m`
const RED	= `${ESC}[31m`
const YELLOW	= `${ESC}[33m`
const GREEN	= `${ESC}[32m`
const CYAN	= `${ESC}[36m`
const WHITE	= `${ESC}[37m`
const RESET	= `${ESC}[0m`

export {
	BOLD,
	RED,
	YELLOW,
	GREEN,
	CYAN,
	WHITE,
	RESET,
}
