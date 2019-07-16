import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jpf:executor');

import * as tmp from 'tmp-promise';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as cp from 'child_process';
import { Readable } from 'stream';

export type Source = {
  name: string,
  code: string
};

export async function runJpf({ name, code }: Source): Promise<Readable> {
  const { path: cwd } = await tmp.dir();

  const sourceFile = path.join(cwd, `${name}.java`);
  const propertiesFile = path.join(cwd, `${name}.jpf`);

  debug(`writing source file: ${sourceFile}`);
  await fs.writeFile(sourceFile, code);

  debug(`writing properties file: ${propertiesFile}`);
  await fs.writeFile(propertiesFile, getProperties(name));

  try {
    debug(`compiling test harness`);
    const { status, stdout, stderr } = cp.spawnSync(`javac`, [sourceFile], { cwd });

    debug(`javac: %s`, stdout);

    if (status !== 0)
      throw stderr.toString();

  } catch (e) {
    throw new Error(`test compilation failed: ${e}`);
  }

  try {
    debug(`invoking Java Pathfinder`);
    const proc = cp.spawn(`jpf`, [propertiesFile], { cwd });
    return proc.stdout;

  } catch (e) {
    throw `JPF failed: ${e}`;
  }
}

function getProperties(target: string): string {
  return `target = ${target}
classpath = .
sourcepath = .
report.console.property_violation =
report.console.start =
report.console.finished =
search.multiple_errors = true
`;
}