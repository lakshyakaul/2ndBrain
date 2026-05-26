import client1 from '../../public/client1.png';
import client2 from '../../public/client2.png';
import client3 from '../../public/client3.png';
import client4 from '../../public/client4.png';
import client5 from '../../public/client5.png';

export const CLIENTS = [
    { alt: 'client1', logo: client1 },
    { alt: 'client2', logo: client2 },
    { alt: 'client3', logo: client3 },
    { alt: 'client4', logo: client4 },
    { alt: 'client5', logo: client5 },
];

export const USERS = [
	{
		name: "Sarah Jenkins",
		role: "Product Lead",
		avatar: "/avatars/1.png",
		message: "Space has completely unified our team's roadmap and specs. The folder organization is exceptionally clean, and real-time cursor tracking keeps everyone perfectly aligned during planning."
	},
	{
		name: "Alex Rivera",
		role: "Lead Engineer",
		avatar: "/avatars/2.png",
		message: "Our team switched from Notion to Space. The performance difference is night and day—pages load instantly and collaborative document edits sync immediately without conflicts."
	},
	{
		name: "Emma Zhang",
		role: "UX Designer",
		avatar: "/avatars/3.png",
		message: "I love how minimal and focused Space is. The clean typography and workspace layout keep me completely in flow while documenting our design systems."
	},
	{
		name: "David K.",
		role: "Startup Founder",
		avatar: "/avatars/4.png",
		message: "As a fast-growing startup, we need a single source of truth. Space's calendar integration paired with real-time collaborative docs solved our documentation chaos."
	},
	{
		name: "Sophia Martinez",
		role: "Developer Advocate",
		avatar: "/avatars/5.png",
		message: "The page history rollback in Space is an absolute lifesaver. Being able to easily restore previous document versions up to 1 year back gives our team total peace of mind."
	},
	{
		name: "James Cole",
		role: "Creative Director",
		avatar: "/avatars/6.png",
		message: "Beautiful design paired with exceptional performance. Space has become the creative hub for all our brainstorms, meeting notes, and copy drafts."
	}
];

export const PRICING_CARDS = [
    {
        planType: 'Free Plan',
        price: '0',
        description: 'Limited block trials for teams',
        highlightFeature: '',
        freatures: [
            'Unlimited blocks for teams',
            'Unlimited file uploads',
            '30 day page history',
            'Invite 2 guests',
        ],
    },
    {
        planType: 'Pro Plan',
        price: '99',
        description: 'Billed annually',
        highlightFeature: 'Everything in free +',
        freatures: [
            'Unlimited blocks for teams',
            'Unlimited file uploads',
            '1 year page history',
            'Invite 10 guests',
        ],
    },
];

export const PRICING_PLANS = { proplan: 'Pro Plan', freeplan: 'Free Plan' };

export const MAX_FOLDERS_FREE_PLAN = 10;
