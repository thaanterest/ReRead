import { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Info, ArrowLeft, MessageSquare } from 'lucide-react';

const MOCK_CONVERSATIONS = [
  {
    id: 'conv1',
    user: { name: 'วรรณา ก.', avatar: '/avatar-wanna.png' },
    book: 'Norwegian Wood — Haruki Murakami',
    lastMsg: 'โอเคค่ะ นัดแลกที่ห้าง ช่วงบ่ายๆ ได้เลยค่ะ',
    unread: 1,
    messages: [
      { from: 'them', text: 'สวัสดีค่ะ เห็นว่าลง Norwegian Wood ไว้ สนใจแลกกับ The Secret History ของเราไหมคะ?', time: '10:00' },
      { from: 'me', text: 'สนใจค่ะ! หนังสือของคุณสภาพเป็นยังไงบ้างคะ?', time: '10:05' },
      { from: 'them', text: 'เหมือนใหม่เลยค่ะ อ่านแค่ครั้งเดียว ไม่มีรอยขีดเขียนนะคะ มีรูปประกอบให้ดูได้เลยค่ะ', time: '10:07' },
      { from: 'them', text: 'ฝั่งของพี่ The Secret History สภาพเป็นยังไงบ้างคะ?', time: '10:08' },
      { from: 'me', text: 'สภาพดีค่ะ มีรอยพับนิดหน่อยที่มุมหน้าแรก ไม่มีรอยขีดเขียนนะคะ ส่วนรวมถือว่า Good ค่ะ', time: '10:15' },
      { from: 'them', text: 'โอเคค่ะ ไม่เป็นไร ขอนัดแลกที่ห้างสะดวกไหมคะ? จะได้เจอกันตรงๆ', time: '10:20' },
      { from: 'me', text: 'ได้เลยค่ะ สะดวกช่วงไหนคะ?', time: '10:22' },
      { from: 'them', text: 'โอเคค่ะ นัดแลกที่ห้าง ช่วงบ่ายๆ ได้เลยค่ะ', time: '10:30' },
    ],
  },
  {
    id: 'conv2',
    user: { name: 'ภูมิ ส.', avatar: '/avatar-poom.png' },
    book: '1984 — George Orwell',
    lastMsg: 'ขอบคุณมากครับ รอรับพัสดุอยู่เลย',
    unread: 0,
    messages: [
      { from: 'them', text: 'สวัสดีครับ อยากแลก Dune กับ 1984 ของผมครับ', time: 'เมื่อวาน' },
      { from: 'me', text: 'ได้เลยค่ะ สะดวกส่งทางไปรษณีย์ไหมคะ?', time: 'เมื่อวาน' },
      { from: 'them', text: 'สะดวกครับ แลกเปลี่ยนที่อยู่กันได้เลยครับ', time: 'เมื่อวาน' },
      { from: 'me', text: 'โอเคค่ะ ส่งแล้วนะคะ Flash Express เลขพัสดุ TH6612345678 ค่ะ', time: '9:00' },
      { from: 'them', text: 'ขอบคุณมากครับ รอรับพัสดุอยู่เลย', time: '9:05' },
    ],
  },
  {
    id: 'conv3',
    user: { name: 'ดาว ร.', avatar: '/avatar-dao.png' },
    book: 'Pride and Prejudice — Jane Austen',
    lastMsg: 'ยังไม่แน่ใจค่ะ ขอดูก่อนนะคะ',
    unread: 1,
    messages: [
      { from: 'me', text: 'สวัสดีค่ะ สนใจ Pride and Prejudice ของคุณค่ะ ขอแลกกับหนังสือในชั้นของเราได้ไหมคะ?', time: '8:00' },
      { from: 'them', text: 'สวัสดีค่ะ ลองดูชั้นหนังสือของน้องก่อนนะคะ', time: '8:10' },
      { from: 'them', text: 'ยังไม่แน่ใจค่ะ ขอดูก่อนนะคะ', time: '8:11' },
    ],
  },
];

export default function ChatPage() {
  const [activeConv, setActiveConv] = useState(MOCK_CONVERSATIONS[0]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(activeConv.messages);
  const [showMobileList, setShowMobileList] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleConvChange = (conv: typeof MOCK_CONVERSATIONS[0]) => {
    setActiveConv(conv);
    setMessages(conv.messages);
    setShowMobileList(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { from: 'me', text: inputText.trim(), time: 'เมื่อกี้' }]);
    setInputText('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-medium">ข้อความ</h1>
        <button
          onClick={() => setShowMobileList(!showMobileList)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-main text-xs font-medium bg-bg-secondary"
        >
          <MessageSquare className="w-4 h-4 text-accent" />
          <span>{showMobileList ? 'กลับไปที่แชท' : 'รายการแชท'}</span>
        </button>
      </div>

      <div className="flex gap-0 border border-border-main rounded-md overflow-hidden h-[75vh] sm:h-[600px] relative bg-bg-main">

        {/* Conversation List */}
        <div className={`w-full md:w-72 md:flex-shrink-0 border-r border-border-main flex flex-col bg-bg-main absolute md:relative inset-0 z-20 md:z-auto transition-transform ${
          showMobileList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="px-4 py-3 bg-bg-secondary border-b border-border-main text-xs font-medium tracking-wider text-text-main/60 uppercase flex items-center justify-between">
            <span>การสนทนาทั้งหมด</span>
            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-mono">{MOCK_CONVERSATIONS.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MOCK_CONVERSATIONS.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleConvChange(conv)}
                className={`w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-bg-secondary transition-colors border-b border-border-main ${activeConv.id === conv.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}
              >
                <img src={conv.user.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0 bg-bg-secondary" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-medium text-sm truncate">{conv.user.name}</p>
                    {conv.unread > 0 && (
                      <span className="bg-warning text-bg-main text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{conv.unread}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <BookOpen className="w-3 h-3 text-accent flex-shrink-0" />
                    <p className="text-[11px] text-accent truncate">{conv.book}</p>
                  </div>
                  <p className="text-xs text-text-main/60 truncate">{conv.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-bg-main min-w-0">

          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border-main bg-bg-secondary">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileList(true)}
                className="md:hidden p-1.5 -ml-1 text-text-main/70 hover:text-text-main"
                title="กลับไปที่รายการแชท"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src={activeConv.user.avatar} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-bg-main flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{activeConv.user.name}</p>
                <div className="flex items-center gap-1 text-[11px] text-accent truncate">
                  <BookOpen className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{activeConv.book}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-bg-main rounded-full transition-colors text-text-main/60 flex-shrink-0">
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.from === 'me' ? 'flex-row-reverse' : ''}`}>
                {msg.from !== 'me' && (
                  <img src={activeConv.user.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0 bg-bg-secondary self-end" />
                )}
                <div className={`max-w-xs lg:max-w-md flex flex-col ${msg.from === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === 'me'
                      ? 'bg-accent text-bg-main rounded-tr-sm'
                      : 'bg-bg-secondary border border-border-main text-text-main rounded-tl-sm'
                    }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-text-main/40 mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-4 border-t border-border-main flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-bg-secondary border border-border-main rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-accent transition-all"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-accent text-bg-main rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
