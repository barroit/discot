// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { uptime } from 'node:os'
import { exit, stdout } from 'node:process'

import { term_prompt, term_prompting, prompt } from './term.js'
import { BOLD, RED, YELLOW, GREEN, CYAN, WHITE, RESET } from './tercol.js'

function termas(str)
{
	const prompting = term_prompting()

	if (prompting)
		stdout.write(`\r${' '.repeat(prompt.length)}\r`)

	console.log(str)

	if (prompting)
		term_prompt()
}

export function mas(str)
{
	termas(`${GREEN}[${uptime}]${RESET} ${str}`)
}

export function note(str)
{
	termas(`${CYAN}note:${RESET} ${str}`)
}

export function warn(str)
{
	termas(`${YELLOW}warn:${RESET} ${str}`)
	return -1
}

export function error(str)
{
	termas(`${RED}error:${RESET} ${str}`)
	return -1
}

export function die(str)
{
	termas(`${RED}die:${RESET} ${str}`)
	exit(128)
}
