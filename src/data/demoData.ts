// Local, static demo data for the BookBridge prototype.
// No backend / API calls anywhere in this file.

export type Gradient = [string, string];

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
  gradient: Gradient;
  count: number;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  gradient: Gradient;
  location: string;
  bio: string;
  booksDonated: number;
  booksBorrowed: number;
  rating: number;
  reviews: number;
  joined: string;
  badges: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  gradient: Gradient;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  description: string;
  ownerId: string;
  location: string;
  distanceKm: number;
  postedAgo: string;
  rating: number;
  language: string;
  pages: number;
  tags: string[];
  status: 'Available' | 'Requested' | 'Reserved';
  coverUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or userId
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  userId: string;
  bookId?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

export interface Notification {
  id: string;
  type: 'message' | 'request' | 'accepted' | 'reminder' | 'system' | 'donation';
  title: string;
  body: string;
  time: string;
  read: boolean;
  link: string;
}

export const currentUser: User = {
  id: 'me',
  name: 'Ninad Gaikwad',
  initials: 'NG',
  gradient: ['#7C6FFF', '#F5A623'],
  location: 'Pune, India',
  bio: 'Reader of sci-fi and systems books. Always happy to pass on a good story.',
  booksDonated: 14,
  booksBorrowed: 9,
  rating: 4.9,
  reviews: 22,
  joined: 'March 2024',
  badges: ['Top Donor', 'Fast Responder', 'Verified'],
};

export const users: User[] = [
  currentUser,
  {
    id: 'u1',
    name: 'Aisha Kapoor',
    initials: 'AK',
    gradient: ['#FF6B9D', '#7C6FFF'],
    location: 'Mumbai, India',
    bio: 'Fantasy hoarder. Will trade dragons for detectives.',
    booksDonated: 27,
    booksBorrowed: 15,
    rating: 4.8,
    reviews: 41,
    joined: 'Jan 2023',
    badges: ['Top Donor', 'Community Star'],
  },
  {
    id: 'u2',
    name: 'Rohan Mehta',
    initials: 'RM',
    gradient: ['#2DD4BF', '#3B82F6'],
    location: 'Bengaluru, India',
    bio: 'Non-fiction only. Building a tiny free library in my apartment lobby.',
    booksDonated: 33,
    booksBorrowed: 6,
    rating: 5.0,
    reviews: 58,
    joined: 'Aug 2022',
    badges: ['Legend', 'Verified'],
  },
  {
    id: 'u3',
    name: 'Priya Nair',
    initials: 'PN',
    gradient: ['#F5A623', '#FF6B9D'],
    location: 'Pune, India',
    bio: 'Poetry and translated fiction. Slow reader, fast lender.',
    booksDonated: 8,
    booksBorrowed: 12,
    rating: 4.7,
    reviews: 19,
    joined: 'Nov 2024',
    badges: ['Rising Star'],
  },
  {
    id: 'u4',
    name: 'Kabir Singh',
    initials: 'KS',
    gradient: ['#8B5CF6', '#EC4899'],
    location: 'Delhi, India',
    bio: 'Comics, manga, and anything with a good cover.',
    booksDonated: 19,
    booksBorrowed: 21,
    rating: 4.6,
    reviews: 33,
    joined: 'May 2023',
    badges: ['Verified'],
  },
  {
    id: 'u5',
    name: 'Meera Iyer',
    initials: 'MI',
    gradient: ['#3B82F6', '#22D3EE'],
    location: 'Chennai, India',
    bio: 'Ex-teacher. Donating my classroom library one shelf at a time.',
    booksDonated: 45,
    booksBorrowed: 3,
    rating: 5.0,
    reviews: 67,
    joined: 'Feb 2022',
    badges: ['Legend', 'Top Donor', 'Verified'],
  },
];

