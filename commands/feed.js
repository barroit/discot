// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	PermissionFlagsBits,
	InteractionContextType,
	MessageFlags,
} from 'discord.js'
import { LoremIpsum } from "lorem-ipsum"

import confirm from '../lib/confirm.js'
import { dc_error } from '../lib/dismas.js'
import { reply_user } from '../lib/disutil.js'
import { cmd_meta, opt_number } from '../lib/meta.js'
import sleep from '../lib/sleep.js'

const WORD      = 0
const SENTENCE  = 1
const PARAGRAPH = 2

const opt_max = opt_number()
.setName('max')
.setDescription('maximum number of messages to feed')
.setMinValue(1)
.setMaxValue(100)

const opt_type = opt_number()
.setName('type')
.setDescription('type of generated text')
.addChoices(
	{ name: 'word', value: WORD },
	{ name: 'sentence', value: SENTENCE },
	{ name: 'paragraph', value: PARAGRAPH },
)

export const meta = cmd_meta()
.setName('feed')
.setDescription('feeds messages to channel')
.setContexts(InteractionContextType.Guild)
.addNumberOption(opt_max)
.addNumberOption(opt_type)

export const sandbox_only = 1

const lorem = new LoremIpsum({
	sentencesPerParagraph: { max: 8, min: 4 },
	wordsPerSentence:      { max: 16, min: 4 },
})

export async function exec(ctx)
{
	const max = ctx.options.getNumber('max') ?? 10
	const type = ctx.options.getNumber('type') ?? 1

	await ctx.deferReply()

	for (let i = 0; i < max; i++) {
		let str

		switch (type) {
		case WORD:
			str = lorem.generateWords(1)
			break
		case SENTENCE:
			str = lorem.generateSentences(2)
			break
		case PARAGRAPH:
			str = lorem.generateParagraphs(1)
		}

		try {
			await ctx.channel.send(str)
		} catch (_) {
			reply_user(ctx, `Failed to send '${str}' to channel`)
		}

		await sleep(300)
	}

	ctx.deleteReply()
}
