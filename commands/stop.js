// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	InteractionContextType,
} from 'discord.js'

import { cmd_meta } from '../lib/meta.js'
import { CURRENT } from '../lib/muctx.js'

export const meta = cmd_meta()
.setName('stop')
.setDescription('stop playback')
.setContexts(InteractionContextType.Guild)

export async function exec(ctx)
{
	const current = CURRENT(ctx)

	ctx.deferReply().then(() => ctx.deleteReply())

	if (!current || !current.handler || !current.handler.stop)
		return

	return current.handler.stop(ctx)
}
