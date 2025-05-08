/* SPDX-License-Identifier: GPL-3.0-or-later */
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

#ifndef COMPILER_H
#define COMPILER_H

#include <assert.h>

#define BUG_ON(x) assert(!(x))

#define __STRINGIFY(x) #x
#define STRINGIFY(x)   __STRINGIFY(x)

#endif /* COMPILER_H */
