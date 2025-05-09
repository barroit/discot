// SPDX-License-Identifier: GPL-3.0-or-later
/*
 * Copyright 2025 Jiamu Sun <barroit@linux.com>
 */

import {
	createReadStream,
	readdirSync,
	renameSync,
} from 'node:fs'

import {
	AudioPlayerStatus as PlayerState,
	createAudioResource,
	demuxProbe,
	entersState,
	joinVoiceChannel,
	/*
	 * Again, fuck the dipshit who write these crappy long names.
	 */
	VoiceConnectionStatus as ConnState,
} from '@discordjs/voice'
import strwidth from 'string-width';

import { exec as __exec } from 'node:child_process'
import { promisify } from 'node:util'

import discot, { tmp_dir } from '../discot.js'
import { dc_note, dc_warn, dc_error } from '../lib/dismas.js'
import features from '../lib/feature.js'
import { cmd_sub, opt_number, opt_string } from '../lib/meta.js'
import {
	CURRENT,
	FETCHLIST,
	OPTION,
	PLAYER,
	PLAYLIST,
	REPLY,
} from '../lib/muctx.js'
import { arr_shuffle, arr_move } from '../lib/array.js'

const exec = promisify(__exec)

const DEFAULT_FETCH_RANGE = 100
const DEFAULT_DISPLAY_RANGE = 5

const URL_UNKNOWN  = -1
const URL_PLAYLIST = 0
const URL_WATCH    = 1

const opt_url = opt_string()
.setName('url')
.setDescription('watch or playlist to play')
.setRequired(true)

const opt_range = opt_number()
.setName('range')
.setDescription('maximum range to fetch')
.setMinValue(1)

const opt_display = opt_number()
.setName('display')
.setDescription('maximum playlist items to display')
.setMinValue(1)

export const meta = cmd_sub()
.setName('youtube')
.setDescription('play music from YouTube and YouTube Music')
.addStringOption(opt_url)
.addNumberOption(opt_range)
.addNumberOption(opt_display)

function url_type(str)
{
	let url

	try {
		url = new URL(str)
	} catch (_) {
		return URL_UNKNOWN
	}

	if (url.hostname == 'youtu.be' ||
	    url.pathname == '/watch' && url.searchParams.get('v'))
		return URL_WATCH
	else if (url.pathname == '/playlist' && url.searchParams.get('list'))
		return URL_PLAYLIST
	else
		return URL_UNKNOWN
}

function watch_id(str)
{
	const url = new URL(str)

	if (url.hostname == 'youtu.be')
		return url.pathname.slice(1)
	else
		return url.searchParams.get('v')
}

function fmt_title(title, duration)
{
	const min = ~~(duration / 60)
	const sec = duration % 60
	let length = `[${min}m${sec}s]`

	if (duration < 60)
		length = `[${sec}s]`

	return `${title} ${length}`
}

function format_title_link(title, duration, url)
{
	title = fmt_title(title, duration)
	return `[${title}](${url})`
}

async function flex_reply(ctx, data)
{
	const reply = REPLY(ctx)
	let ret

	if (reply.count)
		ret = reply.message.edit(data)
	else
		ret = ctx.followUp(data).then(msg => reply.message = msg)

	ret = ret.catch(err =>
	{
		if (err.rawError.code != 10008)
			return

		/*
		 * Some dumbass deleted our message.
		 */
		ctx.channel.send(data).then(msg => reply.message = msg)
	})

	reply.count++
	return ret
}

function join_channel(ctx)
{
	const channel = ctx.member.voice.channel
	const current = CURRENT(ctx)

	if (current.conn && current.conn.state.status != ConnState.Destroyed)
		current.conn.disconnect()

	current.id = channel.id

	current.conn = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	})

	current.conn.subscribe(current.player)

	current.conn.on(ConnState.Disconnected, async () =>
	{
		const signalling = entersState(current.conn,
					       ConnState.Signalling, 5_000)
		const connecting = entersState(current.conn,
					       ConnState.Connecting, 5_000)

		await Promise.race([ signalling, connecting ]).catch(() =>
		{
			if (current.conn.state.status == ConnState.Destroyed)
				return

			current.conn.destroy()
			current.id = undefined
		})
	})
}

async function fetch_audio_slow(url)
{
	const cmd = `yt-dlp --format bestaudio \
			    --output '${tmp_dir}/%(id)s' \
			    --print after_move:'%(id)s\t%(duration)s\t%(title)s' \
			    --print after_move:filename \
			    '${url}'`
	const { stdout, stderr } = await exec(cmd).catch(err => err)

	if (stderr) {
		const seg = stderr.trim().split(': ')

		return { stderr: seg[seg.length - 1] }
	}

	const [ __name, src ] = stdout.trim().split('\n')
	const name = __name.replaceAll('/', '∕')
	const dst = `${tmp_dir}/${name}`

	renameSync(src, dst)
	return { stdout: name }
}

