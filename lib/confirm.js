// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} from 'discord.js'

import { dc_note, dc_warn } from './dismas.js'
import { reply_user } from './disutil.js'

function btn_create()
{
	return new ButtonBuilder()
}

function row_create()
{
	return new ActionRowBuilder()
}

/*
 * Eats first reply.
 */
export default async function confirm(ctx, prompt)
{
	const confirm = btn_create().setCustomId('continue')
				    .setLabel('Continue')
				    .setStyle(ButtonStyle.Danger)
	const cancel = btn_create().setCustomId('abort')
				   .setLabel('Abort')
				   .setStyle(ButtonStyle.Secondary)

	const row = row_create().addComponents(confirm, cancel)
	const reply = await ctx.reply({
		...dc_note(prompt),

		components:   [ row ],
		withResponse: true,
	})

	let choice

	try {
		choice = await reply.resource.message.awaitMessageComponent({
			filter: i => i.user.id === ctx.user.id,
		})
	} catch (_) {
		confirm.setDisabled(true)
		cancel.setDisabled(true)

		ctx.editReply({
			...dc_warn('Confirmation timeout'),

			components: [ row ],
		})
		return -1
	}

	await ctx.deleteReply()
	if (choice.customId == 'continue')
		return 0
	else
		return 1
}

