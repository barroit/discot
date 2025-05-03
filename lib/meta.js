// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	SlashCommandBuilder,
	SlashCommandNumberOption,
} from 'discord.js'

export function cmd_meta()
{
	return new SlashCommandBuilder()
}

export function opt_number()
{
	return new SlashCommandNumberOption()
}
