import { useRef, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import API_KEY from './config';



function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [isCopied, setIsCopied] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const bottomRef = useRef(null);
  const chatBoxRef = useRef(null);
  const shouldScrollRef = useRef(false);

 function cleanLatex(text) {
    if (!text) return text;
    return text
        .replace(/\$\$/g, '')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\rightarrow/g, '→')
        .replace(/\\to/g, '→')
        .replace(/\\times/g, '×')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/\[/g, ' [')
        .replace(/\]/g, '] ');
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [chatHistory]);

  useEffect(() => {
    const handleScroll = () => {
      const el = chatBoxRef.current;
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setShowScrollButton(!atBottom);
    };

    const el = chatBoxRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, []);

  function formatMarkdown(text) {
    if (!text) return "";
    
    // Apply the Latex cleaning first 
    text = cleanLatex(text);

    text = text.replace(/\n{2,}/g, '\n');
    
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
    let html = text.replace(codeBlockRegex, (_, lang, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
    });

    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    html = html
      .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
      .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');

    html = html
      .replace(/^\s*[-*] (.*)/gm, '<li>$1</li>')
      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>');
    
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function generateAnswer(newQuestion, idx) {
    if (!newQuestion.trim() || isRequesting) return;

    const userMessage = { role: "user", text: newQuestion };
    let updatedHistory = [...chatHistory];

    if (editMode !== null) {
      updatedHistory[editMode] = userMessage;
      updatedHistory = updatedHistory.slice(0, editMode + 1);
    } else {
      updatedHistory.push(userMessage);
    }

    shouldScrollRef.current = true;
    setChatHistory(updatedHistory);
    setLoading(true);
    setQuestion("");
    setEditMode(null);
    setIsRequesting(true);

    const modelsToTry = [
        "gemini-2.5-flash-preview-09-2025", 
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash"
    ];

    let success = false;
    let aiText = "";

    for (const model of modelsToTry) {
        if (success) break;
        try {
            console.log(`Attempting to chat using model: ${model}...`);
            const response = await axios({
                url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                method: "post",
                data: {
                contents: [{ parts: [{ text: newQuestion }] }]
                }
            });

            // Extract response based on whiteboard logic [cite: 253]
            aiText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
                success = true;
                const aiMessage = { role: "ai", text: aiText };
                updatedHistory.push(aiMessage);
            }
        } catch (error) {
            console.warn(`Model ${model} failed.`, error.message);
            // If it's the last model and it failed, we show the error
            if (model === modelsToTry[modelsToTry.length - 1]) {
                 updatedHistory.push({ 
                    role: "ai", 
                    text: "Sorry, all AI models are currently busy or unavailable. Please try again later." 
                });
            }
        }
    }

    setChatHistory(updatedHistory);
    setLoading(false);
    setIsRequesting(false);
  }

  const handleEditQuestion = (index) => {
    setEditMode(index);
    setQuestion(chatHistory[index].text);
  };

  const handleSaveEdit = () => {
    if (editMode !== null) {
      generateAnswer(question, editMode);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setQuestion("");
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className={`chat-container ${darkMode ? 'dark' : ''}`}>
      <div className="theme-toggle-wrapper">
        <button
          className="toggle-theme-button"
          onClick={() => setDarkMode(prev => !prev)}
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? '🌞' : '🌙'}
        </button>
      </div>

      <div className="chat-controls">
        <h1 className="chat-title">🤖 Smart AI Assistant</h1>
      </div>

      <div className="chat-box" ref={chatBoxRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'ai' ? '🤖' : '👨🏻‍💻'}
            </div>
            <div className="chat-text">
              {editMode === index ? (
                <>
                  <textarea
                    className="chat-input"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' && !e.shiftKey) || (e.ctrlKey && e.key === 'Enter')) {
                        e.preventDefault();
                        handleSaveEdit();
                      }
                    }}
                    rows="2"
                    autoFocus
                  />
                  <button className="cancel-button" onClick={handleCancelEdit} title="Cancel Edit">❌</button>
                </>
              ) : (
                <>
                  <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                  {msg.role === 'ai' && !isCopied && (
                    <button className="copy-button" onClick={() => handleCopyToClipboard(msg.text)} title="Copy Answer">📋</button>
                  )}
                </>
              )}
            </div>
            {msg.role === 'user' && editMode !== index && (
              <button className="edit-button" onClick={() => handleEditQuestion(index)} title="Edit Question">✏️</button>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-message ai loading">
            <div className="chat-avatar">🤖</div>
            <div className="chat-text">
              <p>Thinking...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showScrollButton && (
        <button className="scroll-to-bottom-button down" onClick={scrollToBottom} title="Scroll to bottom">🡇</button>
      )}

      <div className="chat-controls">
        <textarea
          className="chat-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' && !e.shiftKey) || (e.ctrlKey && e.key === 'Enter')) {
              e.preventDefault();
              generateAnswer(question);
            }
          }}
          placeholder="Type your next question..."
          rows="2"
        />
        <button onClick={() => generateAnswer(question)} className="send-button">
          <span className="circle"></span>
          <span className="text">{loading ? 'Thinking...' : 'Ask AI'}</span>
          <svg viewBox="0 0 24 24" className="arr-1"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          <svg viewBox="0 0 24 24" className="arr-2"><path d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default App;