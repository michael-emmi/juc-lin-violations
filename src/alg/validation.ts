import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('validation');

import { batch } from '../enumeration/batch';
import { Schema } from '../schema';
import { RandomProgramGenerator, Filter } from '../enumeration/random';
import { StaticOutcomesTester } from './testing';
import { SpecStrengthener } from '../spec/strengthener';

export interface SpecValidator {
  getViolations(spec): AsyncIterable<{}>;
  getFirstViolation(spec): Promise<{}>;
}

abstract class TestingBasedValidator implements SpecValidator {
  tester: StaticOutcomesTester;
  batchSize: number;
  maxPrograms: number;

  constructor({ server, generator, limits: { maxPrograms, ...limits } }) {
    this.tester = new StaticOutcomesTester({ server, generator, limits });
    this.batchSize = 100;
    this.maxPrograms = maxPrograms;
  }

  async getFirstViolation(spec) {
    let first;
    for await (let violation of this.getViolations(spec)) {

      // NOTE: supposedly breaking here ensures that the generator’s
      // return method is called before exiting.
      first = violation;
      break;
    }
    return first;
  }

  async * getViolations(spec) {
    let batches = batch(this.getPrograms(spec), { size: this.batchSize, max: this.maxPrograms });
    for await (let programs of batches) {
      debug(`testing ${programs.length} programs`);
      for await (let violation of this.tester.getViolations(programs))
        yield violation;
    }
  }

  abstract getPrograms(spec);
}

export class RandomTestValidator extends TestingBasedValidator {
  filter: Filter;
  limits: {};

  constructor({ server, generator, filter = _ => true, limits }) {
    super({ server, generator, limits });
    this.filter = filter;
    this.limits = limits;
  }

  * getPrograms(spec) {
    let filter = this.filter;
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });
    for (let program of programGenerator.getPrograms(this.filter))
      yield program;
  }
}

export class ProgramValidator extends TestingBasedValidator {
  programs: Schema[];

  constructor({ server, generator, limits, programs }) {
    super({ server, generator, limits });
    this.programs = programs;
  }

  * getPrograms(spec) {
    for (let program of this.programs)
      yield program;
  }
}

export class SpecStrengthValidator {
  server: any;
  generator: any;
  limits: {};
  strengthener: SpecStrengthener;

  constructor({ server, generator, limits, strengthener }) {
    this.server = server;
    this.generator = generator;
    this.limits = limits;
    this.strengthener = strengthener;
  }

  async * getViolations(spec) {
    for (let method of spec.methods) {
      let { server, generator, limits } = this;
      let filter: Filter = program => program.sequences.some(s => s.invocations.some(i => i.method.name === method.name));

      let validator = new RandomTestValidator({ server, generator, filter, limits });

      for (let { newSpec, attribute } of this.strengthener.getStrengthenings({ spec, method })) {
        debug(`trying %s: %s`, method.name, attribute);

        let violation = await validator.getFirstViolation(newSpec);

        if (violation) {
          debug(`found violation to stronger spec:\n%s`, violation);

        } else {
          debug(`found stronger spec; reporting maximality violation`);
          yield { method, attribute };
        }
      }
    }
  }
}
