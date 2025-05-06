// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

export default class barrier
{

__init()
{
	this.__promise = new Promise(res => (this.__signal = res))
}

constructor()
{
	this.__init()
}

wait()
{
	this.blocking = 1
	return this.__promise
}

signal()
{
	this.__signal()
	this.blocking = 0
	this.__init()
}

} /* class barrier */
