// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { uptime } from 'node:os'
import { exit } from 'node:process'

import { BOLD, RED, YELLOW, GREEN, CYAN, WHITE, RESET } from './tercol.js'

export function mas(str)
{
	console.log(`${GREEN}[${uptime}]${RESET} ${str}`)
}

export function note(str)
{
	console.log(`${CYAN}note:${RESET} ${str}`)
}

export function warn(str)
{
	console.log(`${YELLOW}warn:${RESET} ${str}`)
	return -1
}

export function error(str)
{
	console.log(`${RED}error:${RESET} ${str}`)
	return -1
}

export function die(str)
{
	console.log(`${RED}die:${RESET} ${str}`)
	exit(128)
}
