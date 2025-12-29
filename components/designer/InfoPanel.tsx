'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

interface Message {
  id: string;
  text: string;
  type: 'tip' | 'success' | 'warning' | 'alert' | 'user' | 'nervi';
  isUser?: boolean;
}

const QUICK_PROMPTS = [
  { text: 'Suggest plants', prompt: 'What plants should I add next?' },
  { text: 'Coverage tips', prompt: 'How can I improve my garden coverage?' },
  { text: 'Bloom timing', prompt: 'How is my bloom calendar looking?' },
  { text: 'Wildlife help', prompt: 'How can I attract more pollinators?' },
];

export default function InfoPanel() {
  const { state, getPlantCounts, getCoverage, getSpeciesCount, getKeystoneCount } = useDesigner();
  const [messages, setMessages] = useState<Message[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const prevState = useRef({ plantCount: 0, coverage: 0, speciesCount: 0, keystoneCount: 0 });
  const messageHistory = useRef<Set<string>>(new Set());
  const chatRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((text: string, type: Message['type'], isUser = false) => {
    // Only prevent duplicates for auto-generated messages
    if (!isUser && messageHistory.current.has(text)) return;
    if (!isUser) {
      messageHistory.current.add(text);
      if (messageHistory.current.size > 20) {
        const first = messageHistory.current.values().next().value;
        if (first) messageHistory.current.delete(first);
      }
    }

    const msg: Message = { id: `${Date.now()}-${Math.random()}`, text, type, isUser };
    setMessages(prev => [...prev.slice(-8), msg]); // Keep last 9 messages
  }, []);

  const coverage = getCoverage();
  const speciesCount = getSpeciesCount();
  const keystoneCount = getKeystoneCount();
  const plantCount = state.plants.length;
  const counts = getPlantCounts();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-responses based on garden state
  useEffect(() => {
    const prev = prevState.current;

    // First plant placed
    if (plantCount === 1 && prev.plantCount === 0) {
      addMessage('🎉 Great start! Tap plants to place more, or double-tap to remove.', 'success');
    }

    // Coverage milestones
    if (coverage >= 30 && prev.coverage < 30) {
      addMessage('Nice! 30% coverage - your garden is taking shape!', 'success');
    }
    if (coverage >= 60 && prev.coverage < 60) {
      addMessage('🌟 60% coverage achieved! Looking lush!', 'success');
    }
    if (coverage >= 85 && prev.coverage < 85) {
      addMessage(`⚠️ Getting dense! Plants may compete for space at ${coverage}% coverage.`, 'warning');
    }

    // Keystone achievements
    if (keystoneCount === 1 && prev.keystoneCount === 0) {
      addMessage('🦋 First keystone species! These plants support 90% of butterfly caterpillars.', 'success');
    }
    if (keystoneCount === 5 && prev.keystoneCount < 5) {
      addMessage('🏆 ALL 5 keystone species! Your garden is an ecological powerhouse!', 'success');
    }

    // Species diversity
    if (speciesCount >= 5 && prev.speciesCount < 5) {
      addMessage('🌈 5+ species - excellent diversity for a healthy ecosystem!', 'success');
    }

    // Low diversity warning
    if (plantCount > 5 && speciesCount < 3 && prev.speciesCount >= speciesCount) {
      addMessage('💭 Try mixing in some different species for variety and resilience.', 'warning');
    }

    // Initial message
    if (plantCount === 0 && prev.plantCount !== 0) {
      setMessages([]);
      messageHistory.current.clear();
      addMessage("👋 Hey! I'm Nervi, your garden companion. Select a plant from the tray to get started!", 'tip');
    }

    prevState.current = { plantCount, coverage, speciesCount, keystoneCount };
  }, [plantCount, coverage, speciesCount, keystoneCount, addMessage]);

  // Initial welcome message
  useEffect(() => {
    if (plantCount === 0 && messages.length === 0) {
      addMessage("👋 Hey! I'm Nervi, your garden companion. Select a plant from the tray to get started!", 'tip');
    }
  }, [plantCount, messages.length, addMessage]);

  // Generate AI response based on prompt
  const generateResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();

    // Plant suggestions
    if (lowerPrompt.includes('suggest') || lowerPrompt.includes('what plant') || lowerPrompt.includes('add next')) {
      const usedNames = Object.keys(counts);
      const unusedPlants = PLANTS.filter(p => !p.isBlank && !usedNames.includes(p.name));
      const unusedKeystones = unusedPlants.filter(p => p.isKeystone);

      if (keystoneCount < 5 && unusedKeystones.length > 0) {
        const suggestion = unusedKeystones[0];
        return `🌿 I recommend adding <strong>${suggestion.name}</strong>! It's a keystone species that ${suggestion.wildlife.toLowerCase().includes('butterfly') ? 'attracts butterflies' : 'supports native wildlife'}. You have ${5 - keystoneCount} keystone species left to unlock maximum ecological impact!`;
      }

      if (unusedPlants.length > 0) {
        const suggestion = unusedPlants[Math.floor(Math.random() * unusedPlants.length)];
        return `🌱 Try adding <strong>${suggestion.name}</strong> (${suggestion.sciName}). It blooms ${suggestion.bloom} with ${suggestion.bloomColor === '#FFD700' ? 'golden yellow' : suggestion.bloomColor === '#9932CC' ? 'vibrant purple' : 'beautiful'} flowers!`;
      }

      return "🎉 Amazing! You've used all available plant species. Your garden is incredibly diverse!";
    }

    // Coverage advice
    if (lowerPrompt.includes('coverage') || lowerPrompt.includes('fill') || lowerPrompt.includes('gaps')) {
      if (coverage < 30) {
        return `📊 You're at ${coverage}% coverage. Try filling in the center with larger spreading plants like Purple Coneflower or Goldenrod.`;
      } else if (coverage < 60) {
        return `📊 ${coverage}% coverage - good progress! Focus on areas near the front for visual impact when viewed from your home.`;
      } else if (coverage < 85) {
        return `📊 ${coverage}% is excellent! Consider adding some smaller accent plants in gaps, but leave a bit of space for plants to grow.`;
      }
      return `📊 ${coverage}% coverage is quite dense! Plants need room to spread. Consider removing some to give them breathing room.`;
    }

    // Bloom timing
    if (lowerPrompt.includes('bloom') || lowerPrompt.includes('flower') || lowerPrompt.includes('calendar')) {
      const bloomMonths = new Set<number>();
      Object.keys(counts).forEach(name => {
        const plant = PLANTS.find(p => p.name === name);
        if (plant?.bloom) {
          const parts = plant.bloom.split('-');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const start = months.indexOf(parts[0]) + 1;
          const end = months.indexOf(parts[1]) + 1;
          for (let m = start; m <= end; m++) bloomMonths.add(m);
        }
      });

      if (bloomMonths.size === 0) {
        return "🌸 Add some flowering plants to see your bloom calendar! Early bloomers (May-Jun) and fall flowers (Sep-Oct) create the longest season.";
      }

      const gaps = [];
      for (let m = 5; m <= 10; m++) {
        if (!bloomMonths.has(m)) gaps.push(['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][m - 5]);
      }

      if (gaps.length === 0) {
        return "🌸 Excellent! You have continuous blooms from spring through fall - pollinators will love your garden!";
      }

      return `🌸 Your bloom calendar has gaps in ${gaps.join(', ')}. Consider adding plants that flower during those months.`;
    }

    // Wildlife/pollinator
    if (lowerPrompt.includes('wildlife') || lowerPrompt.includes('pollinator') || lowerPrompt.includes('butterfly') || lowerPrompt.includes('bee')) {
      if (keystoneCount === 0) {
        return "🦋 Add keystone species like Black-Eyed Susan, Purple Coneflower, or Butterfly Weed - they support 90% of butterfly caterpillars!";
      }

      const tips = [
        "🐝 Leave some bare soil near plants for ground-nesting bees - they're excellent pollinators!",
        "🦋 Butterfly Weed is essential for Monarchs - they use it as a host plant for their caterpillars.",
        "🐦 Leave seedheads in winter - goldfinches love Coneflower and Black-Eyed Susan seeds!",
        "🦋 Plant in clusters of 3-5 of the same species - it helps pollinators find them more easily.",
      ];

      return tips[Math.floor(Math.random() * tips.length)];
    }

    // Default helpful response
    return "💡 I'm here to help! Ask me about plant suggestions, coverage tips, bloom timing, or how to attract more wildlife to your garden.";
  };

  // Build context for AI
  const buildContext = () => {
    const bloomMonths: number[] = [];
    Object.keys(counts).forEach(name => {
      const plant = PLANTS.find(p => p.name === name);
      if (plant?.bloom) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const parts = plant.bloom.split('-');
        const start = months.indexOf(parts[0]) + 1;
        const end = months.indexOf(parts[1]) + 1;
        for (let m = start; m <= end; m++) {
          if (!bloomMonths.includes(m)) bloomMonths.push(m);
        }
      }
    });

    return {
      sqft: state.widthFt * state.depthFt,
      dimensions: `${state.widthFt}×${state.depthFt} ft`,
      plantCount,
      speciesCount,
      plantList: Object.entries(counts).map(([name, qty]) => `${name} (${qty})`).join(', ') || 'none',
      bloomMonths,
      hasKeystone: keystoneCount > 0,
      hasGrass: Object.keys(counts).some(name => PLANTS.find(p => p.name === name)?.isGrass),
      shape: state.shape,
    };
  };

  // Call real AI API
  const callAI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          context: buildContext(),
        }),
      });

      const data = await response.json();
      if (data.message) {
        return data.message;
      }
      // Fallback to local response if API fails
      return generateResponse(userMessage);
    } catch {
      // Fallback to local response
      return generateResponse(userMessage);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    addMessage(prompt, 'user', true);
    setIsTyping(true);

    try {
      const response = await callAI(prompt);
      setIsTyping(false);
      addMessage(response, 'nervi');
    } catch {
      setIsTyping(false);
      addMessage(generateResponse(prompt), 'nervi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addMessage(inputValue, 'user', true);
    const question = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await callAI(question);
      setIsTyping(false);
      addMessage(response, 'nervi');
    } catch {
      setIsTyping(false);
      addMessage(generateResponse(question), 'nervi');
    }
  };

  return (
    <div className={`${styles.infoPanel} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.infoHead} onClick={() => setCollapsed(!collapsed)}>
        <div className={styles.infoTitle}>
          <div className={styles.nerviAvatar}>🌿</div>
          <span>Nervi — Garden Assistant</span>
          <div className={styles.nerviStatus} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
          className={styles.collapseToggle}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      <div className={styles.infoContent}>
        {/* Ecological Stats Sidebar */}
        <div className={styles.infoStats}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🌱</span>
            <div className={styles.statVal}>{plantCount}</div>
            <div className={styles.statLbl}>Plants</div>
          </div>
          <div className={`${styles.statItem} ${coverage > 50 ? styles.highlight : ''}`} style={{ background: coverage > 90 ? '#FFF3E0' : undefined }}>
            <span className={styles.statIcon}>📐</span>
            <div className={styles.statVal}>{coverage}%</div>
            <div className={styles.statLbl}>Coverage</div>
          </div>
          <div className={`${styles.statItem} ${speciesCount >= 5 ? styles.highlight : ''}`}>
            <span className={styles.statIcon}>🌈</span>
            <div className={styles.statVal}>{speciesCount}</div>
            <div className={styles.statLbl}>Species</div>
          </div>
          <div className={`${styles.statItem} ${keystoneCount > 0 ? styles.highlight : ''}`}>
            <span className={styles.statIcon}>⭐</span>
            <div className={styles.statVal}>{keystoneCount}/5</div>
            <div className={styles.statLbl}>Keystone</div>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🦋</span>
            <div className={`${styles.statVal} ${styles.small}`}>{keystoneCount > 0 ? 'Yes!' : 'Add'}</div>
            <div className={styles.statLbl}>Butterflies</div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatArea}>
          {/* Chat Messages */}
          <div className={styles.chatMessages} ref={chatRef}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`${styles.chatBubble} ${msg.isUser ? styles.userBubble : ''}`}
              >
                <div className={`${styles.bubbleText} ${styles[msg.type]}`}>
                  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={styles.chatBubble}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className={styles.quickPrompts}>
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                className={styles.quickPromptBtn}
                onClick={() => handleQuickPrompt(qp.prompt)}
              >
                {qp.text}
              </button>
            ))}
          </div>

          {/* Input */}
          <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Nervi anything..."
              className={styles.chatInputField}
            />
            <button type="submit" className={styles.chatSendBtn}>
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
