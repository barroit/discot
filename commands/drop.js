// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	PermissionFlagsBits,
	InteractionContextType,
	MessageFlags,
} from 'discord.js'

import confirm from '../lib/confirm.js'
import { dc_error, dc_warn } from '../lib/dismas.js'
import { fetch_channel } from '../lib/disutil.js'
import { cmd_meta, opt_number } from '../lib/meta.js'
import sleep from '../lib/sleep.js'

/*
 * Fuck OOP. Fuck their obsession with chaining unreadable garbage and giving
 * everything a dumbass long name!
 */
const opt_max = opt_number()
.setName('max')
.setDescription('maximum messages to drop')
.setMinValue(1)
.setMaxValue(100)

export const meta = cmd_meta()
.setName('drop')
.setDescription('drops many messages from channel')
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.setContexts(InteractionContextType.Guild)
.addNumberOption(opt_max)

async function drop_old(channel, max)
{
	const msg_map = await channel.messages.fetch({ limit: max })
	const msg_arr = msg_map.values()
	const tasks = []

	for (const msg of msg_arr) {
		const task = msg.delete()

		tasks.push(task)
		await sleep(300)
	}

	const results = await Promise.allSettled(tasks)
	const err = results.filter(({ status }) => status == 'rejected')

	if (err.length)
		return dc_warn('Delete old message messages failed')
}

export async function exec(ctx)
{
	const channel = await fetch_channel(ctx)
	const max = ctx.options.getNumber('max') ?? 100

	const prompt = 'Use this only if you know what you are doing.'
	const abort = await confirm(ctx, prompt)

	if (abort)
		return

	let dropped

	try {
		dropped = await channel.bulkDelete(max, true)
	} catch (err) {
		return dc_error('Bulk delete messages failed', err)
	}

	const remain = max - dropped.size

	if (remain)
		return drop_old(channel, remain)
}
