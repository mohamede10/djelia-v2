import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { colors } from '../../config/colors';
import { BogolanPattern, DjeliaLogo } from '../../components/common/AfricanPattern';
import { useAppContext } from '../../store/AppProvider';
import { askDjeliBot, type DjeliBotSource } from '../../services/aiService';
import { getLocalGriotReply } from '../../services/djeliBotLocal';

const { height } = Dimensions.get('window');

const WELCOME_ID = 'welcome';
const MAX_HISTORY = 12;

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  sources?: DjeliBotSource[];
  offline?: boolean;
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const DjeliBotScreen = ({ route }: any) => {
  const { user } = useAppContext();
  const initialMessage = route.params?.initialMessage;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: WELCOME_ID,
      text: `N'ba di ${user?.name || 'cher ami'} ! Entre dans le cercle de la parole. Je suis DjeliBot, le souffle de tes ancêtres. Mon savoir est vaste comme le fleuve Niger et profond comme les racines d'un baobab millénaire. Que souhaites-tu explorer dans notre précieux héritage aujourd'hui ?`,
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList<Message>>(null);
  const sendingRef = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, [fadeAnim]);

  React.useEffect(() => {
    if (initialMessage) {
      send(initialMessage);
    }
    // L'effet ne doit se déclencher que lorsqu'un nouveau message initial arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sendingRef.current) return;

    sendingRef.current = true;

    const userMsg: Message = { id: makeId(), text: msg, sender: 'user' };
    const history = [...messages, userMsg]
      .filter((message) => message.id !== WELCOME_ID)
      .slice(-MAX_HISTORY)
      .map((message) => ({
        role: message.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: message.text,
      }));

    setMessages((previous) => [...previous, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await askDjeliBot(history, user?.name);
      setMessages((previous) => [
        ...previous,
        {
          id: makeId(),
          text: result.reply,
          sender: 'bot',
          sources: result.sources,
        },
      ]);
    } catch {
      // Repli explicite : l'utilisateur doit savoir que l'IA n'a pas répondu.
      setMessages((previous) => [
        ...previous,
        {
          id: makeId(),
          text: getLocalGriotReply(msg, user?.name),
          sender: 'bot',
          offline: true,
        },
      ]);
    } finally {
      setIsTyping(false);
      sendingRef.current = false;
    }
  };

  const canSend = input.trim().length > 0 && !isTyping;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="DjeliBot" subtitle="L'Esprit du Savoir" />

      <View style={styles.verticalTitleWrapper} pointerEvents="none">
        <Text style={styles.verticalLetter}>D</Text>
        <Text style={styles.verticalLetter}>J</Text>
        <Text style={styles.verticalLetter}>E</Text>
        <Text style={styles.verticalLetter}>L</Text>
        <Text style={styles.verticalLetter}>I</Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <BogolanPattern opacity={0.03} />
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.messageRow, isUser ? styles.rowUser : styles.rowBot]}>
                {!isUser && (
                  <View style={styles.botIconWrapper}>
                    <View style={styles.botGlow} />
                    <DjeliaLogo size={24} />
                  </View>
                )}
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.text, isUser ? styles.userText : styles.botText]}>
                    {item.text}
                  </Text>

                  {item.offline && (
                    <Text style={styles.offlineNote}>
                      Réponse locale : le serveur IA est momentanément injoignable.
                    </Text>
                  )}

                  {!isUser && item.sources && item.sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                      <Text style={styles.sourcesLabel}>Récits liés</Text>
                      <View style={styles.sourcesRow}>
                        {item.sources.map((source) => (
                          <View key={`${item.id}-${source.id}`} style={styles.sourceChip}>
                            <Text style={styles.sourceText}>{source.title}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <Text style={styles.typingText}>Le Djeli délie son sac de paroles...</Text>
              </View>
            ) : null
          }
        />
      </Animated.View>

      <View style={styles.inputAreaWrapper}>
        {messages.length === 1 && !isTyping && (
          <View style={styles.suggestionsRow}>
            {['Qui es-tu ?', 'Soundiata Keïta', 'Le masque Nimba'].map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => send(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Interroger la mémoire du monde..."
            placeholderTextColor={colors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!canSend}
            accessibilityLabel="Envoyer la question à DjeliBot"
          >
            <MaterialCommunityIcons name="feather" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  verticalTitleWrapper: {
    position: 'absolute',
    right: 15,
    top: 0,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  verticalLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 50,
    color: colors.text,
    opacity: 0.04,
    lineHeight: 60,
  },
  chatList: { padding: 25, paddingBottom: 40 },
  messageRow: { marginBottom: 25, flexDirection: 'row', alignItems: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  botIconWrapper: {
    width: 32,
    height: 32,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  botGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    opacity: 0.2,
  },
  bubble: {
    maxWidth: '85%',
    padding: 18,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.indigo,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
  },
  userText: {
    fontFamily: 'Poppins_400Regular',
    color: colors.white,
  },
  botText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    color: colors.text,
  },
  offlineNote: {
    marginTop: 12,
    fontFamily: 'Poppins_400Regular_Italic',
    fontSize: 11,
    lineHeight: 16,
    color: colors.textLight,
  },
  sourcesContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourcesLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textLight,
    marginBottom: 8,
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourceChip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sourceText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: colors.primary,
  },
  typingContainer: {
    paddingLeft: 44,
    marginBottom: 20,
  },
  typingText: {
    fontFamily: 'Poppins_400Regular_Italic',
    fontSize: 12,
    color: colors.textLight,
  },
  inputAreaWrapper: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'transparent',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  suggestionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: colors.primary,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    paddingLeft: 20,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingTop: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.indigo,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
