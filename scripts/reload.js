// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { spawn } from 'node:child_process'
import { argv, execPath as executable, exit } from 'node:process'

import discot from '../discot.js'

export default function reload()
{
	const child = spawn(executable, argv.slice(1), {
		env: process.env,
		stdio: 'inherit',
	})

	discot.destroy()
	child.on('exit', exit)
}
