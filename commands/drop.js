// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	PermissionFlagsBits as PermissionFlags,
	InteractionContextType as InteractionContext,
	MessageFlags,
} from 'discord.js'

import cmeta, { opt_number } from '../lib/cmeta.js'
import { dc_error } from '../lib/dismas.js'
import { fetch_channel } from '../lib/disutil.js'
import { mas } from '../lib/termas.js'

/*
 * Fuck OOP. Fuck their obsession with chaining unreadable garbage and giving
 * everything a dumbass long name!
 */
const opt_max = opt_number().setName('max')
			    .setDescription('maximum messages to drop')
			    .setMinValue(1)
			    .setMaxValue(100)

const meta = cmeta().setName('drop')
		    .setDescription('drops many messages from channel')
		    .setDefaultMemberPermissions(PermissionFlags.Administrator)
		    .setContexts(InteractionContext.Guild)
		    .addNumberOption(opt_max)

export { meta }

export async function exec(ctx)
{
	const channel = await fetch_channel(ctx)
	const max = ctx.options.getNumber('max') ?? 100

	const reply = ctx.deferReply({ flags: MessageFlags.Ephemeral })

	try {
		await channel.bulkDelete(max, true)
	} catch (err) {
		return dc_error('Bulk delete messages failed', err)
	}

	reply.then(() => ctx.deleteReply())
}
