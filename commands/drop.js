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
import { cmd_meta, opt_number } from '../lib/meta.js'
import sleep from '../lib/sleep.js'
import { mas } from '../lib/termas.js'

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

	for (const msg of msg_arr) {
		await msg.delete().catch(() => {})
		await sleep(300)
	}
}

export async function exec(ctx)
{
	const max = ctx.options.getNumber('max') ?? 100

	const prompt = 'Use this only if you know what you are doing.'
	const abort = await confirm(ctx, prompt)
	let dropped

	if (abort)
		return

	mas(`${ctx.user.username} (${ctx.user.id}) emits drop(max: ${max})`)

	try {
		dropped = await ctx.channel.bulkDelete(max, true)
	} catch (err) {
		return ctx.reply(dc_error('Bulk delete messages failed', err))
	}

	const remain = max - dropped.size

	if (remain)
		return drop_old(ctx.channel, remain)
}
