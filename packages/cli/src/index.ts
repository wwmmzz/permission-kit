import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanProject, createDts, collectPermissions, type PermissionManifest } from './scanner'
import { runDoctor } from './doctor'

type CliCommand = 'scan' | 'validate' | 'generate' | 'doctor'

type CliOptions = {
  cwd: string
  include: string[]
  exclude: string[]
  attributes: string[]
  manifestOutput: string
  dtsOutput: string
  typeName: string
  permissions: string[]
}

const DEFAULT_CWD = process.cwd()

export async function main(argv = process.argv.slice(2)) {
  const { command, patterns, options } = parseArgs(argv)

  if (!command) {
    printHelp()
    return 0
  }

  if (command === 'doctor') {
    return runDoctorCommand(options.cwd)
  }

  const manifest = await scanProject({
    cwd: options.cwd,
    include: patterns.length > 0 ? patterns : options.include,
    exclude: options.exclude,
    attributes: options.attributes
  })

  if (command === 'scan') {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`)
    return 0
  }

  if (command === 'generate') {
    await writeJson(path.resolve(options.cwd, options.manifestOutput), manifest)
    await writeText(
      path.resolve(options.cwd, options.dtsOutput),
      createDts(collectPermissions(manifest), options.typeName)
    )
    process.stdout.write(
      [
        `[permission-kit] generated manifest: ${options.manifestOutput}`,
        `[permission-kit] generated dts: ${options.dtsOutput}`
      ].join('\n') + '\n'
    )
    return 0
  }

  if (command === 'validate') {
    const allowed = new Set(options.permissions)
    const unknown = manifest.permissions
      .map((item) => item.permission)
      .filter((permission) => !allowed.has(permission))

    if (unknown.length > 0) {
      process.stderr.write(
        [
          `[permission-kit] unknown permissions: ${unknown.join(', ')}`,
          'Use --permissions to pass the expected permission list.'
        ].join('\n') + '\n'
      )
      return 1
    }

    process.stdout.write('[permission-kit] validate ok\n')
    return 0
  }

  return 1
}

async function runDoctorCommand(cwd: string) {
  const report = await runDoctor(cwd)

  for (const issue of report.issues) {
    const prefix = issue.level.toUpperCase()
    const stream = issue.level === 'error' ? process.stderr : process.stdout
    stream.write(`[${prefix}] ${issue.message}\n`)
  }

  if (report.ok) {
    process.stdout.write('[permission-kit] doctor ok\n')
    return 0
  }

  process.stderr.write('[permission-kit] doctor found issues\n')
  return 1
}

function parseArgs(argv: string[]) {
  const command = isCommand(argv[0]) ? (argv.shift() as CliCommand) : undefined
  const options: CliOptions = {
    cwd: DEFAULT_CWD,
    include: [],
    exclude: [],
    attributes: ['permission'],
    manifestOutput: 'src/generated/permission-manifest.json',
    dtsOutput: 'src/generated/permission.d.ts',
    typeName: 'PermissionKey',
    permissions: []
  }
  const patterns: string[] = []

  for (let index = 0; index < argv.length; index++) {
    const token = argv[index]

    if (token === undefined) {
      continue
    }

    if (!token.startsWith('--')) {
      patterns.push(token)
      continue
    }

    const [key, inlineValue] = token.split('=', 2)
    const nextValue = argv[index + 1]
    const value = inlineValue ?? nextValue

    switch (key) {
      case '--cwd':
        if (!inlineValue) index++
        options.cwd = path.resolve(value ?? DEFAULT_CWD)
        break
      case '--include':
        if (!inlineValue) index++
        options.include = splitList(value ?? '')
        break
      case '--exclude':
        if (!inlineValue) index++
        options.exclude = splitList(value ?? '')
        break
      case '--attributes':
        if (!inlineValue) index++
        options.attributes = splitList(value ?? '')
        break
      case '--manifest':
        if (!inlineValue) index++
        options.manifestOutput = value ?? options.manifestOutput
        break
      case '--dts':
        if (!inlineValue) index++
        options.dtsOutput = value ?? options.dtsOutput
        break
      case '--type-name':
        if (!inlineValue) index++
        options.typeName = value ?? options.typeName
        break
      case '--permissions':
        if (!inlineValue) index++
        options.permissions = splitList(value ?? '')
        break
      default:
        break
    }
  }

  return { command, patterns, options }
}

function isCommand(value: string | undefined): value is CliCommand {
  return value === 'scan' || value === 'validate' || value === 'generate' || value === 'doctor'
}

function splitList(value: string) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function writeJson(file: string, data: PermissionManifest) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}

async function writeText(file: string, content: string) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, content, 'utf-8')
}

function printHelp() {
  const bin = path.basename(fileURLToPath(import.meta.url))
  process.stdout.write(
    [
      'permission-kit CLI',
      '',
      `Usage: ${bin} <command> [paths...] [options]`,
      '',
      'Commands:',
      '  scan       Scan permission usages and print manifest JSON',
      '  validate   Scan and fail on unknown permissions',
      '  generate   Scan and write manifest + dts files',
      '  doctor     Check workspace and runtime prerequisites',
      '',
      'Common options:',
      '  --cwd <path>            Project root',
      '  --include <globs>       Comma-separated include globs',
      '  --exclude <globs>       Comma-separated exclude globs',
      '  --attributes <names>    Comma-separated permission attribute names',
      '  --manifest <path>      Manifest output path for generate',
      '  --dts <path>          Dts output path for generate',
      '  --type-name <name>    Type name for generated dts',
      '  --permissions <list>  Comma-separated allowed permissions for validate'
    ].join('\n') + '\n'
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().then((code) => {
    process.exitCode = code
  })
}
