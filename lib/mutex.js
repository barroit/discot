// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export default class mutex
{

constructor()
{
	this.__queue = []
	this.__locked = false
}

lock()
{
	return new Promise(res =>
	{
		if (this.__locked) {
			this.__queue.push(res)

		} else {
			this.__locked = true
			res()
		}
	})
}

unlock()
{
	if (this.__queue.length == 0) {
		this.__locked = false

	} else {
		const res = this.__queue.shift()

		res()
	}
}

} /* class barrier */
