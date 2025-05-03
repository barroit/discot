// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { existsSync } from 'node:fs'
import { env } from 'node:process'

import { Routes } from 'discord.js'

import discot, { http_sync, cmds } from '../discot.js'
import cat from '../lib/cat.js'
import { error, die } from '../lib/termas.js'

const sandbox_id_path = `${env.PWD}/SANDBOX`
let sandbox_id

if (existsSync(sandbox_id_path))
	sandbox_id = cat(sandbox_id_path)

export default function install(name)
{
	if (!name)
		return error('missing file name')

	let files = Array.from(cmds.values())

	if (name.pattern != '*') {
		files = files.filter(({ file }) => file.startsWith(name))

		switch (files.length) {
		case 1:
			break
		case 0:
			return error(`pattern \`${name}' matches nothing`)
		default:
			const ln = files.map(([ str ]) => `\n  ${str}`)
					.join('')

			return error(`ambiguous name \`${name}', could be${ln}`)
		}
	}

	const global = []
	const sandbox = []

	files.forEach(({ meta, sandbox_only }) =>
	{
		const json = meta.toJSON()

		if (!sandbox_only)
			global.push(json)
		else
			sandbox.push(json)
	})

	let url
	let ret = {}
	const uid = discot.user.id

	if (global.length) {
		url = Routes.applicationCommands(uid)
		ret = http_sync.put(url, { body: global })
	}

	if (ret.err)
		return error(`${ret.res.name}: ${ret.res.rawError.message}`)

	if (sandbox.length) {
		if (!sandbox_id)
			die(`missing sandbox id file '${sandbox_id_path}'`)

		url = Routes.applicationGuildCommands(uid, sandbox_id)
		ret = http_sync.put(url, { body: sandbox })
	}

	if (ret.err)
		return error(`${ret.res.name}: ${ret.res.rawError.message}`)
}
