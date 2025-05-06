// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	InteractionContextType,
} from 'discord.js'

import { dc_error } from '../lib/dismas.js'
import { cmd_meta, opt_string } from '../lib/meta.js'

import { youtube, meta as meta_youtube } from '../musrc/youtube.js'

export const meta = cmd_meta()
.setName('play')
.setDescription('play music from source')
.setContexts(InteractionContextType.Guild)
.addSubcommand(meta_youtube)

export async function exec(ctx)
{
	const cmd = ctx.options.getSubcommand()
	const url = ctx.options.getString('url')
	let src

	if (!ctx.member.voice.channel)
		return ctx.reply(dc_error('not in voice channel'))

	switch (cmd) {
	case 'youtube':
		src = youtube
	}

	await ctx.deferReply()
	return src(ctx, url, ctx.options)
}
