import React, { useCallback, useState } from 'react';
import { useUpbeat, useUpbeatQuery } from '@upbeat/react';
import {
  ResourcesSchema,
  TodoTagResource,
  TodoTagResourceSchema,
} from '../schema.generated';
import { Changeset, Query } from '@upbeat/client';

export const Tags: React.FC = () => {
  const { loading: tagsLoading, data: tagsData } = useUpbeatQuery<
    TodoTagResource[]
  >(Query.resource<TodoTagResourceSchema>('TodoTag').all());

  const client = useUpbeat();

  const [newTag, setNewTag] = useState('');
  const handleAddTag = useCallback(() => {
    client.applyChangeset(
      Changeset.create<ResourcesSchema, 'TodoTag'>('TodoTag', {
        name: newTag,
        color: '#ffffff',
      }),
    );
    setNewTag('');
  }, [client, newTag, setNewTag]);

  return (
    <React.Fragment>
      <h2 className="text-xl font-bold mb-4">Tags</h2>
      {!tagsLoading && tagsData !== undefined ? (
        <ul>
          {tagsData.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
        </ul>
      ) : null}
      <h2 className="text-xl font-bold mb-4">Create tag</h2>
      <input
        type="text"
        placeholder="tag name"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
      />
      <button onClick={handleAddTag}>Add Tag</button>
    </React.Fragment>
  );
};
