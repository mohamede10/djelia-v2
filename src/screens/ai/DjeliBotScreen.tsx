import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { colors } from '../../config/colors';
import { BogolanPattern, DjeliaLogo } from '../../components/common/AfricanPattern';
import { useAppContext } from '../../store/AppProvider';

const { width, height } = Dimensions.get('window');

type Message = { id: string; text: string; sender: 'user' | 'bot'; };

export const DjeliBotScreen = ({ route }: any) => {
  const { user } = useAppContext();
  const initialMessage = route.params?.initialMessage;
  
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `N'ba di ${user?.name || 'cher ami'} ! Entre dans le cercle de la parole. Je suis DjeliBot, le souffle de tes ancêtres. Mon savoir est vaste comme le fleuve Niger et profond comme les racines d'un baobab millénaire. Que souhaites-tu explorer dans notre précieux héritage aujourd'hui ?`,
    sender: 'bot',
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    if (initialMessage) {
      send(initialMessage);
    }
  }, [initialMessage]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const userMsg: Message = { id: Date.now().toString(), text: msg, sender: 'user' };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getGriotReply(msg),
        sender: 'bot',
      };
      setMessages(p => [...p, botMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  function getGriotReply(msg: string): string {
    const lower = msg.toLowerCase();
    
    const intro = [
      "Ah, mon fils, tu touches là une corde sensible de ma kora... ",
      "Que la paix de tes ancêtres t'accompagne. Ta question fait vibrer la mémoire du Manden. ",
      "Écoute le vent qui souffle dans les feuilles du grand Fromager, il apporte la réponse que tu cherches. ",
      "Dans mon grand sac de paroles, j'ai justement un récit pour éclairer ton chemin. ",
    ];

    const wisdom = [
      "Sache que l'eau du fleuve ne remonte jamais vers sa source, mais elle nourrit toute la terre sur son passage. ",
      "Le savoir est comme un oiseau : si tu ne le tiens pas bien, il s'envole ; si tu le sers trop fort, il s'étouffe. ",
      "Celui qui voyage seul va vite, mais celui qui voyage avec la parole des anciens va loin. ",
    ];

    const conclusion = [
      " Est-ce que cette lumière suffit à dissiper l'ombre de ton doute ?",
      " Que souhaites-tu que je chante pour toi maintenant ?",
      " Pose ton fardeau, et laisse la sagesse de nos pères t'habiter.",
    ];

    let core = "";

    if (lower.includes('qui es-tu') || lower.includes('djeli') || lower.includes('griot')) {
      core = "Je suis le pont entre hier et demain, la voix qui ne meurt jamais car elle vit dans le coeur de ceux qui écoutent. Un Griot, vois-tu, n'est pas qu'un conteur ; c'est le sang de l'histoire, le médiateur des conflits, et le miroir de l'âme d'un peuple. Mes circuits sont faits de silicium, mais mes mots sont pétris dans l'argile rouge de notre terre.";
    }
    else if (lower.includes('soundiata') || lower.includes('mandingue') || lower.includes('keita')) {
      core = "Le grand Soundiata ! Le Lion qui a appris à marcher pour redresser le monde. Il n'a pas seulement bâti un empire de terre et de fer, il a gravé la dignité dans le coeur de chaque Mandingue. Rappelle-toi sa charte, celle de Kurukan Fuga, où il a dit que toute vie humaine est une vie. Quelle noblesse, n'est-ce pas ?";
    }
    else if (lower.includes('pular') || lower.includes('fouta') || lower.includes('peul')) {
      core = "Le Pular... Une langue qui coule comme le lait frais de la traite matinale. Dans les montagnes du Fouta, chaque mot est une poésie, chaque silence est un respect. Le Pulaaku n'est pas qu'un code, c'est une façon de se tenir debout face à l'univers, avec pudeur et courage.";
    }
    else if (lower.includes('nimba') || lower.includes('baga') || lower.includes('masque')) {
      core = "Le masque Nimba est la mère de nous tous. Elle porte le monde sur ses épaules de bois. Quand les Baga la font danser, c'est toute la fertilité de la terre qui s'éveille. Elle ne parle pas, mais son silence protège les berceaux et fait mûrir les grains de riz dans les champs salés.";
    }
    else if (lower.includes('kora') || lower.includes('musique') || lower.includes('instrument')) {
      core = "La Kora... 21 cordes, pas une de plus, pas une de moins. C'est le paradis qui a été mis en musique. Chaque note est un secret chuchoté par un ancêtre. Elle ne se joue pas avec les doigts, mais avec l'âme tout entière. C'est elle qui donne le rythme aux pas du roi.";
    }
    else {
      core = "Tes paroles sont comme des traces sur le sable, le vent les emporte un peu... mais parle-moi encore. Parle-moi de tes rois, de tes danses, ou du secret des plantes médicinales. Ma mémoire est une bibliothèque qui attend tes questions.";
    }

    const r = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    if (lower.includes('bonjour') || lower.includes('salut')) {
      return `N'ba di ${user?.name || 'voyageur'} ! Que ta journée soit aussi paisible que l'ombre d'un manguier. Je suis prêt à délier mon sac de paroles pour toi.`;
    }

    return `${r(intro)}${r(wisdom)}${core}${r(conclusion)}`;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          keyExtractor={i => i.id}
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
                </View>
              </View>
            );
          }}
          ListFooterComponent={isTyping ? (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>Le Djeli délie son sac de paroles...</Text>
            </View>
          ) : null}
        />
      </Animated.View>

      <View style={styles.inputAreaWrapper}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Interroger la mémoire du monde..."
            placeholderTextColor={colors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => send()}>
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
    color: colors.white 
  },
  botText: { 
    fontFamily: 'PlayfairDisplay_400Regular',
    color: colors.text 
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
});
