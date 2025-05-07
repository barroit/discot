// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { createAudioPlayer } from '@discordjs/voice'
import { InteractionContextType } from 'discord.js'

import barrier from '../lib/barrier.js'
import { dc_error } from '../lib/dismas.js'
import { cmd_meta, opt_string } from '../lib/meta.js'
import { CURRENT } from '../lib/muctx.js'
import mutex from '../lib/mutex.js'

import * as youtube from '../musrc/youtube.js'

export const meta = cmd_meta()
.setName('play')
.setDescription('play music from source')
.setContexts(InteractionContextType.Guild)
.addSubcommand(youtube.meta)

export async function exec(ctx)
{
	let current = CURRENT(ctx)

	const cmd = ctx.options.getSubcommand()
	const url = ctx.options.getString('url')

	if (!current) {
		ctx.guild.current = {}
		current = CURRENT(ctx)

		current.reply = {}

		current.playlist = {}
		current.playlist.fetch = {}

		current.player = createAudioPlayer()
		current.player.barrier = new barrier()
		current.player.mutex = new mutex()

		current.opts = {}
	}

	if (!ctx.member.voice.channel)
		return ctx.reply(dc_error('you need to be in voice channel'))

	switch (cmd) {
	case 'youtube':
		current.handler = youtube
	}

	await ctx.deferReply()
	return current.handler.exec(ctx, url, ctx.options)
}