export const categories: Category[] = [
  { id: 'engineering', name: 'Engineering', icon: 'Settings', gradient: ['#2563EB', '#06B6D4'], count: 0 },
  { id: 'computer-science', name: 'Computer Science', icon: 'Code2', gradient: ['#7C3AED', '#2563EB'], count: 0 },
  { id: 'mathematics', name: 'Mathematics', icon: 'Calculator', gradient: ['#0F766E', '#14B8A6'], count: 0 },
  { id: 'science', name: 'Science', icon: 'FlaskConical', gradient: ['#16A34A', '#84CC16'], count: 0 },
  { id: 'commerce', name: 'Commerce & Management', icon: 'BriefcaseBusiness', gradient: ['#D97706', '#F59E0B'], count: 0 },
  { id: 'humanities', name: 'Humanities', icon: 'Landmark', gradient: ['#DB2777', '#F472B6'], count: 0 },
  { id: 'medical', name: 'Medical & Pharmacy', icon: 'Stethoscope', gradient: ['#DC2626', '#FB7185'], count: 0 },
  { id: 'competitive-exams', name: 'Competitive Exams', icon: 'Trophy', gradient: ['#EA580C', '#FACC15'], count: 0 },
  { id: 'school', name: 'School Textbooks', icon: 'GraduationCap', gradient: ['#4F46E5', '#818CF8'], count: 0 },
  { id: 'reference', name: 'Reference & Notes', icon: 'NotebookText', gradient: ['#475569', '#94A3B8'], count: 0 },
];

