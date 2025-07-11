import { 
    User, UserRole, BlogPost, Comment, Bookmark, TotalStats, TopPostStat, 
    ReactionType, Notification, PostAnalyticsData, TimeSeriesDataPoint, TopAuthorStat
} from '../types';
import { generateId, delay, createExcerpt } from '../utils/helpers';
import { MOCK_API_DELAY, DEFAULT_PROFILE_PICTURE, DEFAULT_FEATURED_IMAGE } from '../constants';

// --- Mock Data ---
const initialUsers: User[] = [
    { id: 'admin-user', email: 'admin@example.com', username: 'AdminUser', role: UserRole.ADMIN, bio: 'The administrator of this blog.', profilePictureUrl: 'https://picsum.photos/seed/admin/100/100', following: ['editor-alice', 'user-bob'], createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'editor-alice', email: 'alice@example.com', username: 'EditorAlice', role: UserRole.EDITOR, bio: 'An editor with a keen eye for great content.', profilePictureUrl: 'https://picsum.photos/seed/alice/100/100', following: ['user-bob'], createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'user-bob', email: 'bob@example.com', username: 'UserBob', role: UserRole.USER, bio: 'A regular user who loves to read and comment.', profilePictureUrl: 'https://picsum.photos/seed/bob/100/100', following: ['admin-user'], createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const initialPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Future of Web Development',
    content: '<h2>The Rise of AI in Coding</h2><p>AI is revolutionizing how we code. Tools like GitHub Copilot are just the beginning.</p><h3>Impact on Developers</h3><p>Developers can now focus more on logic and less on boilerplate code. This increases productivity and creativity.</p><h2>WebAssembly and Performance</h2><p>WebAssembly (Wasm) is changing the game for web performance, allowing near-native speed for web applications.</p>',
    excerpt: 'Explore the exciting future of web development, from AI-powered coding assistants to the performance revolution of WebAssembly.',
    metaDescription: 'Discover the future of web development, including the rise of AI in coding and the impact of WebAssembly on web performance.',
    featuredImage: 'https://picsum.photos/seed/post1/800/400',
    tags: ['Technology', 'Web Development', 'AI'],
    authorId: 'admin-user',
    authorName: 'AdminUser',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'article',
    reactions: { like: ['user-bob'], celebrate: ['editor-alice'] },
  },
  {
    id: 'post-2',
    title: 'A Guide to Mindful Living',
    content: '<h2>What is Mindfulness?</h2><p>Mindfulness is the practice of being present and fully aware of the moment.</p><h2>Simple Exercises</h2><p>Try this: close your eyes and focus on your breath for five minutes. Notice the sensations without judgment.</p>',
    excerpt: 'Learn the basics of mindful living and discover simple exercises you can incorporate into your daily routine for a more peaceful life.',
    featuredImage: 'https://picsum.photos/seed/post2/800/400',
    tags: ['Wellness', 'Lifestyle'],
    authorId: 'editor-alice',
    authorName: 'EditorAlice',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'blog',
    reactions: { love: ['user-bob', 'admin-user'] },
  },
  {
    id: 'post-12-podcast',
    title: 'Podcast: The State of Modern JavaScript Frameworks',
    content: '<h2>Episode 1: Framework Fatigue or Flourishing Ecosystem?</h2><p>In this episode, we sit down with industry experts to discuss the explosion of JavaScript frameworks. Is it a sign of a healthy, growing ecosystem, or are developers feeling overwhelmed? We cover React, Vue, Svelte, and the newcomers on the block.</p><h3>Key Takeaways</h3><ul><li>The importance of fundamentals over framework-chasing.</li><li>How to choose the right tool for the job.</li><li>Predictions for the next 5 years in frontend.</li></ul><p>Tune in for a lively discussion!</p>',
    excerpt: 'A deep-dive audio discussion on the current landscape of JavaScript frameworks, from React to the latest innovations. Is it fatigue or a flourishing ecosystem?',
    featuredImage: 'https://picsum.photos/seed/post12/800/400',
    tags: ['Technology', 'Podcast', 'Web Development', 'JavaScript'],
    authorId: 'admin-user',
    authorName: 'AdminUser',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'podcast',
    audioUrl: 'https://storage.googleapis.com/web-dev-assets/podcast-audio.mp3',
    reactions: { insightful: ['user-bob', 'editor-alice'] },
  },
  {
    id: 'post-3',
    title: 'My Journey into React',
    content: '<p>This is my first post about learning React. It\'s a powerful library!</p><h2>State Management</h2><p>Learning about useState and useEffect has been a trip.</p>',
    tags: ['Personal', 'Web Development', 'React'],
    authorId: 'user-bob',
    authorName: 'UserBob',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'blog',
    reactions: {like: ['editor-alice']},
  },
  {
    id: 'post-4',
    title: 'The Art of Minimalist Design',
    content: '<h2>Less is More</h2><p>Minimalism isn\'t about having less, it\'s about making room for more of what matters.</p><h3>Principles of Minimalism</h3><ul><li>Use a monochromatic palette.</li><li>Embrace negative space.</li><li>Focus on typography.</li></ul>',
    excerpt: 'Discover the core principles of minimalist design and how to apply them to create clean, impactful visuals.',
    featuredImage: 'https://picsum.photos/seed/post4/800/400',
    tags: ['Design', 'Lifestyle', 'Technology'],
    authorId: 'editor-alice',
    authorName: 'EditorAlice',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'article',
    reactions: { insightful: ['admin-user', 'user-bob'] },
  },
  {
    id: 'post-13-podcast',
    title: 'Podcast: A Conversation on Creativity and AI',
    content: '<h2>Episode 2: Is AI a Threat or a Tool?</h2><p>Join us for a conversation with a digital artist and a writer as they share their perspectives on incorporating AI into the creative process. We discuss ethics, inspiration, and the future of art.</p>',
    excerpt: 'Can AI be truly creative? Listen to our latest episode where we explore the intersection of artificial intelligence and human creativity with two amazing guests.',
    featuredImage: 'https://picsum.photos/seed/post13/800/400',
    tags: ['Podcast', 'Creativity', 'AI', 'Art'],
    authorId: 'editor-alice',
    authorName: 'EditorAlice',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'podcast',
    audioUrl: 'https://storage.googleapis.com/web-dev-assets/podcast-audio.mp3',
    reactions: { love: ['user-bob'], insightful: ['admin-user'] },
  },
  {
    id: 'post-6',
    title: 'A Deep Dive into Sourdough Baking',
    content: '<h2>The Starter is Everything</h2><p>Patience is key. Your sourdough starter needs daily feeding and love to develop the yeasts that will make your bread rise.</p><h3>Baking Day</h3><p>From stretching and folding to the final bake, we walk you through the satisfying process of creating your own artisan loaf.</p>',
    excerpt: 'Unlock the secrets to perfect sourdough bread. From cultivating a starter to achieving the perfect crust, this guide has you covered.',
    featuredImage: 'https://picsum.photos/seed/post6/800/400',
    tags: ['Food', 'Lifestyle', 'Baking', 'DIY'],
    authorId: 'user-bob',
    authorName: 'UserBob',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'blog',
    reactions: { love: ['editor-alice'], like: ['admin-user'] },
  },
  {
    id: 'post-7',
    title: 'Serverless Architectures: The Good, The Bad, The Ugly',
    content: '<h2>Benefits of Going Serverless</h2><p>Reduced operational costs, automatic scaling, and faster time-to-market are just a few advantages.</p><h3>Common Pitfalls</h3><p>However, be aware of potential issues like vendor lock-in, cold starts, and debugging challenges.</p>',
    excerpt: 'Thinking of moving to a serverless architecture? We break down the major pros and cons to help you make an informed decision.',
    featuredImage: 'https://picsum.photos/seed/post7/800/400',
    tags: ['Technology', 'Cloud', 'Architecture'],
    authorId: 'admin-user',
    authorName: 'AdminUser',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'article',
    reactions: { insightful: ['editor-alice', 'user-bob'] },
  },
  {
    id: 'post-8',
    title: 'Book Review: "The Midnight Library"',
    content: '<h2>A Universe of Choices</h2><p>Matt Haig\'s novel explores the infinite possibilities of life. What if you could undo your regrets?</p><p>It\'s a thought-provoking and ultimately uplifting read about life, choices, and what it means to be happy.</p>',
    excerpt: 'Our take on Matt Haig\'s bestselling novel, "The Midnight Library." Is it worth the hype? We explore its themes and impact.',
    featuredImage: 'https://picsum.photos/seed/post8/800/400',
    tags: ['Books', 'Review', 'Lifestyle'],
    authorId: 'editor-alice',
    authorName: 'EditorAlice',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'blog',
    reactions: { love: ['user-bob', 'admin-user'], like: ['editor-alice'] },
  },
  {
    id: 'post-9',
    title: 'Getting Started with Digital Art',
    content: '<h2>Essential Tools</h2><p>You don\'t need the most expensive gear to start. A simple drawing tablet and a software like Krita or Procreate is all you need.</p><h3>Finding Your Style</h3><p>Experimentation is key. Don\'t be afraid to try different brushes, colors, and techniques to discover what you enjoy.</p>',
    excerpt: 'A beginner-friendly guide to diving into the world of digital art. We cover essential tools, software, and tips for finding your unique style.',
    featuredImage: 'https://picsum.photos/seed/post9/800/400',
    tags: ['Art', 'Design', 'DIY', 'Technology'],
    authorId: 'user-bob',
    authorName: 'UserBob',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'blog',
    reactions: { celebrate: ['editor-alice'] },
  },
  {
    id: 'post-10',
    title: 'The Philosophy of Stoicism for Modern Life',
    content: '<h2>Focus on What You Can Control</h2><p>Stoicism teaches us to differentiate between what is in our power and what is not. This simple idea can radically reduce anxiety.</p>',
    excerpt: 'Learn how ancient Stoic wisdom from thinkers like Marcus Aurelius and Seneca can be applied to navigate the challenges of modern life.',
    featuredImage: 'https://picsum.photos/seed/post10/800/400',
    tags: ['Philosophy', 'Wellness', 'Lifestyle'],
    authorId: 'admin-user',
    authorName: 'AdminUser',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'article',
    reactions: { insightful: ['editor-alice'] },
  },
  {
    id: 'post-11',
    title: 'Editing Your Own Work: A Checklist for Writers',
    content: '<h2>The First Pass: Big Picture</h2><p>Before you fix commas, check for plot holes, weak arguments, and overall flow.</p><h3>The Second Pass: Line by Line</h3><p>Now it\'s time to look at sentence structure, word choice, and clarity. Read it aloud to catch awkward phrasing.</p>',
    excerpt: 'A practical checklist for writers to effectively edit their own work, from big-picture structural changes to fine-tuning on the sentence level.',
    featuredImage: 'https://picsum.photos/seed/post11/800/400',
    tags: ['Writing', 'Productivity', 'DIY'],
    authorId: 'editor-alice',
    authorName: 'EditorAlice',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    postType: 'blog',
    reactions: { like: ['admin-user', 'user-bob'], insightful: ['user-bob'] },
  }
];

