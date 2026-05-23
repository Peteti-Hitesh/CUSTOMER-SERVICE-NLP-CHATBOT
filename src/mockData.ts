import { FAQRule } from './types';

export const INITIAL_FAQ_RULES: FAQRule[] = [
  {
    id: 'rule-greet',
    category: 'Greetings',
    question: 'Hello / Hi / Hey',
    keywords: ['hello', 'hi', 'hey', 'greetings', 'morning', 'evening', 'sup'],
    answers: [
      'Hello inside SwiftMart support! How can I assist you with your shopping experience today?',
      'Hi there! I am the SwiftBot customer agent. Ask me about orders, shipping schedules, returns, or coupon active codes!',
      'Greetings! Hope you are having a wonderful day. How can I help you today?'
    ],
    isActive: true
  },
  {
    id: 'rule-order-tracking',
    category: 'Orders & Tracking',
    question: 'Where is my order / track order',
    keywords: ['order', 'track', 'shipped', 'where', 'package', 'shipping', 'status'],
    answers: [
      'Checking our system for order #$1... Our records show order #$1 was shipped yesterday via Express Delivery and is estimated to arrive in 2 business days!',
      'Order #$1 is currently processed, sealed, and waiting for courier dispatch. Expect an email with your carrier tracking ID shortly!'
    ],
    pattern: 'order\\s*(?:status|track|#|no|number)?\\s*([a-zA-Z0-9]{4,10})', // regex path to extract any alphanumeric ID
    isActive: true
  },
  {
    id: 'rule-returns',
    category: 'Store Policy',
    question: 'What is your return policy?',
    keywords: ['return', 'refund', 'policy', 'exchange', 'back', 'send back'],
    answers: [
      'We support free returns! You can return any unused item in its original packaging within 30 days of purchase for a full refund.',
      'Our refund cycle takes 5-7 business days to process once the returned package arrives at our warehouse. Tag-on is required.'
    ],
    isActive: true
  },
  {
    id: 'rule-hours',
    category: 'Store Policy',
    question: 'What are your store hours?',
    keywords: ['hour', 'open', 'close', 'time', 'opening', 'schedule', 'sunday', 'saturday'],
    answers: [
      'Our physical retail showrooms are open Monday through Saturday: 9:00 AM - 8:00 PM, and Sunday: 11:00 AM - 6:00 PM.',
      'Our online marketplace support and self-help system is running 24/7. Showroom customer desks follow local local hours.'
    ],
    isActive: true
  },
  {
    id: 'rule-discounts',
    category: 'Promotions',
    question: 'Do you have discounts or coupon codes?',
    keywords: ['discount', 'coupon', 'promo', 'sale', 'deal', 'save', 'code', 'promocode'],
    answers: [
      'Absolutely! Use the code **SWIFTSAVE15** during your layout checkout to claim a 15% discount on all items today!',
      'We are currently offering free shipping on all orders over $50! No coupon required.'
    ],
    isActive: true
  },
  {
    id: 'rule-location',
    category: 'Company Info',
    question: 'Where is your store located?',
    keywords: ['location', 'address', 'store', 'find', 'boutique', 'where', 'map', 'city'],
    answers: [
      'Our flagship experiential store is located at **742 Evergreen Terrace, Springfield**. We can also be found at Bellevue Mall in Seattle, WA.',
      'Our main office and return warehouse is located in Austin, Texas. Find us on popular maps or navigation devices!'
    ],
    isActive: true
  },
  {
    id: 'rule-human',
    category: 'Customer Support',
    question: 'Can I speak to a live human agent?',
    keywords: ['agent', 'human', 'support', 'person', 'phone', 'call', 'talk', 'chat', 'representative'],
    answers: [
      'Yes, we can hand you over to standard human assistance! You can reach our customer support team directly at **1-800-SWIFT-CARE** (9 AM to 5 PM EST, Mon-Fri).',
      'I will flag our support supervisor. Please hold on – or submit your email address so our representative handles your custom ticket directly!'
    ],
    isActive: true
  }
];

export const MOCK_ORDERS = [
  { id: 'SM7392', item: 'Swift Leather Backpack', price: '$89.00', status: 'Shipped' },
  { id: 'SM4021', item: 'Active Comfort Running Shoes', price: '$120.00', status: 'Processing' },
  { id: 'SM1124', item: 'UltraSoft Cotton Hoodie', price: '$45.50', status: 'Completed' }
];

export const SUGGESTIVE_PROMPTS = [
  'Help me track order SM7392',
  'What is your return policy?',
  'Do you have any discount codes?',
  'Are you open on Sundays?',
  'Contact human support',
  'Can I return an opened pack?'
];
