// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export default class barrier
{

constructor()
{
	this.__wakes = []
}

wait()
{
	return new Promise(wake => this.__wakes.push(wake))
}

signal()
{
	const wake = this.__wakes.shift()

	if (wake)
		wake()
}

broadcast()
{
	let wake

	while (wake = this.__wakes.shift())
		wake()
}

} /* class barrier */
