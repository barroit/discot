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
import { dc_error } from '../lib/dismas.js'
import { fetch_channel } from '../lib/disutil.js'
import cmd_meta, { opt_number } from '../lib/meta.js'

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

export async function exec(ctx)
{
	const channel = await fetch_channel(ctx)
	const max = ctx.options.getNumber('max') ?? 100

	const prompt = 'Use this only if you know what you are doing.'
	const abort = await confirm(ctx, prompt)

	if (abort)
		return

	try {
		await channel.bulkDelete(max, true)
	} catch (err) {
		return dc_error('Bulk delete messages failed', err)
	}
}
