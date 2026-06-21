import fs from 'node:fs/promises'
import path from 'node:path'

export type DoctorIssue = {
  level: 'info' | 'warn' | 'error'
  message: string
}

export type DoctorReport = {
  ok: boolean
  issues: DoctorIssue[]
}

export async function runDoctor(root: string): Promise<DoctorReport> {
  const workspaceRoot = await findWorkspaceRoot(root)
  const issues: DoctorIssue[] = []

  await checkFile(workspaceRoot, 'package.json', 'repo package manifest missing', issues)
  await checkFile(workspaceRoot, 'pnpm-lock.yaml', 'pnpm lockfile missing', issues)
  await checkFile(workspaceRoot, 'pnpm-workspace.yaml', 'pnpm workspace config missing', issues)

  const packageJson = await readJson(path.join(workspaceRoot, 'package.json'))
  if (!packageJson?.packageManager) {
    issues.push({
      level: 'warn',
      message: 'packageManager is not defined in package.json'
    })
  }

  const packagesDir = path.join(workspaceRoot, 'packages')
  const packageNames = await readWorkspacePackageNames(packagesDir)
  const expected = [
    '@eycraf/permission-kit-core',
    '@eycraf/permission-kit-react',
    '@eycraf/permission-kit-vite-plugin',
    '@eycraf/permission-kit-cli'
  ]

  for (const name of expected) {
    if (!packageNames.has(name)) {
      issues.push({
        level: 'error',
        message: `workspace package missing: ${name}`
      })
    }
  }

  const nodeModulesExists = await exists(path.join(workspaceRoot, 'node_modules'))
  if (!nodeModulesExists) {
    issues.push({
      level: 'warn',
      message: 'node_modules is missing; run pnpm install before publishing'
    })
  }

  return {
    ok: issues.every((item) => item.level !== 'error'),
    issues
  }
}

async function findWorkspaceRoot(start: string) {
  let current = path.resolve(start)

  while (true) {
    if (
      (await exists(path.join(current, 'pnpm-workspace.yaml'))) &&
      (await exists(path.join(current, 'package.json')))
    ) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      return path.resolve(start)
    }

    current = parent
  }
}

async function checkFile(root: string, fileName: string, message: string, issues: DoctorIssue[]) {
  if (!(await exists(path.join(root, fileName)))) {
    issues.push({ level: 'error', message })
  }
}

async function readWorkspacePackageNames(packagesDir: string) {
  const names = new Set<string>()

  if (!(await exists(packagesDir))) {
    return names
  }

  const entries = await fs.readdir(packagesDir, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const packageJsonPath = path.join(packagesDir, entry.name, 'package.json')
    const data = await readJson(packageJsonPath)
    if (data?.name) {
      names.add(data.name)
    }
  }

  return names
}

async function readJson(file: string) {
  try {
    const content = await fs.readFile(file, 'utf-8')
    return JSON.parse(content) as { name?: string; packageManager?: string } | null
  } catch {
    return null
  }
}

async function exists(file: string) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}