export const books: Book[] = [
  {
    id: 'b1',
    title: 'The Silent Orbit',
    author: 'Lena Achterberg',
    gradient: ['#7C6FFF', '#3B82F6'],
    category: 'scifi',
    condition: 'Like New',
    description:
      "A generation ship drifts off course, and the only person who notices is a teenager who isn't supposed to be awake yet. A tense, character-driven sci-fi debut about isolation and trust.",
    ownerId: 'u1',
    location: 'Mumbai, India',
    distanceKm: 4.2,
    postedAgo: '2h ago',
    rating: 4.6,
    language: 'English',
    pages: 342,
    tags: ['space', 'debut', 'award-nominated'],
    status: 'Available',
  },
  {
    id: 'b2',
    title: 'Notes on a Vanishing City',
    author: 'Arjun Desai',
    gradient: ['#2DD4BF', '#3B82F6'],
    category: 'nonfiction',
    condition: 'Good',
    description:
      'A journalist spends a year walking every street of his childhood city before it is redeveloped. Part memoir, part urban history.',
    ownerId: 'u2',
    location: 'Bengaluru, India',
    distanceKm: 780,
    postedAgo: '5h ago',
    rating: 4.8,
    language: 'English',
    pages: 288,
    tags: ['memoir', 'city-life'],
    status: 'Available',
  },
  {
    id: 'b3',
    title: 'The Cartographer of Small Griefs',
    author: 'Priya Nair',
    gradient: ['#F5A623', '#FF6B9D'],
    category: 'poetry',
    condition: 'New',
    description:
      'A debut poetry collection mapping loss, migration, and the strange comfort of familiar streets. Bilingual edition, English and Malayalam.',
    ownerId: 'u3',
    location: 'Pune, India',
    distanceKm: 1.1,
    postedAgo: '1d ago',
    rating: 4.9,
    language: 'English / Malayalam',
    pages: 96,
    tags: ['poetry', 'bilingual'],
    status: 'Available',
  },
  {
    id: 'b4',
    title: 'Ashfall Chronicles: Book One',
    author: 'Devika Rao',
    gradient: ['#8B5CF6', '#EC4899'],
    category: 'scifi',
    condition: 'Good',
    description:
      'An epic fantasy opener where volcanic ash grants strange powers to those who breathe it in. First in a five-book series everyone is talking about.',
    ownerId: 'u4',
    location: 'Delhi, India',
    distanceKm: 1130,
    postedAgo: '3h ago',
    rating: 4.5,
    language: 'English',
    pages: 512,
    tags: ['fantasy', 'series-starter'],
    status: 'Requested',
  },
  {
    id: 'b5',
    title: 'The Quiet Ledger',
    author: 'Samuel Okafor',
    gradient: ['#1F2937', '#7C6FFF'],
    category: 'mystery',
    condition: 'Like New',
    description:
      'A forensic accountant uncovers a decade-old fraud that turns into a murder investigation. Slow-burn, whip-smart, perfect for fans of quiet detective fiction.',
    ownerId: 'u5',
    location: 'Chennai, India',
    distanceKm: 650,
    postedAgo: '6h ago',
    rating: 4.7,
    language: 'English',
    pages: 368,
    tags: ['detective', 'slow-burn'],
    status: 'Available',
  },
  {
    id: 'b6',
    title: 'Learning to Sit Still',
    author: 'Meera Iyer',
    gradient: ['#F5A623', '#FF6B9D'],
    category: 'selfhelp',
    condition: 'Good',
    description:
      'A gentle, unpretentious guide to attention and stillness, written by a former classroom teacher. No jargon, just practice.',
    ownerId: 'u5',
    location: 'Chennai, India',
    distanceKm: 650,
    postedAgo: '1d ago',
    rating: 4.4,
    language: 'English',
    pages: 210,
    tags: ['mindfulness', 'practical'],
    status: 'Available',
  },
  {
    id: 'b7',
    title: 'The Last Cartouche',
    author: 'Farah El-Sayed',
    gradient: ['#92400E', '#B45309'],
    category: 'history',
    condition: 'Fair',
    description:
      'A sweeping account of the final decades of hieroglyphic writing, and the scholars racing to decode it before it was lost forever.',
    ownerId: 'u2',
    location: 'Bengaluru, India',
    distanceKm: 780,
    postedAgo: '2d ago',
    rating: 4.3,
    language: 'English',
    pages: 420,
    tags: ['ancient-history', 'linguistics'],
    status: 'Available',
  },
  {
    id: 'b8',
    title: 'Paper Moons',
    author: 'Aisha Kapoor',
    gradient: ['#FF6B9D', '#7C6FFF'],
    category: 'romance',
    condition: 'Like New',
    description:
      'Two rival letter-writers for competing newspaper advice columns fall for each other without knowing it. Warm, funny, and a little bit devastating.',
    ownerId: 'u1',
    location: 'Mumbai, India',
    distanceKm: 4.2,
    postedAgo: '8h ago',
    rating: 4.9,
    language: 'English',
    pages: 298,
    tags: ['enemies-to-lovers', 'epistolary'],
    status: 'Available',
  },
  {
    id: 'b9',
    title: 'Kaiju Diaries Vol. 3',
    author: 'Hiro Tanaka',
    gradient: ['#EF4444', '#F97316'],
    category: 'comics',
    condition: 'Good',
    description:
      'The manga everyone borrowed and nobody returned, until now. A giant monster city-management comedy with real heart underneath.',
    ownerId: 'u4',
    location: 'Delhi, India',
    distanceKm: 1130,
    postedAgo: '4h ago',
    rating: 4.6,
    language: 'English (translated)',
    pages: 180,
    tags: ['manga', 'comedy'],
    status: 'Available',
  },
  {
    id: 'b10',
    title: 'The Founders We Forgot',
    author: 'Rohan Mehta',
    gradient: ['#3B82F6', '#22D3EE'],
    category: 'biography',
    condition: 'New',
    description:
      'Profiles of eight overlooked figures whose decisions shaped modern infrastructure, from sewage systems to submarine cables.',
    ownerId: 'u2',
    location: 'Bengaluru, India',
    distanceKm: 780,
    postedAgo: '12h ago',
    rating: 4.5,
    language: 'English',
    pages: 356,
    tags: ['infrastructure', 'overlooked-history'],
    status: 'Available',
  },
  {
    id: 'b11',
    title: 'Bramble & Bee',
    author: 'Ottoline Frost',
    gradient: ['#FBBF24', '#34D399'],
    category: 'kids',
    condition: 'Good',
    description:
      'A picture book about a stubborn bee who refuses to believe winter is coming. Gentle illustrations, ages 4-8.',
    ownerId: 'u3',
    location: 'Pune, India',
    distanceKm: 1.1,
    postedAgo: '1d ago',
    rating: 4.8,
    language: 'English',
    pages: 32,
    tags: ['picture-book', 'ages-4-8'],
    status: 'Available',
  },
  {
    id: 'b12',
    title: 'Thermodynamics for the Rest of Us',
    author: 'Dr. Sunita Rao',
    gradient: ['#64748B', '#334155'],
    category: 'academic',
    condition: 'Fair',
    description:
      "A second-year engineering textbook with generous margin notes from three previous owners. All the notes are correct, we checked.",
    ownerId: 'u2',
    location: 'Bengaluru, India',
    distanceKm: 780,
    postedAgo: '2d ago',
    rating: 4.1,
    language: 'English',
    pages: 540,
    tags: ['engineering', 'textbook'],
    status: 'Reserved',
  },
  {
    id: 'b13',
    title: 'Six Ways to Disappear',
    author: 'Lena Achterberg',
    gradient: ['#7C6FFF', '#3B82F6'],
    category: 'mystery',
    condition: 'Like New',
    description:
      'A locked-room mystery set on a decommissioned research station in Antarctica. Six scientists, one radio, and a killer among them.',
    ownerId: 'u1',
    location: 'Mumbai, India',
    distanceKm: 4.2,
    postedAgo: '9h ago',
    rating: 4.7,
    language: 'English',
    pages: 304,
    tags: ['locked-room', 'antarctica'],
    status: 'Available',
  },
  {
    id: 'b14',
    title: 'The Patient Gardener',
    author: 'Tomas Berglund',
    gradient: ['#2DD4BF', '#3B82F6'],
    category: 'nonfiction',
    condition: 'Good',
    description:
      "Forty years of one man's allotment garden, and what it taught him about patience, failure, and soil. Surprisingly moving.",
    ownerId: 'u5',
    location: 'Chennai, India',
    distanceKm: 650,
    postedAgo: '3d ago',
    rating: 4.6,
    language: 'English',
    pages: 248,
    tags: ['gardening', 'memoir'],
    status: 'Available',
  },
  {
    id: 'b15',
    title: 'Static & Signal',
    author: 'Kabir Singh',
    gradient: ['#8B5CF6', '#EC4899'],
    category: 'scifi',
    condition: 'New',
    description:
      'First contact told entirely through intercepted radio transcripts across forty years. Cold War tension meets deep-space mystery.',
    ownerId: 'u4',
    location: 'Delhi, India',
    distanceKm: 1130,
    postedAgo: '5h ago',
    rating: 4.8,
    language: 'English',
    pages: 276,
    tags: ['first-contact', 'epistolary'],
    status: 'Available',
  },
  {
    id: 'b16',
    title: 'The Recipe for Rain',
    author: 'Camila Duarte',
    gradient: ['#FF6B9D', '#F5A623'],
    category: 'fiction',
    condition: 'Like New',
    description:
      'Three sisters inherit their grandmother\'s restaurant and her habit of predicting weather through cooking. Magical realism set on the Brazilian coast.',
    ownerId: 'u3',
    location: 'Pune, India',
    distanceKm: 1.1,
    postedAgo: '7h ago',
    rating: 4.9,
    language: 'English (translated)',
    pages: 312,
    tags: ['magical-realism', 'family'],
    status: 'Available',
  },
  {
    id: 'b17',
    title: 'The Weight of Water',
    author: 'Nadia Ferreira',
    gradient: ['#3B82F6', '#7C6FFF'],
    category: 'fiction',
    condition: 'Like New',
    description:
      'A dam engineer returns to the valley her grandfather flooded decades ago, and has to face a town that never forgave her family.',
    ownerId: 'me',
    location: 'Pune, India',
    distanceKm: 0,
    postedAgo: '2d ago',
    rating: 4.7,
    language: 'English',
    pages: 296,
    tags: ['family-saga', 'guilt'],
    status: 'Requested',
  },
  {
    id: 'b18',
    title: 'Field Notes on Everything',
    author: 'Ninad Gaikwad',
    gradient: ['#64748B', '#7C6FFF'],
    category: 'nonfiction',
    condition: 'Good',
    description:
      "A personal collection of essays on systems thinking, gathered from five years of scribbled margin notes and half-finished blog drafts.",
    ownerId: 'me',
    location: 'Pune, India',
    distanceKm: 0,
    postedAgo: '5d ago',
    rating: 4.5,
    language: 'English',
    pages: 214,
    tags: ['essays', 'systems-thinking'],
    status: 'Available',
  },
];

