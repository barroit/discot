// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandNumberOption,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from 'discord.js'

export function cmd_meta()
{
	return new SlashCommandBuilder()
}

export function cmd_sub()
{
	return new SlashCommandSubcommandBuilder()
}

export function opt_switch()
{
	return new SlashCommandBooleanOption()
}

export function opt_number()
{
	return new SlashCommandNumberOption()
}

export function opt_string()
{
	return new SlashCommandStringOption()
}
