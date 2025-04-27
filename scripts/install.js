// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { Routes } from 'discord.js'

import discot, { http_sync, cmds } from '../discot.js'
import { error } from '../lib/termas.js'

export default function install(str)
{
	if (!str)
		return error('missing file name')

	const data = []
	let files = Array.from(cmds)
			 .map(([ _, cmd ]) => [ cmd.file, cmd.meta ])

	if (str.pattern != '*') {
		files = files.filter(([ name ]) => name.startsWith(str))

		switch (files.length) {
		case 1:
			break
		case 0:
			return error(`pattern \`${str}' matches nothing`)
		default:
			const ln = files.map(([ name ]) => `\n  ${name}`)
					.join('')

			return error(`ambiguous name \`${str}', could be${ln}`)
		}
	}

	files.forEach(([ _, meta ]) => data.push(meta.toJSON()))

	const url = Routes.applicationCommands(discot.user.id)
	const { err, res } = http_sync.put(url, {
		body: data
	})

	if (err)
		error(`${res.name}: ${res.rawError.message}`)
}