export const featuredBookIds = ['b1', 'b8', 'b15', 'b16', 'b5'];
export const trendingBookIds = ['b3', 'b9', 'b4', 'b13', 'b10'];

export const getBook = (id: string) => books.find((b) => b.id === id);
export const getUser = (id: string) => users.find((u) => u.id === id);
export const getBooksByOwner = (ownerId: string) => books.filter((b) => b.ownerId === ownerId);
export const getBooksByCategory = (categoryId: string) => books.filter((b) => b.category === categoryId);

export const conversations: Conversation[] = [
  {
    id: 'c1',
    userId: 'u1',
    bookId: 'b1',
    lastMessage: "Sure! I'm usually home after 6pm, works for you?",
    lastTime: '2m ago',
    unread: 2,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hey! Saw you liked The Silent Orbit 👋', time: '10:02 AM' },
      { id: 'm2', senderId: 'me', text: "Hi Aisha! Yes, I've been wanting to read it for weeks", time: '10:05 AM' },
      { id: 'm3', senderId: 'u1', text: "It's in great shape, barely cracked the spine", time: '10:06 AM' },
      { id: 'm4', senderId: 'me', text: 'Perfect, could I pick it up sometime this week?', time: '10:07 AM' },
      { id: 'm5', senderId: 'u1', text: "Sure! I'm usually home after 6pm, works for you?", time: '10:09 AM' },
    ],
  },
  {
    id: 'c2',
    userId: 'u2',
    bookId: 'b2',
    lastMessage: 'Thank you so much for donating, means a lot 🙏',
    lastTime: '1h ago',
    unread: 0,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Hi Rohan, is Notes on a Vanishing City still available?', time: 'Yesterday' },
      { id: 'm2', senderId: 'u2', text: 'Yes! All yours, no rush on returning it either', time: 'Yesterday' },
      { id: 'm3', senderId: 'me', text: "That's really generous, thank you!", time: 'Yesterday' },
      { id: 'm4', senderId: 'u2', text: 'Thank you so much for donating, means a lot 🙏', time: '1h ago' },
    ],
  },
  {
    id: 'c3',
    userId: 'u3',
    bookId: 'b3',
    lastMessage: 'Typing…',
    lastTime: '5h ago',
    unread: 0,
    messages: [
      { id: 'm1', senderId: 'u3', text: 'Hey, are you still looking for poetry collections?', time: 'Mon' },
      { id: 'm2', senderId: 'me', text: 'Always! What do you have?', time: 'Mon' },
      { id: 'm3', senderId: 'u3', text: 'Just added The Cartographer of Small Griefs, my own copy', time: 'Mon' },
    ],
  },
  {
    id: 'c4',
    userId: 'u4',
    bookId: 'b9',
    lastMessage: 'Deal, see you Saturday at the cafe',
    lastTime: '1d ago',
    unread: 0,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Loved volume 2, is volume 3 up for trade?', time: '2 days ago' },
      { id: 'm2', senderId: 'u4', text: 'It is! What have you got to trade', time: '2 days ago' },
      { id: 'm3', senderId: 'me', text: 'I have Static & Signal... oh wait that one is yours too haha', time: '2 days ago' },
      { id: 'm4', senderId: 'u4', text: 'Ha! Just borrow it, no trade needed', time: '1d ago' },
      { id: 'm5', senderId: 'me', text: "You're the best, thank you", time: '1d ago' },
      { id: 'm6', senderId: 'u4', text: 'Deal, see you Saturday at the cafe', time: '1d ago' },
    ],
  },
  {
    id: 'c5',
    userId: 'u5',
    lastMessage: 'I have a few more boxes coming if you want first pick',
    lastTime: '3d ago',
    unread: 0,
    messages: [
      { id: 'm1', senderId: 'u5', text: "Cleared out another classroom shelf, lots of good stuff", time: '3d ago' },
      { id: 'm2', senderId: 'me', text: 'Oh amazing, will check the listings', time: '3d ago' },
      { id: 'm3', senderId: 'u5', text: 'I have a few more boxes coming if you want first pick', time: '3d ago' },
    ],
  },
];

