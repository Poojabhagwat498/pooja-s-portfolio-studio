import jewelry from "@/assets/project-jewelry.jpg";
import aiLearning from "@/assets/project-ai-learning.jpg";
import matrimony from "@/assets/project-matrimony.jpg";

export const RESUME_URL = "/Pooja-Bhagwat-Resume.pdf";

export type CaseStudy = {
  overview: string;
  problem: string;
  solution: string;
  features: string[];
  stack: string[];
  outcomes: string[];
  liveUrl: string;
  repoUrl: string;
};

export type Project = {
  id: string;
  index: string;
  name: string;
  kind: string;
  tagline: string;
  image?: string;
  verified: boolean;
  caseStudy: CaseStudy;
};

export const projects: Project[] = [
  {
    id: "vaamis-creations",
    index: "01",
    name: "VAAMI'S CREATIONS.",
    kind: "JEWELRY E-COMMERCE · MERN",
    tagline: "A full-stack jewellery shopping experience with its own admin control room.",
    image: jewelry,
    verified: true,
    caseStudy: {
      overview:
        "A full-stack jewellery e-commerce web application built with the MERN stack, covering product browsing, secure accounts and a dedicated admin dashboard.",
      problem:
        "A small jewellery business needed an online storefront where customers could browse pieces and save favourites, while the owner managed products and stock without touching code.",
      solution:
        "Built a React storefront on top of Express and MongoDB REST APIs, with JWT authentication for accounts and a separate admin dashboard for product, user and inventory management including image uploads.",
      features: [
        "Product browsing and detailed product pages",
        "Secure registration and login with JWT authentication",
        "Wishlist for saving favourite pieces",
        "Admin dashboard for products, users and inventory",
        "Add, edit, delete and image upload operations",
        "RESTful APIs backed by MongoDB",
        "Responsive interface for desktop and mobile",
      ],
      stack: ["React.js", "Node.js", "Express.js", "MongoDB", "JWT", "REST APIs"],
      outcomes: [
        "Delivered a working storefront with a complete admin workflow",
        "Measured results not recorded yet",
      ],
      liveUrl: "",
      repoUrl: "",
    },
  },
  {
    id: "ai-learning-assistant",
    index: "02",
    name: "AI LEARNING ASSISTANT.",
    kind: "AI LEARNING PLATFORM · MERN + GEMINI",
    tagline: "A study platform where an AI assistant, live rooms and flashcards sit side by side.",
    image: aiLearning,
    verified: true,
    caseStudy: {
      overview:
        "An AI-powered smart learning platform built on the MERN stack, with Google Gemini AI for study assistance and real-time collaboration between learners.",
      problem:
        "Students juggle notes, questions and group study across disconnected tools, with no single place to get help on their own material.",
      solution:
        "Integrated Google Gemini AI for chatbot assistance, document summarisation and flashcard generation, then added Socket.IO messaging and WebRTC video so learners can study together in the same app.",
      features: [
        "AI chatbot study assistance",
        "Automated document summarisation",
        "Flashcard generation from study material",
        "Real-time communication with Socket.IO",
        "Peer-to-peer video conferencing with WebRTC",
        "Secure authentication and personalised dashboards",
        "REST APIs for users, documents, tasks and quizzes",
      ],
      stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Gemini AI", "Socket.IO", "WebRTC"],
      outcomes: [
        "Combined AI study help and live collaboration in one platform",
        "Measured results not recorded yet",
      ],
      liveUrl: "",
      repoUrl: "",
    },
  },
  {
    id: "community-matrimony",
    index: "03",
    name: "COMMUNITY MATRIMONY.",
    kind: "MATRIMONY PLATFORM · NEXT.JS",
    tagline: "A matchmaking platform built for trust, with layered security and live messaging.",
    image: matrimony,
    verified: true,
    caseStudy: {
      overview:
        "A full-stack community matrimony platform built with Next.js 15, Prisma ORM and PostgreSQL, with layered authentication and AI-assisted match recommendations.",
      problem:
        "Matrimony platforms hold sensitive personal information, so members need strong account security and verified profiles before they will talk to anyone.",
      solution:
        "Implemented Auth.js with JWT, OAuth and OTP verification, managed server state with TanStack Query, and designed a scalable Prisma and PostgreSQL architecture with Cloudinary uploads and Docker-based deployment.",
      features: [
        "Authentication via Auth.js with JWT and OAuth",
        "OTP verification and account security controls",
        "Profile management for members",
        "Real-time messaging and notifications with Socket.IO",
        "Server-state management with TanStack Query",
        "Cloudinary media uploads",
        "Docker-based deployment",
        "AI-powered match recommendations",
      ],
      stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "TanStack Query", "Socket.IO", "Docker"],
      outcomes: [
        "Built a scalable, secure platform architecture end to end",
        "Measured results not recorded yet",
      ],
      liveUrl: "",
      repoUrl: "",
    },
  },
];

export const experience = {
  role: "MERN STACK DEVELOPER INTERN",
  company: "YSM Info Solution",
  period: "Jan 2026 – Present · On-site",
  points: [
    "Applied MERN stack concepts across MongoDB, Express.js, React and Node.js to build working applications.",
    "Engineered full-stack projects across frontend and backend for a seamless user experience.",
    "Optimised interfaces with Bootstrap and Tailwind CSS for design consistency and accessibility.",
  ],
  stack: ["HTML5", "Tailwind CSS", "JavaScript", "Express.js", "MongoDB", "React.js"],
};

export const education = [
  ["B.TECH, COMPUTER SCIENCE & ENGINEERING", "Sir Visvesvaraya Institute of Technology, Nashik · 2024–2027", "CGPA 8.76 / 10"],
  ["DIPLOMA IN COMPUTER ENGINEERING", "Institute of Engineering and Technology, Kannad · 2021–2024", "84.29%"],
  ["SECONDARY SCHOOL CERTIFICATE (X)", "Sane Guruji Vidyalaya, Kannad · 2021", "83.20%"],
];

export const skillGroups = [
  ["PROGRAMMING", ["Java", "Object-Oriented Programming", "JavaScript", "HTML", "CSS"]],
  ["FRONTEND & BACKEND", ["React", "Next.js", "Node.js", "Express.js", "Spring Boot", "Bootstrap", "Tailwind CSS"]],
  ["DATABASES", ["MongoDB", "PostgreSQL (Prisma)", "MySQL"]],
  ["DEVOPS & CLOUD", ["Linux", "AWS", "Git", "GitHub"]],
  ["CORE CS", ["Data Structures & Algorithms", "Operating Systems", "Computer Networks", "DBMS"]],
] as const;

export const achievements = [
  [
    "01",
    "STATE-LEVEL CHESS PLAYER.",
    "Recognised as a state-level chess player in the U-17 and U-18 categories.",
  ],
  [
    "02",
    "INTER-COLLEGE CHAMPION.",
    "Won multiple inter-college chess tournaments during diploma studies, 2021–2023.",
  ],
  [
    "03",
    "SMART INDIA HACKATHON 2025.",
    "Developed and deployed the official platforms using Node.js, MongoDB, Vercel and Render.",
  ],
];

export const contact = {
  email: "poojabhagwat2525@gmail.com",
  phone: "+91 88300 77452",
  location: "Kannad, Dist. Chh. Sambhajinagar, Maharashtra, India",
};
