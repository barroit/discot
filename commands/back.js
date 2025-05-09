// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	InteractionContextType,
} from 'discord.js'

import { cmd_meta, opt_number } from '../lib/meta.js'
import { CURRENT, OPTION } from '../lib/muctx.js'

const opt_count = opt_number()
.setName('count')
.setDescription('maximum number of tracks to go back')
.setMinValue(1)

export const meta = cmd_meta()
.setName('back')
.setDescription('go back in playlist')
.setContexts(InteractionContextType.Guild)
.addNumberOption(opt_count)

export async function exec(ctx)
{
	const current = CURRENT(ctx)

	ctx.deferReply().then(() => ctx.deleteReply())

	if (!current || !current.handler || !current.handler.skip)
		return

	const option = OPTION(ctx)

	option.back_count = ctx.options.getNumber('count') ?? 1

	return current.handler.back(ctx)
}