async function fetch_audio(url, id)
{
	const files = readdirSync(tmp_dir)
	const cache = files.filter(name => name.startsWith(`${id}\t`))
	let name = cache[0]

	if (!name) {
		const { stdout, stderr } = await fetch_audio_slow(url)

		if (stderr)
			return stderr
		name = stdout
	}

	const seg = name.split('\t', 3)

	return {
		id:       seg[0],
		duration: seg[1],
		title:    seg[2],
		path:     `${tmp_dir}/${name}`,
	}
}

async function fetch_playlist(ctx, url, head, range)
{
	const fetchlist = FETCHLIST(ctx)

	const start = head + 1
	const end = start + range - 1

	const cmd = `yt-dlp --quiet \
			    --no-warnings \
			    --flat-playlist \
			    --playlist-start ${start} \
			    --playlist-end ${end} \
			    --dump-single-json \
			    '${url}'`
	const { stdout, stderr } = await exec(cmd).catch(err => err)

	if (stderr) {
		const seg = stderr.trim().split(': ')

		return seg[seg.length - 1]
	}

	const str = stdout.trim()
	const meta = JSON.parse(str)
	const queue = meta.entries.map(({ id, title, url, duration }) => ({
		id,
		title,
		url,
		duration,
	}))

	fetchlist.title = meta.title
	fetchlist.queue = queue
	fetchlist.head = end

	if (!queue.length)
		fetchlist.head = -1
}

async function play_audio(ctx, file, duration)
{
	const player = PLAYER(ctx)

	const __stream = createReadStream(file)
	const { stream, type } = await demuxProbe(__stream)
	const src = createAudioResource(stream, { inputType: type })

	src.duration = duration
	player.src = src
	player.play(src)
}

async function update_playlist(ctx)
{
	const fetchlist = FETCHLIST(ctx)
	const option = OPTION(ctx)
	const reply = REPLY(ctx)

	const err = await fetch_playlist(ctx, fetchlist.url,
					 fetchlist.head, option.range)

	if (!err)
		return

	const start = fetchlist.head + 1
	const end = start + option.range - 1
	const msg = `failed to update playlist '${url}' from ${start} to ${end}; ${err}\n\nstopping fetch of remaining songs`

	reply.message.reply(data, dc_warn(msg))
	fetchlist.head = -1
}

function show_watch(ctx)
{
	const playlist = PLAYLIST(ctx)

	const song = playlist.queue[0]
	const title = format_title_link(song.title, song.duration, song.url)

	flex_reply(ctx, dc_note(`### Playing: ${title}`))
}

function show_playlist(ctx)
{
	const fetchlist = FETCHLIST(ctx)
	const option = OPTION(ctx)
	const playlist = PLAYLIST(ctx)

	const scale = ~~((playlist.next - 1) / option.display)
	const start = scale * option.display
	let end = start + option.display
	const offset = playlist.head + start

	if (end > playlist.length)
		end = playlist.length

	let lines = playlist.queue.slice(start, end).map((song, idx) =>
	{
		const playing = idx == playlist.next - start - 1
		let title_full = song.title

		if (!playing && strwidth(title_full) > 30) {
			title_full = title_full.slice(0, 16)
			title_full += '...'
		}

		const title = format_title_link(title_full,
						song.duration, song.url)
		const prefix = offset + idx + 1

		if (playing)
			return `> **${prefix} - ${title}**`
		else
			return `**\u200b \u200b \u200b ${prefix} - ${title}**`
	}).join('\n\n')

	lines = `## Playlist [${fetchlist.title}](${fetchlist.url})\n​ \n${lines}`
	flex_reply(ctx, dc_note(lines))
}

function shuffle_all(ctx)
{
	const playlist = PLAYLIST(ctx)

	arr_shuffle(playlist.queue, 0, playlist.queue.length)
	playlist.next = 0
}

function shuffle_partial(ctx)
{
	const playlist = PLAYLIST(ctx)
	const player = PLAYER(ctx)

	const ts = ~~(player.src.playbackDuration / 3 * 2 / 1000)
	let off = playlist.next - 1

	if (ts > player.src.duration)
		off += 1

	const len = playlist.queue.length - off

	arr_shuffle(playlist.queue, off, len)
	if (off)
		arr_move(playlist.queue, off, 0, len)

	playlist.next = 0
	playlist.queue.length -= off
}

