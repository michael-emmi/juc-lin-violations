import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jpf:checker');

import { Schema } from '../../schema';
import { Outcome } from '../../outcome';

import { getTestHarness } from './harness';
import { runJpf } from './executor';
import { getOutcomes } from './reader';

export type Result = {
  schema: Schema,
  outcomes: Outcome[]
};

export async function * check(schemas: Iterable<Schema>,
    jars: string[] = [],
    javaHome: string | undefined): AsyncIterable<Result> {

  for (const schema of schemas) {
    const outcomes = await collectOutcomes(schema, jars, javaHome);
    const status = outcomes.every(o => o.consistency !== undefined);
    const result = { schema, outcomes, status };
    debug(`result: %o`, result);
    yield result;
  }
}

async function collectOutcomes(schema: Schema,
    jars: string[] = [],
    javaHome: string | undefined): Promise<Outcome[]> {

  const source = getTestHarness(schema);
  const readable = await runJpf(source, jars, javaHome);
  const outcomes: Outcome[] = [];
  for await (const outcome of getOutcomes(readable, schema.outcomes)) {
    outcomes.push(outcome);
  }
  return outcomes;
}
