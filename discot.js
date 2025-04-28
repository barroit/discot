// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { env, exit, pid, stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'

import {
	Client,
	Events,
	REST,
} from 'discord.js'

import parse from 'shell-quote/parse.js'

import cat from './lib/cat.js'
import { mas, error, die } from './lib/termas.js'
import deasync, { deasync_import } from './lib/deasync.js'

import reload from './scripts/reload.js'
import install from './scripts/install.js'

const token_path = `${env.PWD}/TOKEN`

if (!existsSync(token_path))
	die(`missing token file '${token_path}'`)

const token = cat(token_path)

const discot = new Client({ intents: 0 })
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

let __prompting = false
const prompt_str = `${pid}> `
const prompt_size = prompt_str.length
const reader = createInterface({
	input:  stdin,
	output: stdout,
	prompt: prompt_str,
})

function prompt()
{
	reader.prompt()
	__prompting = true
}

function prompting()
{
	return __prompting
}

export default discot
export { http, http_sync, cmds, prompt, prompting, prompt_size }

reader.on('line', line =>
{
	__prompting = false
	line = line.trim()

	const argv = parse(line)
	const cmd = argv[0]
	const args = argv.slice(1)

	switch (cmd) {
	case 'exit':
		exit(0)

	case 'whoami':
		console.log(discot.user.tag)
		break

	case 'reload':
		reader.close()
		reload()
		return

	case 'clear':
		console.clear()
		break

	case 'install':
		install(...args)
		break

	default:
		error(`unknown command \`${cmd}'`)
	}

	prompt()
})

discot.once(Events.ClientReady, client =>
{
	const cmd_dir = path.join(env.PWD, 'commands')
	const cmd_files = readdirSync(cmd_dir)

	/*
	 * Must import here. Importing earlier breaks deasync from looping
	 * Node.js event.
	 */
	cmd_files.forEach(file =>
	{
		const src = path.join(cmd_dir, file)
		const { res } = deasync_import(src)

		cmds.set(res.meta.name, {
			exec: res.default,
			meta: res.meta,
			file,
			path: src,
		})
	})

	user = client.user.username

	mas(`login as ${user}`)
	prompt()
})

discot.once(Events.ShardDisconnect, client =>
{
	mas(`logout ${user}`)
})

try {
	await discot.login(token)
} catch (_) {
	die(`invalid token in ${token_path}`)
}