const initialComments: Comment[] = [
    { id: 'comment-1', blogPostId: 'post-1', userId: 'user-bob', userName: 'UserBob', content: 'This is a fascinating look at the future!', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), parentId: null, reported: false },
    { id: 'comment-2', blogPostId: 'post-1', userId: 'editor-alice', userName: 'EditorAlice', content: 'Great points! I agree Wasm is a game-changer.', createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), parentId: null, reported: false },
    { id: 'comment-3', blogPostId: 'post-1', userId: 'admin-user', userName: 'AdminUser', content: 'Thanks for the feedback!', createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(), parentId: 'comment-2', reported: false },
];

const initialManagedCategories = ['Technology', 'AI', 'Lifestyle', 'Productivity', 'Web Development', 'Wellness', 'Podcast', 'Creativity'];


// --- LocalStorage DB ---
interface MockDatabase {
    users: User[];
    posts: BlogPost[];
    comments: Comment[];
    notifications: Notification[];
    bookmarks: { [userId: string]: Bookmark[] };
    managedCategories: string[];
}

const DB_KEY = 'ownWritesMockDB';
const LOGGED_IN_USER_KEY = 'ownWritesLoggedInUser';

let db: MockDatabase;

const _loadDb = (): void => {
    try {
        const storedDb = localStorage.getItem(DB_KEY);
        if (storedDb) {
            db = JSON.parse(storedDb);
        } else {
            db = {
                users: initialUsers,
                posts: initialPosts,
                comments: initialComments,
                notifications: [],
                bookmarks: {},
                managedCategories: initialManagedCategories,
            };
            _saveDb();
        }
    } catch (e) {
        console.error("Failed to load mock DB from localStorage", e);
    }
};

