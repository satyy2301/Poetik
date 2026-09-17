import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const REACTIONS = ['❤️', '👍', '😂', '😮', '🎉'];

type MessageReactionsProps = {
  reactions: Record<string, string[]>;
  currentUserId: string;
  onReact: (emoji: string) => void;
};

const MessageReactions = ({ reactions, currentUserId, onReact }: MessageReactionsProps) => {
  const entries = Object.entries(reactions || {}).filter(([, users]) => users.length > 0);

  return (
    <View style={styles.container}>
      {entries.map(([emoji, users]) => (
        <TouchableOpacity
          key={emoji}
          style={[styles.chip, users.includes(currentUserId) && styles.chipActive]}
          onPress={() => onReact(emoji)}
        >
          <Text style={styles.chipText}>{emoji} {users.length}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.picker}>
        {REACTIONS.map((emoji) => (
          <TouchableOpacity key={emoji} onPress={() => onReact(emoji)} style={styles.emojiBtn}>
            <Text>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  chipActive: { backgroundColor: '#dfe6e9', borderWidth: 1, borderColor: '#74b9ff' },
  chipText: { fontSize: 12 },
  picker: { flexDirection: 'row', gap: 4, marginTop: 2 },
  emojiBtn: { padding: 4 },
});

export default React.memo(MessageReactions);
