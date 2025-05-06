// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { existsSync, readdirSync, mkdir } from 'node:fs'
import { tmpdir } from 'node:os'
import { env } from 'node:process'

import {
	Client,
	Events,
	GatewayIntentBits,
	REST,
} from 'discord.js'

import cat from './lib/cat.js'
import deasync from './lib/deasync.js'
import { dc_warn } from './lib/dismas.js'
import features from './lib/feature.js'
import { term_prompt } from './lib/term.js'
import { mas, warn, die } from './lib/termas.js'

const token_path = `${env.PWD}/TOKEN`

if (!existsSync(token_path))
	die(`missing token file '${token_path}'`)

const token = cat(token_path)

const discot = new Client({
	intents: GatewayIntentBits.Guilds |
		 GatewayIntentBits.GuildVoiceStates,
})
let user

const http = new REST()
const http_sync = {
	get:    deasync(http.get.bind(http)),
	post:   deasync(http.post.bind(http)),
	put:    deasync(http.put.bind(http)),
	delete: deasync(http.delete.bind(http)),
}

http.setToken(token)

const cmds = new Map()

const tmp_root = tmpdir()
const tmp_dir = `${tmp_root}/barroit-discot`

features['tmp-dir'] = 0
mkdir(tmp_dir, { recursive: true }, err =>
{
	if (!err)
		features['tmp-dir'] = 1
	else
		warn(`failed to madir '${tmp_dir}'`)
})

export default discot
export { http, http_sync, cmds, tmp_dir }

discot.once(Events.ClientReady, client =>
{
	const cmd_dir = `${env.PWD}/commands`
	const cmd_files = readdirSync(cmd_dir)

	cmd_files.forEach(async file =>
	{
		const src = `${cmd_dir}/${file}`
		const { exec, meta, sandbox_only } = await import(src)

		if (!exec || !meta)
			return

		cmds.set(meta.name, {
			exec,
			meta,
			file,
			path: src,
			sandbox_only,
		})
	})

	user = client.user.username

	mas(`login as ${user}`)
	term_prompt()
})

discot.once(Events.ShardDisconnect, client =>
{
	mas(`logout ${user}`)
})

discot.on(Events.InteractionCreate, ctx =>
{
	if (!ctx.isChatInputCommand())
		return

	const name = ctx.commandName
	const cmd = cmds.get(name)

	if (!cmd) {
		const str = `deprecated command '${name}'`
		const data = dc_warn(str)

		warn(str)
		return ctx.reply(data)
	}

	return cmd.exec(ctx)
})

try {
	await discot.login(token)
} catch (_) {
	die(`invalid token in ${token_path}`)
}