const _saveDb = (): void => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("Failed to save mock DB to localStorage", e);
    }
};

// Initial load
_loadDb();


// --- API Service Implementation ---
export const apiService = {
  // --- Auth ---
  checkSession: async (): Promise<User | null> => {
    await delay(200);
    const userId = localStorage.getItem(LOGGED_IN_USER_KEY) || sessionStorage.getItem(LOGGED_IN_USER_KEY);
    if (userId) {
      return apiService.getUserById(userId);
    }
    return null;
  },

  login: async (email: string, password_DO_NOT_USE: string, rememberMe: boolean): Promise<User | null> => {
    await delay(MOCK_API_DELAY);
    const user = db.users.find(u => u.email === email);
    if (user) {
      if (rememberMe) {
        localStorage.setItem(LOGGED_IN_USER_KEY, user.id);
      } else {
        sessionStorage.setItem(LOGGED_IN_USER_KEY, user.id);
      }
      return user;
    }
    throw new Error('Invalid email or password.');
  },
  
  googleLogin: async (): Promise<User | null> => {
    await delay(MOCK_API_DELAY);
    const user = db.users.find(u => u.id === 'user-bob'); // Mock: log in as Bob
    if (user) {
      localStorage.setItem(LOGGED_IN_USER_KEY, user.id);
      return user;
    }
    throw new Error('Mock Google user not found.');
  },

  signup: async (username: string, email: string, password_DO_NOT_USE: string, role: UserRole): Promise<User | null> => {
    await delay(MOCK_API_DELAY);
    if (db.users.some(u => u.email === email)) {
        throw new Error('Email already in use.');
    }
    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username already taken.');
    }
    const newUser: User = {
        id: generateId(),
        email,
        username,
        role,
        bio: '',
        profilePictureUrl: '',
        following: [],
        createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    _saveDb();
    sessionStorage.setItem(LOGGED_IN_USER_KEY, newUser.id);
    return newUser;
  },

  logout: async (): Promise<void> => {
      await delay(200);
      localStorage.removeItem(LOGGED_IN_USER_KEY);
      sessionStorage.removeItem(LOGGED_IN_USER_KEY);
  },

  // --- Users ---
  getUserById: async (id: string): Promise<User | null> => {
    const user = db.users.find(u => u.id === id) || null;
    return Promise.resolve(user);
  },
  getAllUsers: async (): Promise<User[]> => {
    return Promise.resolve([...db.users]);
  },
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        db.users[userIndex] = { ...db.users[userIndex], ...updates };
        _saveDb();
        return Promise.resolve(db.users[userIndex]);
    }
    throw new Error("User not found for update.");
  },
  deleteUser: async (userId: string): Promise<void> => {
      const user = await apiService.getUserById(userId);
      if (user?.role === UserRole.ADMIN) {
          throw new Error("Cannot delete an admin user from the client.");
      }
      db.users = db.users.filter(u => u.id !== userId);
      _saveDb();
      return Promise.resolve();
  },
  updateUserRole: async (userId: string, newRole: UserRole): Promise<User> => {
      const user = await apiService.getUserById(userId);
      if (user?.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
          throw new Error("Cannot demote an admin user from the client.");
      }
      return apiService.updateUser(userId, { role: newRole });
  },
  followAuthor: async (followerId: string, authorToFollowId: string): Promise<User> => {
      const follower = await apiService.getUserById(followerId);
      if (!follower) throw new Error("Follower not found.");
      
      follower.following.push(authorToFollowId);
      apiService.updateUser(followerId, { following: follower.following });

      const newNotification: Notification = {
          id: generateId(),
          recipientId: authorToFollowId,
          actor: { id: follower.id, username: follower.username, profilePictureUrl: follower.profilePictureUrl },
          type: 'follow',
          message: `${follower.username} started following you.`,
          link: `#/author/${follower.id}`,
          read: false,
          createdAt: new Date().toISOString()
      };
      db.notifications.push(newNotification);
      _saveDb();

      return follower;
  },
  unfollowAuthor: async (followerId: string, authorToUnfollowId: string): Promise<User> => {
    const follower = await apiService.getUserById(followerId);
    if (!follower) throw new Error("Follower not found.");

    const updatedFollowing = follower.following.filter(id => id !== authorToUnfollowId);
    return apiService.updateUser(followerId, { following: updatedFollowing });
  },

  // --- Blog Posts ---
  getBlogs: async (): Promise<BlogPost[]> => {
    return Promise.resolve([...db.posts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },
  getBlogById: async (id: string): Promise<BlogPost | null> => {
    const post = db.posts.find(p => p.id === id) || null;
    return Promise.resolve(post);
  },
  getBlogsByAuthor: async (authorId: string): Promise<BlogPost[]> => {
    const posts = db.posts
        .filter(p => p.authorId === authorId)
        .map(p => ({
            ...p,
            commentCount: db.comments.filter(c => c.blogPostId === p.id).length
        }))
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(posts);
  },
  getEditorsPicks: async (limit: number = 2): Promise<BlogPost[]> => {
    const editorIds = db.users.filter(u => u.role === UserRole.EDITOR).map(u => u.id);
    const picks = db.posts
        .filter(p => p.status === 'published' && editorIds.includes(p.authorId))
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(picks.slice(0, limit));
  },
  searchBlogsFullText: async (term: string): Promise<BlogPost[]> => {
      if (!term.trim()) return [];
      const lowerCaseTerm = term.toLowerCase();
      
      const results = db.posts
        .filter(p => p.status === 'published')
        .map((p): BlogPost | null => {
            let matchSnippet = '';
            let matchField: BlogPost['matchField'] | undefined;

            if (p.title.toLowerCase().includes(lowerCaseTerm)) {
                matchField = 'title';
                matchSnippet = p.title;
            } else if (p.tags.some(t => t.toLowerCase().includes(lowerCaseTerm))) {
                matchField = 'tag';
                matchSnippet = p.tags.join(', ');
            } else if (p.authorName.toLowerCase().includes(lowerCaseTerm)) {
                matchField = 'author';
                matchSnippet = `By ${p.authorName}`;
            } else if (p.content.toLowerCase().includes(lowerCaseTerm)) {
                matchField = 'content';
                const plainText = p.content.replace(/<[^>]+>/g, ' ');
                const regex = new RegExp(`.{0,50}${term}.{0,50}`, 'i');
                const match = plainText.match(regex);
                matchSnippet = match ? `...${match[0]}...` : 'Match found in content.';
            }

            if (matchField) {
                return { ...p, matchSnippet, matchField };
            }
            return null;
        });
      return Promise.resolve(results.filter((p): p is BlogPost => p !== null));
  },
  createBlog: async (postData: Partial<BlogPost>): Promise<BlogPost> => {
    let author = await apiService.getUserById(postData.authorId!);
    // Auto-create author in mock DB if missing to avoid creation failure
    if (!author) {
      // Try to find existing user by username first
      const existingByName = db.users.find(u => u.username === (postData.authorName || 'UnknownUser'));
      if (existingByName) {
        author = existingByName;
      } else {
        const newUser = {
          id: postData.authorId!,
          email: `${(postData.authorName || 'user').toLowerCase()}@example.com`,
          username: postData.authorName || 'UnknownUser',
          role: 'user',
          bio: '',
          profilePictureUrl: '',
          following: [],
          createdAt: new Date().toISOString(),
        } as User;
        db.users.push(newUser);
        _saveDb();
        author = newUser;
      }
    }

    const newPost: BlogPost = {
        id: generateId(),
        title: postData.title!,
        content: postData.content!,
        tags: postData.tags!,
        authorId: postData.authorId!,
        authorName: author.username,
        status: postData.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: postData.status === 'published' ? new Date().toISOString() : undefined,
        scheduledPublishTime: postData.scheduledPublishTime,
        featuredImage: postData.featuredImage || DEFAULT_FEATURED_IMAGE,
        excerpt: postData.excerpt || createExcerpt(postData.content!, 150),
        metaDescription: postData.metaDescription,
        postType: postData.postType || 'blog',
        audioUrl: postData.audioUrl,
        reactions: {},
    };
    db.posts.push(newPost);
    _saveDb();
    return Promise.resolve(newPost);
  },
  updateBlog: async (id: string, updates: Partial<BlogPost>, userId: string): Promise<BlogPost> => {
    const postIndex = db.posts.findIndex(p => p.id === id);
    if (postIndex === -1) throw new Error("Post not found.");
    
    const currentPost = db.posts[postIndex];
    const user = await apiService.getUserById(userId);
    if (currentPost.authorId !== userId && user?.role !== 'admin') {
      throw new Error("User not authorized to update this post");
    }

    db.posts[postIndex] = { 
        ...currentPost, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        publishedAt: updates.status === 'published' && !currentPost.publishedAt ? new Date().toISOString() : currentPost.publishedAt,
    };
    _saveDb();
    return Promise.resolve(db.posts[postIndex]);
  },
  deleteBlog: async (id: string, userId: string): Promise<void> => {
    const post = await apiService.getBlogById(id);
    if (!post) return;
    const user = await apiService.getUserById(userId);
    if (post.authorId !== userId && user?.role !== 'admin') {
      throw new Error("User not authorized to delete this post");
    }
    db.posts = db.posts.filter(p => p.id !== id);
    _saveDb();
    return Promise.resolve();
  },

  // --- Reactions ---
  addReaction: async (postId: string, userId: string, type: ReactionType): Promise<BlogPost> => {
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");
    
    const post = db.posts[postIndex];
    const reactions = post.reactions || {};
    let userExistingReaction: ReactionType | null = null;
    
    for (const reactionType in reactions) {
        if ((reactions[reactionType as ReactionType] as string[]).includes(userId)) {
            userExistingReaction = reactionType as ReactionType;
            break;
        }
    }

    if (userExistingReaction) {
        reactions[userExistingReaction] = reactions[userExistingReaction]?.filter(uid => uid !== userId);
    }

    if (userExistingReaction !== type) {
        if (!reactions[type]) reactions[type] = [];
        reactions[type]!.push(userId);
        
        if (post.authorId !== userId) {
            const reactor = await apiService.getUserById(userId);
            if (reactor) {
                const newNotification: Notification = {
                    id: generateId(),
                    recipientId: post.authorId,
                    actor: { id: reactor.id, username: reactor.username, profilePictureUrl: reactor.profilePictureUrl },
                    type: 'reaction',
                    message: `${reactor.username} reacted to your post "${post.title.substring(0, 20)}..."`,
                    link: `#/blog/${postId}`,
                    read: false,
                    createdAt: new Date().toISOString(),
                };
                db.notifications.push(newNotification);
            }
        }
    }

    post.reactions = reactions;
    db.posts[postIndex] = post;
    _saveDb();
    return Promise.resolve(post);
  },
  
  // --- Comments ---
  getComments: async (blogPostId: string): Promise<Comment[]> => {
    return Promise.resolve(db.comments.filter(c => c.blogPostId === blogPostId));
  },
  addComment: async (commentData: Partial<Omit<Comment, 'id' | 'createdAt'>>): Promise<Comment> => {
    const user = await apiService.getUserById(commentData.userId!);
    if (!user) throw new Error("User not found");

    const newComment: Comment = {
        id: generateId(),
        blogPostId: commentData.blogPostId!,
        userId: user.id,
        userName: user.username,
        userProfilePictureUrl: user.profilePictureUrl,
        content: commentData.content!,
        parentId: commentData.parentId || null,
        reported: false,
        createdAt: new Date().toISOString()
    };
    db.comments.push(newComment);
    
    const post = await apiService.getBlogById(commentData.blogPostId!);
    if(post && post.authorId !== user.id){
      // simplified notification logic for brevity
    }

    _saveDb();
    return Promise.resolve(newComment);
  },
  reportComment: async (commentId: string, reporterId: string): Promise<void> => {
    const comment = db.comments.find(c => c.id === commentId);
    if (!comment) return Promise.resolve();
    comment.reported = true;

    // Notify all admins
    const admins = db.users.filter(u => u.role === UserRole.ADMIN);
    admins.forEach(admin => {
      const newNotification: Notification = {
        id: generateId(),
        recipientId: admin.id,
        actor: {
          id: reporterId,
          username: db.users.find(u => u.id === reporterId)?.username || 'Someone',
        },
        type: 'report',
        message: `A comment on post "${comment.blogPostId}" has been reported for review.`,
        link: `#/admin/reported-comments`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.push(newNotification);
    });

    _saveDb();
    return Promise.resolve();
  },
  getReportedComments: async(): Promise<Comment[]> => {
    return Promise.resolve(db.comments.filter(c => c.reported));
  },
  approveComment: async(commentId: string): Promise<void> => {
      const commentIndex = db.comments.findIndex(c => c.id === commentId);
      if(commentIndex > -1){
          db.comments[commentIndex].reported = false;
          _saveDb();
      }
      return Promise.resolve();
  },
  deleteCommentAsAdmin: async(commentId: string): Promise<void> => {
      db.comments = db.comments.filter(c => c.id !== commentId);
      _saveDb();
      return Promise.resolve();
  },

  // --- Bookmarks ---
  isBookmarked: async (userId: string, blogPostId: string): Promise<boolean> => {
    const userBookmarks = db.bookmarks[userId] || [];
    return Promise.resolve(userBookmarks.some(b => b.blogPostId === blogPostId));
  },
  addBookmark: async (userId: string, blogPostId: string): Promise<void> => {
    if (!db.bookmarks[userId]) db.bookmarks[userId] = [];
    const existing = db.bookmarks[userId].find(b => b.blogPostId === blogPostId);
    if (!existing) {
        db.bookmarks[userId].push({ userId, blogPostId, addedAt: new Date().toISOString() });
        _saveDb();
    }
    return Promise.resolve();
  },
  removeBookmark: async (userId: string, blogPostId: string): Promise<void> => {
    if (db.bookmarks[userId]) {
        db.bookmarks[userId] = db.bookmarks[userId].filter(b => b.blogPostId !== blogPostId);
        _saveDb();
    }
    return Promise.resolve();
  },
  getBookmarks: async(userId: string): Promise<Bookmark[]> => {
      return Promise.resolve(db.bookmarks[userId] || []);
  },
  
  // --- Feed, Notifications, Analytics ---
  getFeedForUser: async (userId: string): Promise<BlogPost[]> => {
    const user = await apiService.getUserById(userId);
    if (!user || !user.following || user.following.length === 0) return [];
    const feedPosts = db.posts.filter(p => user.following.includes(p.authorId) && p.status === 'published')
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Promise.resolve(feedPosts);
  },
  getNotifications: async(userId: string): Promise<Notification[]> => {
      const userNotifications = db.notifications
        .filter(n => n.recipientId === userId)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return Promise.resolve(userNotifications);
  },
  markAllNotificationsAsRead: async(userId: string): Promise<Notification[]> => {
    db.notifications.forEach(n => {
        if (n.recipientId === userId) {
            n.read = true;
        }
    });
    _saveDb();
    return apiService.getNotifications(userId);
  },
  getAnalyticsTotalStats: async(): Promise<TotalStats> => {
      const publishedPosts = db.posts.filter(p => p.status === 'published');
      const totalReactions = publishedPosts.reduce((sum, p) => sum + Object.values(p.reactions || {}).flat().length, 0);
      const totalEngagement = totalReactions + db.comments.length;
      const engagementRate = publishedPosts.length > 0 ? totalEngagement / publishedPosts.length : 0;
      
      return Promise.resolve({ 
        totalUsers: db.users.length, 
        totalBlogs: publishedPosts.length, 
        totalComments: db.comments.length,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
      });
  },
  getAnalyticsTopPostsByEngagement: async(): Promise<TopPostStat[]> => {
      const postsWithEngagement = db.posts
        .filter(p => p.status === 'published')
        .map(p => {
            const reactionCount = Object.values(p.reactions || {}).reduce((sum, list) => sum + list.length, 0);
            const commentCount = db.comments.filter(c => c.blogPostId === p.id).length;
            return {
                postId: p.id,
                title: p.title,
                engagementScore: reactionCount + (commentCount * 2), // Comments weighted higher
            }
        })
        .sort((a,b) => b.engagementScore - a.engagementScore);
      return Promise.resolve(postsWithEngagement.slice(0, 5));
  },
    getAnalyticsTopAuthors: async (): Promise<TopAuthorStat[]> => {
        const authorStats: { [authorId: string]: number } = {};
        db.posts.filter(p => p.status === 'published').forEach(p => {
            const reactionCount = Object.values(p.reactions || {}).flat().length;
            const commentCount = db.comments.filter(c => c.blogPostId === p.id).length;
            authorStats[p.authorId] = (authorStats[p.authorId] || 0) + reactionCount + (commentCount * 2);
        });

        const topAuthors = Object.entries(authorStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([authorId, totalEngagement]) => {
                const author = db.users.find(u => u.id === authorId);
                return {
                    authorId,
                    authorName: author?.username || 'Unknown',
                    profilePictureUrl: author?.profilePictureUrl,
                    totalEngagement,
                };
            });
        return Promise.resolve(topAuthors);
    },
    getAnalyticsTimeSeriesData: async(): Promise<TimeSeriesDataPoint[]> => {
        const data: TimeSeriesDataPoint[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const usersOnDate = db.users.filter(u => new Date(u.createdAt) <= date).length;
            const postsOnDate = db.posts.filter(p => new Date(p.createdAt) <= date).length;
            
            data.push({
                date: dateString,
                users: usersOnDate,
                posts: postsOnDate,
            });
        }
        return Promise.resolve(data);
  },
  getPostAnalytics: async(postId: string): Promise<PostAnalyticsData> => {
      const post = await apiService.getBlogById(postId);
      if (!post) throw new Error("Post not found");
      const reactions = Object.values(post.reactions || {}).reduce((acc, val) => acc + (val?.length || 0), 0);
      const comments = db.comments.filter(c => c.blogPostId === postId).length;
      return Promise.resolve({
          postId,
          viewsOverTime: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              views: Math.floor(Math.random() * 500) + 50
          })),
          trafficSources: [
              { source: 'Direct', value: Math.floor(Math.random() * 40) + 20 },
              { source: 'Social', value: Math.floor(Math.random() * 30) + 10 },
              { source: 'Referral', value: Math.floor(Math.random() * 20) + 5 },
          ],
          engagementScore: {
              score: Math.floor(Math.random() * 40) + 60,
              breakdown: { reactions, comments, shares: Math.floor(Math.random() * 20) }
          }
      });
  },

  // --- Category Management ---
  getManagedCategories: async(): Promise<string[]> => {
      return Promise.resolve(db.managedCategories.sort((a,b) => a.localeCompare(b)));
  },
  getManagedCategoriesWithCount: async(): Promise<Array<{name: string, count: number}>> => {
      const publishedPosts = db.posts.filter(p => p.status === 'published');
      const counts = db.managedCategories.map(catName => ({
          name: catName,
          count: publishedPosts.filter(post => post.tags.includes(catName)).length,
      }));
      return Promise.resolve(counts.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)));
  },
  addManagedCategory: async (categoryName: string): Promise<string> => {
    if (db.managedCategories.map(c => c.toLowerCase()).includes(categoryName.toLowerCase())) {
        throw new Error("Category already exists.");
    }
    db.managedCategories.push(categoryName);
    _saveDb();
    return Promise.resolve(categoryName);
  },
  deleteManagedCategory: async (categoryName: string): Promise<void> => {
    db.managedCategories = db.managedCategories.filter(c => c !== categoryName);
    db.posts.forEach(post => {
        post.tags = post.tags.filter(t => t !== categoryName);
    });
    _saveDb();
    return Promise.resolve();
  },
};
