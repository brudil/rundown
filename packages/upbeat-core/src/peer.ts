/**
 * @packageDocumentation
 * @module @upbeat/core
 */

import { GivenId, Operation, UUID } from './types';
import { createHLCClock } from './timestamp';
import {
  CharOperationTypes,
  createStringPipeline,
  DeleteCharOperation,
  InsertCharOperation,
} from './structures/string';
import { createNanoEvents, Emitter } from 'nanoevents';
import uuid from 'uuid';

export interface Peer {
  createId(): GivenId;
  siteId: UUID;
  on: Emitter<any>['on'];
  receive(operation: Operation<any>): void;

  insertCharAt(index: number, char: string): void;
  removeCharAt(index: number): void;
  text: any;
  assembleString(): string;
}

function assertValidOp(op: Operation<any>) {
  if (op.locationId === undefined) {
    throw new Error('invalid operation created');
  }
}

export function createPeer(options: { debugSiteId?: string } = {}): Peer {
  const siteId: UUID = options.debugSiteId || uuid();
  const clock = createHLCClock(Date.now);
  const emitter = createNanoEvents<{
    send: Operation<any>;
  }>();

  const data = {
    text: createStringPipeline(),
  };

  const createId = (): GivenId => {
    return Object.freeze({
      siteId,
      timestamp: clock.now(),
    });
  };

  return {
    text: data.text,
    siteId,
    createId,
    on: emitter.on.bind(emitter),
    assembleString: data.text.getString,
    receive(operation: Operation<any>) {
      clock.update(operation.id.timestamp);
      data.text.ingress(operation);
    },
    insertCharAt(index, char) {
      const operation: InsertCharOperation = {
        id: createId(),
        locationId: data.text.getLocationIdAtIndex(index),
        value: {
          type: CharOperationTypes.INSERT,
          contents: [char],
        },
      };

      assertValidOp(operation);

      data.text.ingress(operation);
      emitter.emit('send', operation);
    },
    removeCharAt(index) {
      const operation: DeleteCharOperation = {
        id: createId(),
        locationId: data.text.getLocationIdAtIndex(index),
        value: {
          type: CharOperationTypes.DELETE,
        },
      };

      assertValidOp(operation);

      data.text.ingress(operation);
      emitter.emit('send', operation);
    },
  };
}
