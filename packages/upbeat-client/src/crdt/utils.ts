/**
 * @packageDocumentation
 * @module @upbeat/client/types/utils
 */
/*
 * What is a type and what does it do?
 *
 * A type is a basic atom within our CRDT.
 *
 * A type describes:
 *  - the shape of it to the application
 *  - the shape of its internal representation
 *  - the operations it accepts
 *
 * A type consists of three methods:
 *  - create: create an empty intermediate atom
 *  - apply: given the current intermediate atom, and an operation return the
 *    next internal atom.
 *  - realise: given the intermediate atom, return the application state.
 * */

import { SerialisedResourceOperation } from '../operations';

/**
 * An operation often needs the entire operation, along with the
 */
export interface OperationWrapper<O> {
  atomOperation: O;
  fullOperation: SerialisedResourceOperation;
}

/**
 * Holds everything needed for a type: create, realise, apply.
 */
export interface CRDTType<N extends string, I, A, O> {
  name: N;
  /**
   * Create a empty intermediate atom for the type
   */
  create(schema: unknown): I;

  /**
   * Realise a intermediate atom in to the types app atom
   */
  realise(property: I, schema: unknown): A;

  /**
   * Applies an operation of the type to the intermediate atom,
   * returning a new intermediate atom
   */
  apply(
    intermediate: I,
    operation: OperationWrapper<O>,
    next: any,
  ): [boolean, I];
}

/**
 * Create a CRDT Type
 */
export function createType<N extends string, I, A, O>(
  name: N,
  config: Omit<CRDTType<N, I, A, O>, 'name'>,
): CRDTType<N, I, A, O> {
  return { name, ...config };
}

export type OperationsFrom<S> = S extends CRDTType<
  string,
  unknown,
  unknown,
  infer O
>
  ? O
  : never;
export type AppAtomFrom<S> = S extends CRDTType<
  string,
  unknown,
  infer A,
  unknown
>
  ? A
  : never;
export type IntermediateFrom<S> = S extends CRDTType<
  string,
  infer I,
  unknown,
  unknown
>
  ? I
  : never;
