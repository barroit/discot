// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	InteractionContextType,
} from 'discord.js'

import { cmd_meta, opt_switch, cmd_sub } from '../lib/meta.js'
import { CURRENT, OPTION } from '../lib/muctx.js'

export const opt_song = opt_switch()
.setName('song')
.setDescription('loop current song instead of playlist')

export const meta_on = cmd_sub()
.setName('on')
.setDescription('enable loop')
.addBooleanOption(opt_song)

export const meta_off = cmd_sub()
.setName('off')
.setDescription('disable loop')

export const meta = cmd_meta()
.setName('loop')
.setDescription('loop song or playlist')
.setContexts(InteractionContextType.Guild)
.addSubcommand(meta_on)
.addSubcommand(meta_off)

export async function exec(ctx)
{
	const current = CURRENT(ctx)

	ctx.deferReply().then(() => ctx.deleteReply())

	if (!current || !current.handler || !current.handler.loop)
		return

	const option = OPTION(ctx)
	const st = ctx.options.getSubcommand()

	option.loop_song = ctx.options.getBoolean('song') ?? 0

	return current.handler.loop(ctx, st == 'on')
}
