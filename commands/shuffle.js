// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	InteractionContextType,
} from 'discord.js'

import { cmd_meta, opt_switch } from '../lib/meta.js'
import { CURRENT, OPTION } from '../lib/muctx.js'

export const opt_all = opt_switch()
.setName('all')
.setDescription('reset play position and shuffle playlist')

export const meta = cmd_meta()
.setName('shuffle')
.setDescription('shuffle current playlist')
.setContexts(InteractionContextType.Guild)
.addBooleanOption(opt_all)

export async function exec(ctx)
{
	const current = CURRENT(ctx)

	ctx.deferReply().then(() => ctx.deleteReply())

	if (!current || !current.handler || !current.handler.shuffle)
		return

	const option = OPTION(ctx)

	option.shuffle_all = ctx.options.getBoolean('all') ?? 0

	return current.handler.shuffle(ctx)
}
