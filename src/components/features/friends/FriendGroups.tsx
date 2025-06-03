import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { FriendGroup, FriendGroupsProps, Friend } from '@/lib/types/social.types';

export const FriendGroups: React.FC<FriendGroupsProps> = ({ friends, onGroupUpdate }) => {
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<FriendGroup>>({
    name: '',
    description: '',
    color: '#3B82F6',
  });

  const handleCreateGroup = () => {
    if (!newGroup.name) {
      toast.error('Group name is required');
      return;
    }

    const group: FriendGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      description: newGroup.description || '',
      friends: [],
      color: newGroup.color || '#3B82F6',
      imageUrl: '',
    };

    setGroups([...groups, group]);
    setShowCreateModal(false);
    setNewGroup({ name: '', description: '', color: '#3B82F6' });
    onGroupUpdate?.(group);
    toast.success('Group created successfully');
  };

  const handleAddToGroup = (groupId: string, friendId: string) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          friends: [...group.friends, friendId],
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    onGroupUpdate?.(updatedGroups.find(g => g.id === groupId)!);
    toast.success('Friend added to group');
  };

  const handleRemoveFromGroup = (groupId: string, friendId: string) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          friends: group.friends.filter(id => id !== friendId),
        };
      }
      return group;
    });

    setGroups(updatedGroups);
    onGroupUpdate?.(updatedGroups.find(g => g.id === groupId)!);
    toast.success('Friend removed from group');
  };

  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
    // For deletion, we don't need to call onGroupUpdate since the group no longer exists
    toast.success('Group deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Friend Groups</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            style={{ borderLeft: `4px solid ${group.color}` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{group.name}</h3>
                {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
              </div>
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>

            <div className="space-y-2">
              {friends?.map((friend: Friend) => {
                const isInGroup = group.friends.includes(friend.id);
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={friend.avatar}
                        alt={friend.username}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm">{friend.username}</span>
                    </div>
                    <button
                      onClick={() =>
                        isInGroup
                          ? handleRemoveFromGroup(group.id, friend.id)
                          : handleAddToGroup(group.id, friend.id)
                      }
                      className={`px-2 py-1 text-sm rounded ${
                        isInGroup
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isInGroup ? 'Remove' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newGroup.description}
                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="color"
                    value={newGroup.color}
                    onChange={e => setNewGroup({ ...newGroup, color: e.target.value })}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
