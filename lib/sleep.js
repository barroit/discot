// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export default function sleep(ms)
{
	return new Promise(resolve => setTimeout(resolve, ms))
}