export const getConversation = (id: string) => conversations.find((c) => c.id === id);
export const getConversationByUser = (userId: string) => conversations.find((c) => c.userId === userId);

export const notifications: Notification[] = [
  {
    id: 'n1',
    type: 'message',
    title: 'Aisha Kapoor sent you a message',
    body: "Sure! I'm usually home after 6pm, works for you?",
    time: '2m ago',
    read: false,
    link: '/chat/c1',
  },
  {
    id: 'n2',
    type: 'accepted',
    title: 'Your request was accepted',
    body: 'Rohan Mehta approved your request for "Notes on a Vanishing City"',
    time: '1h ago',
    read: false,
    link: '/book/b2',
  },
  {
    id: 'n3',
    type: 'request',
    title: 'New request on your book',
    body: 'Someone requested "The Weight of Water" from your shelf',
    time: '3h ago',
    read: false,
    link: '/book/b17',
  },
  {
    id: 'n4',
    type: 'donation',
    title: 'Nearby donation added',
    body: 'Meera Iyer just listed 5 new books near Chennai',
    time: '6h ago',
    read: true,
    link: '/profile/u5',
  },
  {
    id: 'n5',
    type: 'reminder',
    title: 'Gentle reminder',
    body: '"Kaiju Diaries Vol. 3" pickup with Kabir is tomorrow at the cafe',
    time: '1d ago',
    read: true,
    link: '/chat/c4',
  },
  {
    id: 'n6',
    type: 'system',
    title: 'Welcome to BookBridge 📚',
    body: 'Donate a book or request one to get your first match',
    time: '3d ago',
    read: true,
    link: '/home',
  },
  {
    id: 'n7',
    type: 'message',
    title: 'Priya Nair sent you a message',
    body: 'Just added The Cartographer of Small Griefs, my own copy',
    time: '5d ago',
    read: true,
    link: '/chat/c3',
  },
];

