// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import { exec } from 'node:child_process'

const features = {}

exec('yt-dlp --version', err => features['yt-dlp'] = !err)
exec('ffmpeg -version', err => features['ffmpeg'] = !err)

export default features
