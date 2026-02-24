"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// --- Data ---

type PersonalityKey = "bold" | "cozy" | "indulgent" | "zen";

const personalities: Record<
  PersonalityKey,
  { name: string; coffee: string; tagline: string; image: string }
> = {
  bold: {
    name: "Bold Adventurer",
    coffee: "Double Espresso",
    tagline: "You hit the trail before sunrise and like your coffee to keep up.",
    image: "/espresso.jpg",
  },
  cozy: {
    name: "Cozy Classic",
    coffee: "Drip Coffee",
    tagline: "Reliable, warm, and always exactly what you needed.",
    image: "/drip-coffee.jpg",
  },
  indulgent: {
    name: "Indulgent Treat",
    coffee: "Mocha",
    tagline: "Life's too short for boring drinks. You came here to enjoy yourself.",
    image: "/mocha.jpg",
  },
  zen: {
    name: "Zen Minimalist",
    coffee: "Black Coffee",
    tagline: "Pure, focused, undistracted. You know what you want.",
    image: "/black-coffee.jpg",
  },
};

const questions: Array<{
  question: string;
  options: Array<{ emoji: string; label: string; key: PersonalityKey }>;
}> = [
  {
    question: "How do you start your morning?",
    options: [
      { emoji: "🏃", label: "Up early, already moving", key: "bold" },
      { emoji: "🛋️", label: "Slow and comfortable", key: "cozy" },
      { emoji: "🎉", label: "With something fun to look forward to", key: "indulgent" },
      { emoji: "🧘", label: "Quiet and intentional", key: "zen" },
    ],
  },
  {
    question: "Pick your ideal weekend.",
    options: [
      { emoji: "🧗", label: "Hiking a new trail", key: "bold" },
      { emoji: "📚", label: "Staying in with a good book", key: "cozy" },
      { emoji: "🍰", label: "Brunch with friends", key: "indulgent" },
      { emoji: "🌿", label: "Walking alone in nature", key: "zen" },
    ],
  },
  {
    question: "How do you take on a new challenge?",
    options: [
      { emoji: "⚡", label: "Head first, figure it out", key: "bold" },
      { emoji: "📋", label: "With a plan and familiar tools", key: "cozy" },
      { emoji: "🎨", label: "Make it fun along the way", key: "indulgent" },
      { emoji: "🔍", label: "Research first, act deliberately", key: "zen" },
    ],
  },
  {
    question: "What's your coffee shop order?",
    options: [
      { emoji: "💥", label: "Whatever has the most caffeine", key: "bold" },
      { emoji: "☕", label: "My usual, please", key: "cozy" },
      { emoji: "🍫", label: "Something with whipped cream", key: "indulgent" },
      { emoji: "🖤", label: "Just black coffee", key: "zen" },
    ],
  },
  {
    question: "Choose your vibe.",
    options: [
      { emoji: "🔥", label: "Intense and driven", key: "bold" },
      { emoji: "🏡", label: "Warm and familiar", key: "cozy" },
      { emoji: "✨", label: "Playful and joyful", key: "indulgent" },
      { emoji: "🌊", label: "Calm and clear", key: "zen" },
    ],
  },
];

// --- Component ---

export default function Home() {
  const [screen, setScreen] = useState<"welcome" | "quiz" | "result">("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<PersonalityKey[]>([]);
  const [copied, setCopied] = useState(false);

  // On mount: check URL for a direct result link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("result") as PersonalityKey | null;
    if (key && key in personalities) {
      setScreen("result");
      // Fill answers with that key so getResult() works
      setAnswers(Array(questions.length).fill(key));
    }
  }, []);

  function handleAnswer(key: PersonalityKey) {
    const newAnswers = [...answers, key];
    if (currentQuestion + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setAnswers(newAnswers);
      setScreen("result");
    }
  }

  function reset() {
    setScreen("welcome");
    setCurrentQuestion(0);
    setAnswers([]);
    window.history.replaceState({}, "", "/");
  }

  function getResult(): PersonalityKey {
    const counts: Record<PersonalityKey, number> = { bold: 0, cozy: 0, indulgent: 0, zen: 0 };
    for (const key of answers) counts[key]++;
    return (Object.entries(counts) as [PersonalityKey, number][]).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];
  }

  async function handleShare(resultKey: PersonalityKey) {
    const url = `${window.location.origin}?result=${resultKey}`;
    const shareData = {
      title: `I'm a ${personalities[resultKey].name}!`,
      text: `I took the Basecamp Coffee personality quiz — ${personalities[resultKey].tagline}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // --- Screens ---

  if (screen === "welcome") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#c8a96e]">
          Basecamp Coffee
        </p>
        <h1
          className="mb-4 text-6xl leading-none text-white sm:text-7xl"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          What's Your Coffee Personality?
        </h1>
        <p className="mb-10 text-lg text-zinc-400">5 questions. One perfect cup.</p>
        <button
          onClick={() => setScreen("quiz")}
          className="rounded-full bg-[#c8a96e] px-10 py-4 text-xl font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (screen === "quiz") {
    const q = questions[currentQuestion];
    const progress = (currentQuestion / questions.length) * 100;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6">
        <div className="w-full max-w-xl">
          <div className="mb-2 flex items-center justify-between text-sm text-zinc-500">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-[#c8a96e] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2
            className="mb-8 text-5xl leading-tight text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {q.question}
          </h2>

          <div className="flex flex-col gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                className="flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-left text-white transition-colors hover:border-[#c8a96e] hover:bg-zinc-800"
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-base font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  const resultKey = getResult();
  const result = personalities[resultKey];

  // Update URL so this result is directly linkable
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("result") !== resultKey) {
      window.history.replaceState({}, "", `?result=${resultKey}`);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 py-12">
      {/* Results card */}
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Image */}
        <div className="relative h-56 w-full">
          <Image
            src={result.image}
            alt={result.coffee}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          {/* Basecamp label */}
          <p className="absolute left-5 top-5 text-xs font-medium uppercase tracking-widest text-white/70">
            Basecamp Coffee
          </p>
        </div>

        {/* Card body */}
        <div className="px-8 pb-8 pt-4 text-center">
          <p className="mb-1 text-sm font-medium uppercase tracking-widest text-[#c8a96e]">
            Your Coffee Personality
          </p>
          <h2
            className="mb-1 text-6xl leading-none text-white"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {result.name}
          </h2>
          <p className="mb-4 text-lg font-semibold text-[#c8a96e]">{result.coffee}</p>
          <p className="mb-8 text-sm leading-relaxed text-zinc-400">{result.tagline}</p>

          {/* Share button */}
          <button
            onClick={() => handleShare(resultKey)}
            className="mb-3 w-full rounded-full bg-[#c8a96e] py-3 text-sm font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {copied ? "Link Copied!" : "Share My Result"}
          </button>

          <button
            onClick={reset}
            className="w-full rounded-full border border-zinc-700 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Take it again
          </button>
        </div>
      </div>
    </div>
  );
}
