// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { createInterface } from 'node:readline'
import { env, exit, pid, stdin, stdout } from 'node:process'

import {
	Client,
	Events,
	GatewayIntentBits,
} from 'discord.js'

import cat from './lib/cat.js'
import { mas, error, die } from './lib/termas.js'
import reload from './scripts/reload.js'

const token_path = `${env.PWD}/TOKEN`
const token = cat(token_path)

const discot = new Client({ intents: 0 })
let user

export default discot
export { user }

try {
	await discot.login(token)
} catch (_) {
	die(`invalid token in ${token_path}`)
}

discot.once(Events.ClientReady, client =>
{
	user = client.user.username

	mas(`login as ${user}`)
	reader.prompt()
})

discot.once(Events.ShardDisconnect, client =>
{
	mas(`logout ${user}`)
})

const reader = createInterface({
	input: stdin,
	output: stdout,
	prompt: `${pid}> `,
})

reader.on('line', line =>
{
	const cmd = line.trim()

	switch (cmd) {
	case 'exit':
		exit(0)

	case 'whoami':
		console.log(discot.user.tag)
		break

	case 'reload':
		reload()
		reader.close()
		return

	case 'clear':
		console.clear()
		break

	default:
		mas(`unknown command: ${cmd}`)
	}

	reader.prompt()
})