async function work_once(ctx, ref)
{
	const fetchlist = FETCHLIST(ctx)
	const option = OPTION(ctx)
	const player = PLAYER(ctx)
	const playlist = PLAYLIST(ctx)

	await player.mutex.lock()

	if (playlist.next == playlist.queue.length) {
		if (fetchlist.head == -1) {
			player.mutex.unlock()
			await player.barrier.wait()

			if (player.worker != ref)
				return

			await player.mutex.lock()
		}

		playlist.queue = fetchlist.queue
		playlist.head = fetchlist.head - option.range
		playlist.next = 0
	}

	if (player.shuffle) {
		if (option.shuffle_all)
			shuffle_all(ctx)
		else
			shuffle_partial(ctx)
		player.shuffle = 0
	}

	if (fetchlist.head != -1 &&
	    playlist.queue == fetchlist.queue &&
	    playlist.next >= ~~(playlist.queue.length / 3) * 2)
		update_playlist(ctx)

	const { url, id } = playlist.queue[playlist.next]
	const { duration, title, path } = await fetch_audio(url, id)

	playlist.next++

	player.task = setTimeout(() => fetch_audio(url, id),
				 (duration / 8 * 7) * 1000)
	play_audio(ctx, path, duration)

	if (fetchlist.title)
		show_playlist(ctx)
	else
		show_watch(ctx)

	player.mutex.unlock()
}

async function start_watch(ctx)
{
	const fetchlist = FETCHLIST(ctx)
	const player = PLAYER(ctx)

	const url = fetchlist.url
	const id = watch_id(url)
	const ret = await fetch_audio(url, id)

	if (typeof ret === 'string')
		return ctx.followUp(dc_error(`failed to fetch '${url}'; ${ret}`))

	const { title, duration } = ret

	fetchlist.queue = [{
		id,
		url,
		title,
		duration,
	}]

	join_channel(ctx)
	player.barrier.signal()
}

async function start_playlist(ctx)
{
	const fetchlist = FETCHLIST(ctx)
	const option = OPTION(ctx)
	const player = PLAYER(ctx)

	const err = await fetch_playlist(ctx, fetchlist.url, 0, option.range)

	if (err) {
		const start = 0
		const end = option.range
		const msg = `failed to fetch playlist '${url}' from ${start} to ${end}; ${err}`

		return ctx.followUp(dc_error(msg))
	}

	join_channel(ctx)
	player.barrier.signal()
}

export async function youtube(ctx, url)
{
	const option = OPTION(ctx)
	const player = PLAYER(ctx)
	const playlist = PLAYLIST(ctx)
	const reply = REPLY(ctx)

	if (!features['yt-dlp'] ||
	    !features['ffmpeg'] ||
	    !features['tmp-dir'])
		return ctx.followUp(dc_error("source 'youtube' is unavailable"))

	const type = url_type(url)
	const opts = ctx.options

	const range = opts.getNumber('range') ?? DEFAULT_FETCH_RANGE
	const display = opts.getNumber('display') ?? DEFAULT_DISPLAY_RANGE

	if (type == URL_UNKNOWN)
		return ctx.followUp(dc_error(`unknown URL '${url}'`))

	await player.mutex.lock()

	option.range = range
	option.display = display

	reply.count = 0

	playlist.queue = []
	playlist.next = 0

	playlist.fetch.title = undefined
	playlist.fetch.url = url
	playlist.fetch.head = -1

	clearTimeout(player.task)
	player.removeAllListeners(PlayerState.Idle)
	player.shuffle = 0

	player.worker = () => work_once(ctx, player.worker)
	player.on(PlayerState.Idle, player.worker)

	player.mutex.unlock()

	if (player.state.status != PlayerState.Idle)
		player.stop(true)

	player.barrier.broadcast()
	work_once(ctx, player.worker)

	switch (type) {
	case URL_WATCH:
		return start_watch(ctx)
	case URL_PLAYLIST:
		return start_playlist(ctx)
	}
}
export { youtube as exec }

export async function shuffle(ctx)
{
	const fetchlist = FETCHLIST(ctx)
	const option = OPTION(ctx)
	const player = PLAYER(ctx)
	const playlist = PLAYLIST(ctx)

	if (!fetchlist.title)
		return

	await player.mutex.lock()

	if (playlist.next != playlist.queue.length || option.shuffle_all)
		player.shuffle = 1

	player.mutex.unlock()

	if (player.shuffle && player.state.status != PlayerState.Idle)
		player.stop(true)
}
