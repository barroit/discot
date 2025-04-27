// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { readFileSync } from 'node:fs'

export default function cat(name)
{
	let str = readFileSync(name, 'utf-8')

	if (str.endsWith('\n'))
		str = str.slice(0, -1)

	return str
}
