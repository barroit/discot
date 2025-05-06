// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { exit, pid, stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'

import {
	generateDependencyReport,
} from '@discordjs/voice'
import parse from 'shell-quote/parse.js'

import discot from '../discot.js'
import { mas, warn, error, die } from './termas.js'

import install from '../scripts/install.js'
import reload from '../scripts/reload.js'
import remove from '../scripts/remove.js'

let prompting = false
const prompt = `${pid}> `

const term = createInterface({
	input:  stdin,
	output: stdout,
	prompt: prompt,
})

export { prompt }

export function term_prompt()
{
	term.prompt()
	prompting = true
}

export function term_prompting()
{
	return prompting
}

term.on('line', line =>
{
	prompting = false
	line = line.trim()

	const argv = parse(line)
	const cmd = argv[0]
	const args = argv.slice(1)

	switch (cmd) {
	case 'force-exit':
		exit(0)

	case 'exit':
		discot.destroy()
		term.close()
		return

	case 'whoami':
		console.log(discot.user.tag)
		break

	case 'reload':
		term.close()
		reload()
		return

	case 'clear':
		console.clear()
		break

	case 'install':
		install(...args)
		break

	case 'remove':
		remove(...args)
		break

	case 'pkg-deps-voice':
		console.log(generateDependencyReport())
		break

	case undefined:
		break

	default:
		error(`unknown command \`${cmd}'`)
	}

	term_prompt()
})
