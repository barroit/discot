// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	MessageFlags,
} from 'discord.js'

const RED	= 0xcc0000
const YELLOW	= 0xcccc00
const CYAN	= 0x00cccc

function termas(color, str, err)
{
	if (err)
		str += `. ${err.rawError.message}`

	return {
		embeds: [{
			color,
			description: str,
		}],
		flags: MessageFlags.Ephemeral,
	}
}

export function dc_note(str)
{
	return termas(CYAN, str)
}

export function dc_warn(str, err)
{
	return termas(YELLOW, str, err)
}

export function dc_error(str, err)
{
	return termas(RED, str, err)
}