export interface MyRequest {
  id: string;
  title: string;
  author?: string;
  category: string;
  status: 'Pending' | 'Matched' | 'Fulfilled';
  requestedAgo: string;
  matchedBookId?: string;
}

export const myRequests: MyRequest[] = [
  {
    id: 'r1',
    title: 'Notes on a Vanishing City',
    author: 'Arjun Desai',
    category: 'nonfiction',
    status: 'Fulfilled',
    requestedAgo: '3 days ago',
    matchedBookId: 'b2',
  },
  {
    id: 'r2',
    title: 'Six Ways to Disappear',
    author: 'Lena Achterberg',
    category: 'mystery',
    status: 'Matched',
    requestedAgo: '1 day ago',
    matchedBookId: 'b13',
  },
  {
    id: 'r3',
    title: 'A history of board games before 1900',
    category: 'history',
    status: 'Pending',
    requestedAgo: '6 hours ago',
  },
  {
    id: 'r4',
    title: 'Anything by Ursula K. Le Guin',
    category: 'scifi',
    status: 'Pending',
    requestedAgo: '2 days ago',
  },
];

export const searchSuggestions = [
  'Sci-fi under 300 pages',
  'Books near Pune',
  'Poetry collections',
  'Free textbooks',
  'Manga volume 1',
];

export const recentSearches = ['Fantasy series', 'Rohan Mehta', 'Self-help', 'Bilingual poetry'];
