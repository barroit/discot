// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	Routes,
} from 'discord.js'

import discot, { http } from '../discot.js'
import deasync from '../lib/deasync.js'
import { warn, error } from '../lib/termas.js'

function drop_guild_cmd({ id, guildId })
{
	const url = Routes.applicationGuildCommand(discot.user.id, guildId, id)

	return http.delete(url)
}

function drop_global_cmd({ id })
{
	const url = Routes.applicationCommand(discot.user.id, id)

	return http.delete(url)
}

async function drop_cmd_all(guild_tasks, global_cmds)
{
	const res = await Promise.allSettled(guild_tasks)
	const drop_tasks_guild = res.flatMap(r => r.value.map(drop_guild_cmd))

	const drop_tasks_global = global_cmds.map(drop_global_cmd)

	return await Promise.allSettled([
		...drop_tasks_guild,
		...drop_tasks_global,
	])
}

async function drop_cmd_spec(guild_tasks, global_cmds, name)
{
	const pred = c => c.name == name
	let drop_task = global_cmds.filter(pred).map(drop_global_cmd)

	if (drop_task.length)
		return await Promise.allSettled(drop_task)

	const res = await Promise.allSettled(guild_tasks)

	drop_task = res.flatMap(r => r.value.filter(pred).map(drop_guild_cmd))
	if (drop_task.length)
		return await Promise.allSettled(drop_task)

	return error(`unknown command name \`${name}'`)
}

async function drop_cmd(name)
{
	if (!name)
		return error('missing command name')

	const guilds = discot.guilds.cache

	const guild_tasks = guilds.map(g => g.commands.fetch())
	const global_cmd = await discot.application.commands.fetch()

	if (name.pattern == '*')
		return drop_cmd_all(guild_tasks, global_cmd)
	else
		return drop_cmd_spec(guild_tasks, global_cmd, name)
}

export default function remove(name)
{
	const do_drop_cmd = deasync(drop_cmd)
	const data = do_drop_cmd(name)

	if (data.res == null || typeof data.res[Symbol.iterator] != 'function')
		return

	for (const res of data.res) {
		if (res.status != 'rejected')
			continue

		warn(res.reason)
	}
}
