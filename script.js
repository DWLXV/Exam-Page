const { useState, useEffect, useRef } = React;

const MathText = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const renderMath = () => {
      if (isCancelled) return;
      if (containerRef.current) {
        containerRef.current.textContent = text;
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetClear([containerRef.current]);
          window.MathJax.typesetPromise([containerRef.current]).catch((err) => console.log('MathJax error:', err));
        } else {
          setTimeout(renderMath, 100);
        }
      }
    };

    renderMath();

    return () => {
      isCancelled = true;
    };
  }, [text]);

  return <span ref={containerRef} />;
};

const Passage = ({ title, text, isHTML }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex justify-between items-center bg-blue-100 hover:bg-blue-200 transition-colors text-blue-900 font-bold focus:outline-none text-left"
      >
        <span>{title}</span>
        <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div className="px-5 py-4 bg-white border-t border-blue-100 text-gray-800 text-sm sm:text-base leading-relaxed overflow-x-auto">
          {isHTML ? (
            <div dangerouslySetInnerHTML={{ __html: text }} />
          ) : (
            text.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">{paragraph}</p>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PASSAGE_1 = `The Copenhagen interpretation of quantum mechanics, formulated in the 1920s by Niels Bohr and Werner Heisenberg, represents a seismic shift in our understanding of physical reality. It fundamentally challenges the deterministic clockwork universe envisioned by classical physics, where the state of any system at a future time can, in principle, be precisely calculated from its current state. Instead, quantum mechanics introduces an inherent element of probability. According to the Copenhagen interpretation, a quantum system (like an electron) does not possess definite properties, such as a precise position or momentum, prior to measurement. Instead, it exists in a superposition of all possible states, described by a mathematical construct called a wave function. The act of measurement forces the system to "collapse" the wave function and commit to a single, definite outcome, but which outcome is chosen is fundamentally probabilistic and cannot be predicted with certainty.

This concept proved deeply unsettling to many physicists, including Albert Einstein, who famously quipped that "God does not play dice." Einstein's discomfort stemmed from the interpretation's abandonment of two core principles of classical realism: locality (the idea that an object is only directly influenced by its immediate surroundings) and determinism. The probabilistic nature of wave function collapse suggested a reality that was not only unpredictable but potentially non-local, as demonstrated by the "spooky action at a distance" paradox of quantum entanglement. Furthermore, the central role assigned to the "observer" or "measurement" in collapsing the wave function raised profound philosophical questions. Does the universe only become definite when we look at it? This observer effect implies a participatory reality, where the act of knowing something fundamentally alters its state, blurring the line between the objective world and the subjective consciousness observing it. The pursuit of a "hidden variables" theory—an attempt to restore determinism by positing undiscovered factors that guide quantum outcomes—was a direct response to the perceived incompleteness and philosophical strangeness of the Copenhagen view.`;

const PASSAGE_2 = `The Silk Road was not a single, paved highway but a sprawling network of trade routes that connected the East and West for more than 1,500 years. Stretching from eastern China to the Mediterranean Sea, it was the world's first great artery of commerce. While silk was the most famous commodity to travel west, it was far from the only one. Spices, porcelain, and paper flowed from the East, while the West sent back goods such as wool, gold, silver, and glass. This exchange was not just about luxury goods; it was a conduit for the transfer of agricultural products and technologies. Grapes and alfalfa were introduced to China, while innovations like paper-making and the magnetic compass made their way to Europe, fundamentally altering the course of its development.

Perhaps more significant than the material exchange was the Silk Road's role as a channel for cultural, religious, and philosophical diffusion. Buddhism, originating in India, traveled eastward along these routes to become a major religion in China and beyond. Christianity, particularly Nestorianism, also found its way into Central Asia and China. Ideas in mathematics, astronomy, and medicine were shared, leading to a cross-pollination of knowledge that enriched civilizations at both ends of the network. However, this interconnectedness had a dark side. The Silk Road was also an unwitting vector for disease. It is widely believed that the bubonic plague, or Black Death, which devastated Europe in the 14th century, traveled from Asia along these very trade routes, carried by fleas on rats that hitched rides in merchant caravans. Thus, the same network that fostered unprecedented prosperity and cultural fusion also facilitated one of history's greatest demographic catastrophes.`;

const PASSAGE_3_HTML = `
  <table class="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-md">
    <thead class="bg-gray-100">
      <tr>
        <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Club Name</th>
        <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">2022 </th>
        <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">2023 </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-white">
      <tr><td class="px-4 py-2 text-sm text-gray-700">Debate Club</td><td class="px-4 py-2 text-sm text-gray-700">50</td><td class="px-4 py-2 text-sm text-gray-700">70</td></tr>
      <tr class="bg-gray-50"><td class="px-4 py-2 text-sm text-gray-700">Science Club</td><td class="px-4 py-2 text-sm text-gray-700">60</td><td class="px-4 py-2 text-sm text-gray-700">75</td></tr>
      <tr><td class="px-4 py-2 text-sm text-gray-700">Arts Club</td><td class="px-4 py-2 text-sm text-gray-700">80</td><td class="px-4 py-2 text-sm text-gray-700">80</td></tr>
      <tr class="bg-gray-50"><td class="px-4 py-2 text-sm text-gray-700">Sports Club</td><td class="px-4 py-2 text-sm text-gray-700">100</td><td class="px-4 py-2 text-sm text-gray-700">115</td></tr>
    </tbody>
  </table>
`;

const PASSAGE_4 = `For several months, the research team at Veridian Dynamics ________(36) the effects of a new enzyme. Last week, their lead scientist finally ________(37) a breakthrough. A new series of experiments ________(38) immediately to verify the initial findings. Right now, the team ________(39) the data from these new trials. They predict that by the end of the year, they ________(40) a comprehensive report. The director is hopeful the enzyme ________(41) the way the company develops its products. Ever since the breakthrough ________(42), morale in the lab ________(43) significantly. Looking back, if they ________(44) this approach sooner, they might have saved months of effort. Everyone on the team now eagerly ________(45) the final results.`;

const quizData = [
  // English Section (1-55)
  {
    id: 1, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "What is the primary purpose of this passage?",
    options: [
      { id: 'A', text: "To explain the Copenhagen interpretation and its profound philosophical challenge to classical physics." },
      { id: 'B', text: "To forcefully argue in favor of Albert Einstein's deterministic view of the universe over modern physics." },
      { id: 'C', text: "To conclusively prove that the Copenhagen interpretation remains the only accurate model of reality." },
      { id: 'D', text: "To detail the complex mathematical formulas underlying the wave function and early quantum mechanics." }
    ], correctAnswer: 'A'
  },
  {
    id: 2, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "According to the passage, the concept of \"superposition\" means that a quantum system:",
    options: [
      { id: 'A', text: "Occupies two or more entirely different physical locations at the exact same moment." },
      { id: 'B', text: "Strictly obeys the traditional laws of classical physics until an observation occurs." },
      { id: 'C', text: "Possesses a specific, definite position that remains entirely unknown to the observer." },
      { id: 'D', text: "Exists in a mixture of all its potential states simultaneously before being measured." }
    ], correctAnswer: 'D'
  },
  {
    id: 3, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "The author's tone throughout the passage can best be described as:",
    options: [
      { id: 'A', text: "Highly sarcastic and intensely critical." },
      { id: 'B', text: "Deeply confused and generally uncertain." },
      { id: 'C', text: "Largely objective and clearly explanatory." },
      { id: 'D', text: "Wildly enthusiastic and celebratory." }
    ], correctAnswer: 'C'
  },
  {
    id: 4, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "In the first paragraph, the word \"inherent\" most nearly means:",
    options: [
      { id: 'A', text: "Externally imposed." },
      { id: 'B', text: "Deeply intrinsic." },
      { id: 'C', text: "Random and chaotic." },
      { id: 'D', text: "Highly complicated." }
    ], correctAnswer: 'B'
  },
  {
    id: 5, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "What can be inferred about \"classical physics\" from the passage?",
    options: [
      { id: 'A', text: "It assumes the universe operates on cause-and-effect principles that are perfectly predictable." },
      { id: 'B', text: "It is considered a much more modern and scientifically accurate theoretical framework than quantum mechanics is." },
      { id: 'C', text: "It was developed entirely by Albert Einstein to counter the unusual claims of early quantum mechanics researchers." },
      { id: 'D', text: "It focuses almost exclusively on the continuous study of light and energy interactions in a controlled vacuum." }
    ], correctAnswer: 'A'
  },
  {
    id: 6, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "The phrase \"spooky action at a distance\" (paragraph 2) is used to describe:",
    options: [
      { id: 'A', text: "The deep philosophical fear that the physical universe is ultimately governed by random, chaotic chance." },
      { id: 'B', text: "The specific moment when an observer artificially forces a quantum system to collapse its wave function." },
      { id: 'C', text: "A fundamentally flawed scientific theory about gravity that has since been disproven by modern physicists." },
      { id: 'D', text: "The seemingly instantaneous influence entangled particles have on each other, regardless of separation." }
    ], correctAnswer: 'D'
  },
  {
    id: 7, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "Einstein's quote \"God does not play dice\" implies his belief in:",
    options: [
      { id: 'A', text: "The urgent need for more randomized testing within modern scientific experiments." },
      { id: 'B', text: "A deterministic universe governed by strict underlying rules, not random chance." },
      { id: 'C', text: "The definitive existence of a divine creator directly guiding quantum processes." },
      { id: 'D', text: "The fundamental inaccuracy of using mathematical probability to describe nature." }
    ], correctAnswer: 'B'
  },
  {
    id: 8, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "The role of \"measurement\" or an \"observer\" in the Copenhagen interpretation is significant because it:",
    options: [
      { id: 'A', text: "Represents the primary and unavoidable source of structural error in most quantum experiments." },
      { id: 'B', text: "Conclusively proves that our physical reality is merely a subjective and persistent illusion." },
      { id: 'C', text: "Serves as the trigger forcing a quantum system out of superposition into a definitive state." },
      { id: 'D', text: "Directly allows physicists to predict the exact, definite outcome of any given quantum event." }
    ], correctAnswer: 'C'
  },
  {
    id: 9, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "In paragraph 2, the author mentions \"hidden variables\" theories to:",
    options: [
      { id: 'A', text: "Highlight a counter-movement seeking to restore determinism and objectivity to physics." },
      { id: 'B', text: "Suggest that the original Copenhagen interpretation has been conclusively proven incomplete." },
      { id: 'C', text: "Heavily criticize modern physicists who simply could not accept the new quantum reality." },
      { id: 'D', text: "Thoroughly explain the underlying mathematical foundations of quantum entanglement theories." }
    ], correctAnswer: 'A'
  },
  {
    id: 10, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "Which of the following statements would the author of the passage most likely agree with?",
    options: [
      { id: 'A', text: "Albert Einstein eventually fully embraced and aggressively supported the Copenhagen interpretation of the universe." },
      { id: 'B', text: "The Copenhagen interpretation raised profound philosophical questions extending far beyond the realm of pure physics." },
      { id: 'C', text: "The so-called 'observer effect' is ultimately a minor, insignificant mathematical detail of modern quantum theory." },
      { id: 'D', text: "The core principles of classical physics remain entirely sufficient to describe reality at all microscopic scales." }
    ], correctAnswer: 'B'
  },
  {
    id: 11, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "In paragraph 1, the phrase \"seismic shift\" is used to emphasize that the Copenhagen interpretation:",
    options: [
      { id: 'A', text: "Was a remarkably loud and highly controversial discovery among early physicists." },
      { id: 'B', text: "Literally caused destructive physical earthquakes near the main scientific facilities." },
      { id: 'C', text: "Acted as a destructive ideological force that immediately invalidated all prior science." },
      { id: 'D', text: "Represented a revolutionary and profoundly transformative change in scientific thought." }
    ], correctAnswer: 'D'
  },
  {
    id: 12, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "The passage suggests that a key difference between the classical and quantum views of the universe is the role of:",
    options: [
      { id: 'A', text: "Inherent probability." },
      { id: 'B', text: "Gravitational forces." },
      { id: 'C', text: "Empirical experiment." },
      { id: 'D', text: "Complex mathematics." }
    ], correctAnswer: 'A'
  },
  {
    id: 13, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "How does the second paragraph build upon the ideas presented in the first?",
    options: [
      { id: 'A', text: "It abruptly shifts the primary focus from theoretical physics to the personal biographies of the founders." },
      { id: 'B', text: "It systematically refutes the entire concept of the wave function collapse proposed in the first section." },
      { id: 'C', text: "It explores the philosophical and scientific backlash to the principles outlined in the first paragraph." },
      { id: 'D', text: "It provides the rigorous mathematical proofs required to validate the theories mentioned in the beginning." }
    ], correctAnswer: 'C'
  },
  {
    id: 14, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "The term \"participatory reality\" (paragraph 2) implies a universe where:",
    options: [
      { id: 'A', text: "All ordinary citizens are strongly encouraged to participate in complex scientific experiments." },
      { id: 'B', text: "The fundamental act of observation is an integral part of creating the physical reality observed." },
      { id: 'C', text: "Ultimate reality is effectively determined by a massive democratic consensus among all observers." },
      { id: 'D', text: "The physical universe functions exactly like a pre-programmed digital simulation or virtual game." }
    ], correctAnswer: 'B'
  },
  {
    id: 15, section: 'english', passageTitle: "Passage 1", passage: PASSAGE_1, isHTML: false, text: "According to the passage, why was Einstein uncomfortable with the Copenhagen interpretation?",
    options: [
      { id: 'A', text: "He was bitter professional rivals with Bohr and Heisenberg and actively wanted their research to be ruined." },
      { id: 'B', text: "It completely failed to account for the gravitational variables introduced by his own theory of relativity." },
      { id: 'C', text: "He strongly believed the complex mathematical formulas underlying the new theory were fundamentally flawed." },
      { id: 'D', text: "It contradicted his belief in a predictable universe existing entirely independently of any human observer." }
    ], correctAnswer: 'D'
  },

  // Passage 2: The Silk Road
  {
    id: 16, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The passage is primarily concerned with:",
    options: [
      { id: 'A', text: "Detailing the specific luxury goods, such as silk and porcelain, that allowed Eastern empires to dominate the West." },
      { id: 'B', text: "Chronicling the complete history of restrictive economic trade policies between eastern China and the Mediterranean." },
      { id: 'C', text: "Arguing that the unprecedented financial prosperity generated by the Silk Road far outweighed its demographic toll." },
      { id: 'D', text: "Highlighting the Silk Road's dual nature as a sprawling conduit for profound cultural exchange and catastrophic disease." }
    ], correctAnswer: 'D'
  },
  {
    id: 17, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "According to the passage, the term \"Silk Road\" is somewhat misleading because:",
    options: [
      { id: 'A', text: "Silk was actually one of the least valuable commodities traded among wealthy merchants on the route." },
      { id: 'B', text: "It consisted of a sprawling network of various rough trade routes rather than a single paved highway." },
      { id: 'C', text: "The routes primarily facilitated the movement of military forces rather than commercial trading goods." },
      { id: 'D', text: "The most significant global exchanges involved religious philosophies rather than any material wealth." }
    ], correctAnswer: 'B'
  },
  {
    id: 18, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "In paragraph 1, the word \"conduit\" most nearly means:",
    options: [
      { id: 'A', text: "An insurmountable obstacle." },
      { id: 'B', text: "A channel for transmission." },
      { id: 'C', text: "A closely guarded secret." },
      { id: 'D', text: "A primary point of origin." }
    ], correctAnswer: 'B'
  },
  {
    id: 19, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The author mentions paper-making and the magnetic compass to:",
    options: [
      { id: 'A', text: "Argue that the technological superiority of the East prevented the West from exporting valuable commodities." },
      { id: 'B', text: "Demonstrate that the exchange of practical technologies was far more lucrative than the trade of luxury goods." },
      { id: 'C', text: "Provide concrete examples of how Eastern technological innovations fundamentally altered European development." },
      { id: 'D', text: "Illustrate how scientific cross-pollination directly led to the catastrophic spread of the bubonic plague." }
    ], correctAnswer: 'C'
  },
  {
    id: 20, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "What can be inferred about the world before the establishment of the Silk Road?",
    options: [
      { id: 'A', text: "European civilizations had already acquired advanced technologies like the magnetic compass independently." },
      { id: 'B', text: "The primary mode of transportation for global trade relied heavily on maritime routes instead of overland caravans." },
      { id: 'C', text: "China remained completely isolated from its immediate neighbors, refusing to share its agricultural innovations." },
      { id: 'D', text: "There was likely far less direct interaction and material exchange between the civilizations of Europe and the far East." }
    ], correctAnswer: 'D'
  },
  {
    id: 21, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The word \"diffusion\" in the second paragraph most nearly means:",
    options: [
      { id: 'A', text: "The sudden and violent disruption of traditional practices." },
      { id: 'B', text: "The careful translation of ancient philosophical texts." },
      { id: 'C', text: "The spreading of ideas or culture across a wide area." },
      { id: 'D', text: "The competitive replacement of one religion by another." }
    ], correctAnswer: 'C'
  },
  {
    id: 22, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The passage suggests that the spread of Buddhism to China is an example of:",
    options: [
      { id: 'A', text: "The Silk Road serving as a powerful channel for non-material cultural diffusion." },
      { id: 'B', text: "The political dominance of Indian empires over Central Asian territories." },
      { id: 'C', text: "A direct result of European merchants introducing new philosophies to the East." },
      { id: 'D', text: "The negative consequences of unchecked globalization on indigenous beliefs." }
    ], correctAnswer: 'A'
  },
  {
    id: 23, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The phrase \"cross-pollination of knowledge\" (paragraph 2) refers to:",
    options: [
      { id: 'A', text: "The physical transfer of agricultural crops like grapes and alfalfa across different continents." },
      { id: 'B', text: "A highly competitive process where one civilization's scientific discoveries replaced another's." },
      { id: 'C', text: "The mutual intellectual enrichment of interconnected civilizations through the sharing of ideas." },
      { id: 'D', text: "The intentional spread of infectious diseases through the movement of merchant trade caravans." }
    ], correctAnswer: 'C'
  },
  {
    id: 24, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "How did the Silk Road contribute to the Black Death in Europe?",
    options: [
      { id: 'A', text: "The constant intermingling of diverse cultures systematically depleted the natural immunity of European populations." },
      { id: 'B', text: "Infected merchants intentionally spread the bubonic plague to weaken the economic dominance of their Western rivals." },
      { id: 'C', text: "The introduction of foreign agricultural products introduced new and deadly pathogens to previously isolated regions." },
      { id: 'D', text: "It provided an overland pathway for the disease, likely carried by flea-infested rats hiding within merchant caravans." }
    ], correctAnswer: 'D'
  },
  {
    id: 25, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The overall tone of the passage is:",
    options: [
      { id: 'A', text: "Highly biased and intensely judgmental." },
      { id: 'B', text: "Analytically informative and well-balanced." },
      { id: 'C', text: "Deeply solemn and persistently mournful." },
      { id: 'D', text: "Generally humorous and overly lighthearted." }
    ], correctAnswer: 'B'
  },
  {
    id: 26, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The author implies that the primary value of the Silk Road was:",
    options: [
      { id: 'A', text: "The unprecedented demographic shifts caused by the introduction of foreign agricultural staples." },
      { id: 'B', text: "The immense and exclusive financial profits generated primarily from the sale of Chinese silk and porcelain." },
      { id: 'C', text: "Its foundational role in facilitating the widespread exchange of both material goods and transformative ideas." },
      { id: 'D', text: "The establishment of lasting military and political alliances between European monarchs and Eastern emperors." }
    ], correctAnswer: 'C'
  },
  {
    id: 27, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The passage suggests that the relationship between commerce and culture on the Silk Road was:",
    options: [
      { id: 'A', text: "Inherently hostile, with profound cultural differences frequently leading to severe disruptions in international commerce." },
      { id: 'B', text: "Largely one-sided, with significant cultural influence flowing almost exclusively from Mediterranean societies to the East." },
      { id: 'C', text: "Completely nonexistent, given that merchant caravans were strictly focused on maximizing profit rather than sharing beliefs." },
      { id: 'D', text: "Deeply intertwined, as physical trade routes simultaneously functioned as effective pathways for religious and scientific ideas." }
    ], correctAnswer: 'D'
  },
  {
    id: 28, section: 'english', passageTitle: "Passage 2", passage: PASSAGE_2, isHTML: false, text: "The second paragraph primarily serves to:",
    options: [
      { id: 'A', text: "Systematically contradict the positive economic claims presented by the author in the first paragraph." },
      { id: 'B', text: "Broaden the passage's focus from material economics to include profound cultural and epidemiological impacts." },
      { id: 'C', text: "Argue that the devastating spread of the bubonic plague was an unavoidable consequence of global trade." },
      { id: 'D', text: "Provide a comprehensive historical timeline of the major religious movements throughout Central Asia." }
    ], correctAnswer: 'B'
  },

  { id: 29, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "Which club experienced the largest percentage increase in enrollment from 2022 to 2023?", options: [{ id: 'A', text: "Science Club" }, { id: 'B', text: "Sports Club" }, { id: 'C', text: "Debate Club" }, { id: 'D', text: "Arts Club" }], correctAnswer: 'C' },
  { id: 30, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "What was the total student enrollment across all four clubs in 2022?", options: [{ id: 'A', text: "280" }, { id: 'B', text: "340" }, { id: 'C', text: "300" }, { id: 'D', text: "290" }], correctAnswer: 'D' },
  { id: 31, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "In 2023, which two clubs had a combined enrollment of exactly 150 students?", options: [{ id: 'A', text: "Debate Club and Arts Club" }, { id: 'B', text: "Science Club and Sports Club" }, { id: 'C', text: "Debate Club and Science Club" }, { id: 'D', text: "Arts Club and Sports Club" }], correctAnswer: 'A' },
  { id: 32, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "What was the ratio of Science Club members to Arts Club members in 2022?", options: [{ id: 'A', text: "1:2" }, { id: 'B', text: "3:4" }, { id: 'C', text: "4:5" }, { id: 'D', text: "2:3" }], correctAnswer: 'B' },
  { id: 33, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "Which of the following statements is a reasonable inference that can be made from the data?", options: [{ id: 'A', text: "The Sports Club is the most well-funded club at Northwood High." }, { id: 'B', text: "The Arts Club has become less popular among students." }, { id: 'C', text: "The school may have increased its focus on academic and public speaking activities in 2023." }, { id: 'D', text: "Fewer students overall participated in after-school activities in 2023." }], correctAnswer: 'C' },
  { id: 34, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "Which club experienced the largest absolute increase in the number of students from 2022 to 2023?", options: [{ id: 'A', text: "Sports Club" }, { id: 'B', text: "Debate Club" }, { id: 'C', text: "Science Club" }, { id: 'D', text: "Arts Club" }], correctAnswer: 'B' },
  { id: 35, section: 'english', passageTitle: "Chart Description: Northwood High After-School Club (2022 vs. 2023)", passage: PASSAGE_3_HTML, isHTML: true, text: "Which of the following questions CANNOT be answered using only the data provided?", options: [{ id: 'A', text: "What was the total increase in enrollment for the Science Club?" }, { id: 'B', text: "Which club had the highest enrollment in 2023?" }, { id: 'C', text: "What was the average number of students per club in 2022?" }, { id: 'D', text: "How many new freshmen joined the Debate Club in 2023?" }], correctAnswer: 'D' },

  { id: 36, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "has studied" }, { id: 'B', text: "studies" }, { id: 'C', text: "had been studying" }, { id: 'D', text: "will study" }], correctAnswer: 'A' },
  { id: 37, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "announced" }, { id: 'B', text: "announces" }, { id: 'C', text: "has announced" }, { id: 'D', text: "was announcing" }], correctAnswer: 'A' },
  { id: 38, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "launched" }, { id: 'B', text: "is launched" }, { id: 'C', text: "have been launched" }, { id: 'D', text: "were launched" }], correctAnswer: 'D' },
  { id: 39, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "analyzed" }, { id: 'B', text: "is analyzing" }, { id: 'C', text: "has analyzed" }, { id: 'D', text: "analyzes" }], correctAnswer: 'B' },
  { id: 40, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "published" }, { id: 'B', text: "are publishing" }, { id: 'C', text: "will have published" }, { id: 'D', text: "have published" }], correctAnswer: 'C' },
  { id: 41, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "will revolutionize" }, { id: 'B', text: "revolutionizes" }, { id: 'C', text: "has revolutionized" }, { id: 'D', text: "would revolutionize" }], correctAnswer: 'A' },
  { id: 42, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "occurs" }, { id: 'B', text: "occurred" }, { id: 'C', text: "has occurred" }, { id: 'D', text: "was occurring" }], correctAnswer: 'B' },
  { id: 43, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "improved" }, { id: 'B', text: "improves" }, { id: 'C', text: "has improved" }, { id: 'D', text: "will improve" }], correctAnswer: 'C' },
  { id: 44, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "tried" }, { id: 'B', text: "have tried" }, { id: 'C', text: "were trying" }, { id: 'D', text: "had tried" }], correctAnswer: 'D' },
  { id: 45, section: 'english', passageTitle: "Grammar in Context", passage: PASSAGE_4, isHTML: true, text: "Choose the correct option:", options: [{ id: 'A', text: "awaits" }, { id: 'B', text: "awaited" }, { id: 'C', text: "has awaited" }, { id: 'D', text: "is awaiting" }], correctAnswer: 'A' },

  { id: 46, section: 'english', text: "In view of the fact that the company is facing significant financial difficulties, the board of directors has come to the decision to indefinitely postpone the planned expansion.", options: [{ id: 'A', text: "The company's financial difficulties are why the board made the decision to postpone expansion." }, { id: 'B', text: "Postponing the expansion was the decision made by the board due to financial difficulties." }, { id: 'C', text: "The decision to postpone the expansion was made, seeing as how the company has financial difficulties." }, { id: 'D', text: "Because of financial difficulties, the board decided to postpone the expansion." }], correctAnswer: 'D' },
  { id: 47, section: 'english', text: "The reason why the project failed was because the team did not have an adequate amount of resources to complete the tasks assigned to them.", options: [{ id: 'A', text: "The reason for the project's failure was a lack of adequate team resources." }, { id: 'B', text: "The project's failure was due to the fact that the team's resources were inadequate." }, { id: 'C', text: "The project failed because the team lacked adequate resources." }, { id: 'D', text: "A lack of adequate resources for the team was the reason the project failed." }], correctAnswer: 'C' },
  { id: 48, section: 'english', text: "It is absolutely essential for all employees who wish to be considered for the promotion to submit their applications prior to the deadline of 5:00 PM on Friday.", options: [{ id: 'A', text: "Submitting applications by 5:00 PM Friday is essential for employees wanting the promotion." }, { id: 'B', text: "Employees seeking the promotion must submit their applications by 5:00 PM Friday." }, { id: 'C', text: "To be considered for the promotion, the submission of applications by all employees must be done before the Friday deadline." }, { id: 'D', text: "If you want the promotion, your application must be submitted before Friday at 5:00 PM." }], correctAnswer: 'B' },
  { id: 49, section: 'english', text: "Despite the fact that the computer is many years old, it continues to function in a way that is perfectly acceptable for basic word processing tasks.", options: [{ id: 'A', text: "Although old, the computer works acceptably for basic word processing." }, { id: 'B', text: "The computer, being old, still functions acceptably for basic word processing." }, { id: 'C', text: "The computer's function is still acceptable for basic word processing, even though it is old." }, { id: 'D', text: "Its age notwithstanding, the computer's function for word processing is acceptable." }], correctAnswer: 'A' },
  { id: 50, section: 'english', text: "The ultimate purpose of the new regulations that have been put into place is to ensure the safety and well-being of every single person in the community.", options: [{ id: 'A', text: "The purpose of the new regulations is for keeping the community safe." }, { id: 'B', text: "Community safety is the ultimate purpose for the implementation of the new regulations." }, { id: 'C', text: "To ensure the community is safe is why the new regulations were put in place." }, { id: 'D', text: "The new regulations aim to ensure community safety." }], correctAnswer: 'D' },
  { id: 51, section: 'english', text: "After a long process of careful evaluation of all the available options, the committee made the final choice to select the proposal submitted by the design firm.", options: [{ id: 'A', text: "The committee's final choice, after evaluating all options, was the design firm's proposal." }, { id: 'B', text: "The proposal from the design firm was what the committee chose after a long evaluation." }, { id: 'C', text: "After careful evaluation, the committee selected the design firm's proposal." }, { id: 'D', text: "Choosing the design firm's proposal was the committee's decision following evaluation." }], correctAnswer: 'C' },
  { id: 52, section: 'english', text: "There is no doubt that the evidence strongly suggests that the defendant was present at the location of the crime on the night that it occurred.", options: [{ id: 'A', text: "The evidence strongly suggests the defendant was at the crime scene." }, { id: 'B', text: "The defendant's presence at the crime scene is strongly suggested by the evidence." }, { id: 'C', text: "It is undoubtable that the evidence suggests the defendant was at the crime scene." }, { id: 'D', text: "Suggesting the defendant was at the crime scene is what the evidence strongly does." }], correctAnswer: 'A' },
  { id: 53, section: 'english', text: "In the event that you should happen to experience any technical difficulties, you are advised to make contact with the IT support desk without delay.", options: [{ id: 'A', text: "Should you experience technical difficulties, making contact with IT support is advised." }, { id: 'B', text: "If you have technical difficulties, contact IT support immediately." }, { id: 'C', text: "Contacting the IT support desk is what you should do in the event of technical difficulties." }, { id: 'D', text: "For technical difficulties, immediate contact with the IT support desk should be made." }], correctAnswer: 'B' },
  { id: 54, section: 'english', text: "The report, which was written and compiled by the research department, offered a summary of the key findings from the most recent market survey.", options: [{ id: 'A', text: "The report, from the research department, was a summary of key findings from the survey." }, { id: 'B', text: "Key findings from the recent market survey were summarized in the research department's report." }, { id: 'C', text: "Summarizing the market survey's key findings was the report from the research department." }, { id: 'D', text: "The research department's report summarized the latest market survey findings." }], correctAnswer: 'D' },
  { id: 55, section: 'english', text: "It should be noted that the new policy will have an effect on all employees, irrespective of their department or their current job title.", options: [{ id: 'A', text: "All employees, irrespective of department or job title, will be affected by the new policy." }, { id: 'B', text: "The effect of the new policy will be on all employees, no matter their department or title." }, { id: 'C', text: "The new policy will affect all employees, regardless of department or title." }, { id: 'D', text: "Note that all employees will find the new policy affects them." }], correctAnswer: 'C' },

  // Mathematics Section (56-100)
  {
    id: 56,
    section: 'math',
    text: "Hanna is 6 years older than her brother Samuel. In 2 years, Hanna's age will be twice Samuel's age. How old is Samuel now?",
    options: [
      { id: 'A', text: "8" },
      { id: 'B', text: "6" },
      { id: 'C', text: "10" },
      { id: 'D', text: "4" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 57,
    section: 'math',
    text: "Printer A can print a batch of documents in 3 hours. Printer B can print the same batch in 5 hours. If both printers work together, how long will it take to print the batch?",
    options: [
      { id: 'A', text: "2 hours and 15 minutes" },
      { id: 'B', text: "1 hour and 52.5 minutes" },
      { id: 'C', text: "2 hours" },
      { id: 'D', text: "4 hours" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 58,
    section: 'math',
    text: "The price of a jacket in a store is 500 ETB. The price is first increased by 20% and then decreased by 20%. What is the final price of the jacket?",
    options: [
      { id: 'A', text: "500 ETB" },
      { id: 'B', text: "480 ETB" },
      { id: 'C', text: "520 ETB" },
      { id: 'D', text: "475 ETB" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 59,
    section: 'math',
    text: "A mixture of 5 liters contains acid and water in the ratio 2:3. Another mixture of 10 liters contains acid and water in the ratio 4:1. If the two mixtures are combined, what is the ratio of acid to water in the new mixture?",
    options: [
      { id: 'A', text: "3:2" },
      { id: 'B', text: "5:3" },
      { id: 'C', text: "2:1" },
      { id: 'D', text: "6:4" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 60,
    section: 'math',
    text: "A theater sold 100 tickets for a total of 12,200 ETB. Adult tickets cost 150 ETB each, and child tickets cost 80 ETB each. How many adult tickets were sold?",
    options: [
      { id: 'A', text: "40" },
      { id: 'B', text: "50" },
      { id: 'C', text: "60" },
      { id: 'D', text: "70" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 61,
    section: 'math',
    text: "If f(x) = 2x² - kx + 8 and f(2) = 10, what is the value of k?",
    options: [
      { id: 'A', text: "4" },
      { id: 'B', text: "3" },
      { id: 'C', text: "2" },
      { id: 'D', text: "1" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 62,
    section: 'math',
    text: "What is the minimum value of the function g(x) = |x - 4| + 3?",
    options: [
      { id: 'A', text: "4" },
      { id: 'B', text: "7" },
      { id: 'C', text: "-1" },
      { id: 'D', text: "3" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 63,
    section: 'math',
    text: "A polynomial function P(x) has roots at x = -1, x = 2, and x = 4. Which of the following could be the equation for P(x)?",
    options: [
      { id: 'A', text: "P(x) = x³ - 5x² - 2x + 8" },
      { id: 'B', text: "P(x) = x³ + 5x² + 2x - 8" },
      { id: 'C', text: "P(x) = x³ - 5x² + 2x + 8" },
      { id: 'D', text: "P(x) = x³ + 3x² - 6x - 8" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 64,
    section: 'math',
    text: "What is the equation of the vertical asymptote of the rational function h(x) = (3x - 6) / (x + 4)?",
    options: [
      { id: 'A', text: "x = 2" },
      { id: 'B', text: "x = -4" },
      { id: 'C', text: "y = 3" },
      { id: 'D', text: "y = -4" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 65,
    section: 'math',
    text: "The population of a town doubles every 15 years. If the population was 10,000 in the year 2000, in which year will the population first exceed 70,000?",
    options: [
      { id: 'A', text: "2040" },
      { id: 'B', text: "2045" },
      { id: 'C', text: "2050" },
      { id: 'D', text: "2043" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 66,
    section: 'math',
    text: "If log₂(x) + log₂(x - 2) = 3, what is the value of x?",
    options: [
      { id: 'A', text: "4" },
      { id: 'B', text: "-2" },
      { id: 'C', text: "3" },
      { id: 'D', text: "2" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 67,
    section: 'math',
    text: "If sin(θ) = √3/2 and π/2 < θ < π, what is the value of cos(θ)?",
    options: [
      { id: 'A', text: "1/2" },
      { id: 'B', text: "-√3/2" },
      { id: 'C', text: "-1/2" },
      { id: 'D', text: "√2/2" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 68,
    section: 'math',
    text: "Which of the following is equivalent to the expression (x² - 9) / (x² - x - 6) for x ≠ 3 and x ≠ -2?",
    options: [
      { id: 'A', text: "(x - 3) / (x + 2)" },
      { id: 'B', text: "(x + 3) / (x + 2)" },
      { id: 'C', text: "(x + 3) / (x - 2)" },
      { id: 'D', text: "3 / (x + 2)" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 69,
    section: 'math',
    text: "A right triangle has legs with lengths of 7 cm and 24 cm. What is the length of the hypotenuse?",
    options: [
      { id: 'A', text: "25 cm" },
      { id: 'B', text: "31 cm" },
      { id: 'C', text: "28 cm" },
      { id: 'D', text: "26 cm" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 70,
    section: 'math',
    text: "What is the equation of a circle with its center at (3, -5) and a radius of 6?",
    options: [
      { id: 'A', text: "(x + 3)² + (y - 5)² = 36" },
      { id: 'B', text: "(x - 3)² + (y + 5)² = 6" },
      { id: 'C', text: "(x - 3)² + (y + 5)² = 36" },
      { id: 'D', text: "(x + 3)² + (y - 5)² = 6" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 71,
    section: 'math',
    text: "A rectangle with a length of 16 meters and a width of 12 meters is inscribed in a circle. What is the circumference of the circle?",
    options: [
      { id: 'A', text: "10π meters" },
      { id: 'B', text: "14π meters" },
      { id: 'C', text: "25π meters" },
      { id: 'D', text: "20π meters" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 72,
    section: 'math',
    text: "Two lines are perpendicular. If the equation of the first line is y = 2x + 5, what is the slope of the second line?",
    options: [
      { id: 'A', text: "2" },
      { id: 'B', text: "-2" },
      { id: 'C', text: "-1/2" },
      { id: 'D', text: "1/2" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 73,
    section: 'math',
    text: "The following table shows the number of goals scored by a soccer team in its last 15 matches.\n\n| Goals Scored | 0 | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|---|\n| Frequency | 3 | 5 | 4 | 2 | 1 |\n\nWhat is the median number of goals scored?",
    options: [
      { id: 'A', text: "1.5" },
      { id: 'B', text: "2" },
      { id: 'C', text: "1" },
      { id: 'D', text: "2.5" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 74,
    section: 'math',
    text: "A bag contains 5 red, 4 blue, and 3 green marbles. If one marble is drawn at random, what is the probability that it is not blue?",
    options: [
      { id: 'A', text: "1/3" },
      { id: 'B', text: "5/12" },
      { id: 'C', text: "2/3" },
      { id: 'D', text: "1/4" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 75,
    section: 'math',
    text: "Given the system of equations:\n3x + 2y = 18\n2x - y = 5\nWhat is the value of x?",
    options: [
      { id: 'A', text: "5" },
      { id: 'B', text: "4" },
      { id: 'C', text: "3" },
      { id: 'D', text: "2" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 76,
    section: 'math',
    text: "A car rental company charges a flat fee of 500 ETB plus 15 ETB per kilometer driven. Which function C(d) represents the total cost for driving d kilometers?",
    options: [
      { id: 'A', text: "C(d) = 500d + 15" },
      { id: 'B', text: "C(d) = 515d" },
      { id: 'C', text: "C(d) = 15d + 500" },
      { id: 'D', text: "C(d) = (500 + 15)d" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 77,
    section: 'math',
    text: "What are the solutions to the quadratic equation x² - 8x + 15 = 0?",
    options: [
      { id: 'A', text: "x = -3, x = -5" },
      { id: 'B', text: "x = 2, x = 6" },
      { id: 'C', text: "x = 3, x = 5" },
      { id: 'D', text: "x = -2, x = -6" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 78,
    section: 'math',
    text: "When the polynomial f(x) = x³ - 2x² + ax - 6 is divided by (x - 3), the remainder is 9. What is the value of a?",
    options: [
      { id: 'A', text: "2" },
      { id: 'B', text: "1" },
      { id: 'C', text: "0" },
      { id: 'D', text: "-1" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 79,
    section: 'math',
    text: "If g(x) = 3x - 2 and h(x) = x², what is the value of g(h(3))?",
    options: [
      { id: 'A', text: "21" },
      { id: 'B', text: "49" },
      { id: 'C', text: "25" },
      { id: 'D', text: "18" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 80,
    section: 'math',
    text: "The domain of the function f(x) = √(x - 5) is:",
    options: [
      { id: 'A', text: "x > 5" },
      { id: 'B', text: "x ≥ 5" },
      { id: 'C', text: "x ≤ 5" },
      { id: 'D', text: "All real numbers" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 81,
    section: 'math',
    text: "Given 5^(2x-1) = 125, what is the value of x?",
    options: [
      { id: 'A', text: "1" },
      { id: 'B', text: "2" },
      { id: 'C', text: "3" },
      { id: 'D', text: "4" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 82,
    section: 'math',
    text: "Evaluate log₃(81) - log₅(25).",
    options: [
      { id: 'A', text: "2" },
      { id: 'B', text: "1" },
      { id: 'C', text: "4" },
      { id: 'D', text: "3" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 83,
    section: 'math',
    text: "In triangle ABC, angle A is 30 degrees and angle B is 60 degrees. Which side is the longest?",
    options: [
      { id: 'A', text: "Side BC" },
      { id: 'B', text: "Side AC" },
      { id: 'C', text: "Cannot be determined" },
      { id: 'D', text: "Side AB" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 84,
    section: 'math',
    text: "A circle has a center at the origin (0,0) and passes through the point (5,12). What is the area of the circle?",
    options: [
      { id: 'A', text: "13π" },
      { id: 'B', text: "25π" },
      { id: 'C', text: "144π" },
      { id: 'D', text: "169π" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 85,
    section: 'math',
    text: "What is the distance between the points (-2, 3) and (4, -5) on the coordinate plane?",
    options: [
      { id: 'A', text: "8" },
      { id: 'B', text: "14" },
      { id: 'C', text: "10" },
      { id: 'D', text: "12" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 86,
    section: 'math',
    text: "If x/4 = y/5 = z/6, which of the following expressions is equivalent to (x+y+z)/y?",
    options: [
      { id: 'A', text: "2" },
      { id: 'B', text: "3" },
      { id: 'C', text: "4" },
      { id: 'D', text: "15/4" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 87,
    section: 'math',
    text: "From a group of 6 men and 4 capacity, a committee of 3 is to be chosen. What is the probability that the committee consists of exactly 2 men and 1 woman?",
    options: [
      { id: 'A', text: "1/2" },
      { id: 'B', text: "1/3" },
      { id: 'C', text: "1/4" },
      { id: 'D', text: "2/3" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 88,
    section: 'math',
    text: "Solve the nonlinear equation x² - 3x = 10.",
    options: [
      { id: 'A', text: "x = 5, x = -2" },
      { id: 'B', text: "x = -5, x = 2" },
      { id: 'C', text: "x = 5, x = 2" },
      { id: 'D', text: "x = -5, x = -2" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 89,
    section: 'math',
    text: "A square is inscribed in a circle with a radius of 5 cm. What is the area of the square?",
    options: [
      { id: 'A', text: "25 cm²" },
      { id: 'B', text: "50 cm²" },
      { id: 'C', text: "75 cm²" },
      { id: 'D', text: "100 cm²" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 90,
    section: 'math',
    text: "The sum of the roots of the quadratic equation 2x² - 12x + 7 = 0 is:",
    options: [
      { id: 'A', text: "-12" },
      { id: 'B', text: "-6" },
      { id: 'C', text: "12" },
      { id: 'D', text: "6" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 91,
    section: 'math',
    text: "An investment of 10,000 ETB grows according to the formula A = 10000 * (1.05)^t, where t is the number of years. What is the value of the investment after 2 years?",
    options: [
      { id: 'A', text: "10,500 ETB" },
      { id: 'B', text: "11,000 ETB" },
      { id: 'C', text: "11,025 ETB" },
      { id: 'D', text: "11,500 ETB" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 92,
    section: 'math',
    text: "If tan(x) = 1 and 0 ≤ x ≤ π, what is the value of x in radians?",
    options: [
      { id: 'A', text: "π/2" },
      { id: 'B', text: "π/3" },
      { id: 'C', text: "π/6" },
      { id: 'D', text: "π/4" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 93,
    section: 'math',
    text: "The graph of y = f(x) is shifted 3 units to the right and 2 units down. What is the equation of the new graph?",
    options: [
      { id: 'A', text: "y = f(x - 3) - 2" },
      { id: 'B', text: "y = f(x + 3) - 2" },
      { id: 'C', text: "y = f(x - 3) + 2" },
      { id: 'D', text: "y = f(x + 3) + 2" }
    ],
    correctAnswer: 'A'
  },
  {
    id: 94,
    section: 'math',
    text: "In a class of 30 students, 18 study Physics, 15 study Chemistry, and 5 study neither. How many students study both Physics and Chemistry?",
    options: [
      { id: 'A', text: "5" },
      { id: 'B', text: "8" },
      { id: 'C', text: "10" },
      { id: 'D', text: "7" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 95,
    section: 'math',
    text: "What is the sum of all integers from 1 to 100, inclusive?",
    options: [
      { id: 'A', text: "5000" },
      { id: 'B', text: "4950" },
      { id: 'C', text: "5150" },
      { id: 'D', text: "5050" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 96,
    section: 'math',
    text: "What is the midpoint of the line segment with endpoints (-4, 7) and (6, -1)?",
    options: [
      { id: 'A', text: "(2, 6)" },
      { id: 'B', text: "(5, 3)" },
      { id: 'C', text: "(1, 3)" },
      { id: 'D', text: "(1, 4)" }
    ],
    correctAnswer: 'C'
  },
  {
    id: 97,
    section: 'math',
    text: "In a survey of 50 people, the mean age was 32. If a person aged 52 leaves the group and a person aged 22 joins, what is the new mean age of the group?",
    options: [
      { id: 'A', text: "32.6" },
      { id: 'B', text: "31.4" },
      { id: 'C', text: "31.0" },
      { id: 'D', text: "30.8" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 98,
    section: 'math',
    text: "Which of the following is NOT a solution to the inequality |2x - 5| ≤ 3?",
    options: [
      { id: 'A', text: "1" },
      { id: 'B', text: "2" },
      { id: 'C', text: "4" },
      { id: 'D', text: "0" }
    ],
    correctAnswer: 'D'
  },
  {
    id: 99,
    section: 'math',
    text: "A rectangular garden is twice as long as it is wide. If its perimeter is 60 meters, what is its area?",
    options: [
      { id: 'A', text: "150 m²" },
      { id: 'B', text: "200 m²" },
      { id: 'C', text: "250 m²" },
      { id: 'D', text: "100 m²" }
    ],
    correctAnswer: 'B'
  },
  {
    id: 100,
    section: 'math',
    text: "Solve the system of nonlinear equations:\ny = x² - 1\ny = x + 1\nWhat is the sum of the x-coordinates of the intersection points?",
    options: [
      { id: 'A', text: "-1" },
      { id: 'B', text: "0" },
      { id: 'C', text: "2" },
      { id: 'D', text: "1" }
    ],
    correctAnswer: 'D'
  }
];

function App() {
  const [phase, setPhase] = useState('english'); // 'english', 'math', 'results'
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});

  // NEW STATE for storing reasons for flagged questions
  const [flagReasons, setFlagReasons] = useState({});

  const [englishScore, setEnglishScore] = useState(0);
  const [mathScore, setMathScore] = useState(0);

  const [timerStatus, setTimerStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isTimerHidden, setIsTimerHidden] = useState(false);

  const [inputHours, setInputHours] = useState(1);
  const [inputMinutes, setInputMinutes] = useState(0);
  const [inputSeconds, setInputSeconds] = useState(0);

  const [showResetModal, setShowResetModal] = useState(false);

  // State for AI Export Feature
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSelectedIds, setExportSelectedIds] = useState(new Set());
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    let interval = null;
    if ((timerStatus === 'running_english' || timerStatus === 'running_math') && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && (timerStatus === 'running_english' || timerStatus === 'running_math')) {
      if (timerStatus === 'running_english') {
        handleEnglishSubmit();
      } else {
        handleMathSubmit();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerStatus, timeLeft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, phase]);

  const startTimer = () => {
    if (phase === 'english') {
      const customTime = (inputHours * 3600) + (inputMinutes * 60) + inputSeconds;
      setTimeLeft(customTime > 0 ? customTime : 3600);
      setTimerStatus('running_english');
    } else if (phase === 'math') {
      setTimerStatus('running_math');
    }
  };

  const pauseTimer = () => {
    if (timerStatus === 'running_english') setTimerStatus('paused_english');
    if (timerStatus === 'running_math') setTimerStatus('paused_math');
  };

  const resumeTimer = () => {
    if (timerStatus === 'paused_english') setTimerStatus('running_english');
    if (timerStatus === 'paused_math') setTimerStatus('running_math');
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOptionSelect = (questionId, optionId) => {
    if (phase === 'results') return;
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const clearSelection = (questionId) => {
    if (phase === 'results') return;
    const newAnswers = { ...answers };
    delete newAnswers[questionId];
    setAnswers(newAnswers);
  };

  const toggleFlag = (questionId) => {
    setFlagged({ ...flagged, [questionId]: !flagged[questionId] });
  };

  // Handler for tracking flag reasons
  const handleReasonChange = (questionId, reason) => {
    setFlagReasons({ ...flagReasons, [questionId]: reason });
  };

  const handleEnglishSubmit = () => {
    let eScore = 0;
    quizData.filter(q => q.section === 'english').forEach(q => {
      if (answers[q.id] === q.correctAnswer) eScore++;
    });
    setEnglishScore(eScore);

    setPhase('math');
    setCurrentIndex(55);
    setTimeLeft(5400);
    setTimerStatus('running_math');
  };

  const handleMathSubmit = () => {
    let mScore = 0;
    quizData.filter(q => q.section === 'math').forEach(q => {
      if (answers[q.id] === q.correctAnswer) mScore++;
    });
    setMathScore(mScore);

    setPhase('results');
    setTimerStatus('finished');
  };

  const handleReset = () => {
    setAnswers({});
    setFlagged({});
    setFlagReasons({}); // Reset the reasons when the exam resets
    setPhase('english');
    setEnglishScore(0);
    setMathScore(0);
    setCurrentIndex(0);
    setShowResetModal(false);
    setTimerStatus('idle');
    setTimeLeft(3600);
    setInputHours(1); setInputMinutes(0); setInputSeconds(0);
  };

  const openExportModal = () => {
    const initialSelected = new Set();
    quizData.forEach(q => {
      const isWrong = answers[q.id] !== q.correctAnswer;
      const isFlagged = flagged[q.id];
      if (isWrong || isFlagged) {
        initialSelected.add(q.id);
      }
    });
    setExportSelectedIds(initialSelected);
    setCopySuccess(false);
    setShowExportModal(true);
  };

  const toggleExportSelection = (id) => {
    const newSet = new Set(exportSelectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExportSelectedIds(newSet);
  };

  const convertHtmlToText = (htmlStr) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlStr;
    const table = tempDiv.querySelector('table');
    if (table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td')).map(c => c.textContent.trim());
        return cells.join(' | ');
      }).join('\n');
    }
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleCopyForAI = () => {
    let exportText = "I need help understanding my mistakes on these exam questions.\n\n";
    const sortedIds = [...exportSelectedIds].sort((a, b) => a - b);

    const includedPassages = new Set();

    sortedIds.forEach(id => {
      const q = quizData.find(item => item.id === id);

      if (q.passageTitle && q.passage && !includedPassages.has(q.passageTitle)) {
        includedPassages.add(q.passageTitle);
        const cleanPassageText = q.isHTML ? convertHtmlToText(q.passage) : q.passage;
        exportText += `===================================================\n`;
        exportText += `REFERENCE DATA / PASSAGE: ${q.passageTitle}\n`;
        exportText += `===================================================\n`;
        exportText += `${cleanPassageText}\n`;
        exportText += `===================================================\n\n`;
      }

      exportText += `--- Question ${q.id} ---\n`;
      if (q.passageTitle) {
        exportText += `[Context Reference: ${q.passageTitle}]\n`;
      }

      // Append Flag Reason if this question was flagged
      if (flagged[q.id]) {
        exportText += `[Flagged by User]\n`;
        const reason = flagReasons[q.id];
        if (reason && reason.trim() !== '') {
          exportText += `User's reason for flagging: ${reason.trim()}\n`;
        }
      }

      exportText += `Question: ${q.text}\n`;
      q.options.forEach(opt => {
        exportText += `${opt.id}) ${opt.text}\n`;
      });

      const myAnsId = answers[q.id];
      const myAnsText = myAnsId ? q.options.find(o => o.id === myAnsId)?.text : "None Selected";
      exportText += `\nMy Selected Answer: ${myAnsId ? myAnsId + ') ' + myAnsText : 'None Selected'}\n`;

      const correctAnsText = q.options.find(o => o.id === q.correctAnswer)?.text;
      exportText += `Correct Answer: ${q.correctAnswer}) ${correctAnsText}\n\n`;
    });

    const textArea = document.createElement("textarea");
    textArea.value = exportText;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  };

  const question = quizData[currentIndex] || quizData[0];
  const isSubmitted = phase === 'results';
  const visibleQuestions = phase === 'results' ? quizData : quizData.filter(q => q.section === phase);

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8 relative pb-20">

      {/* Reset Modal Overlay */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Retake Exam?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to retake the entire exam? All your current progress and score will be lost.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors font-medium"
              >
                Yes, Retake
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal Overlay */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity p-4">
          <div className="bg-white rounded-lg shadow-2xl flex flex-col max-w-3xl w-full max-h-[90vh]">

            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Export for AI Agent
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-700 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <p className="mb-4 text-gray-600 text-sm">
                Select questions to copy to your clipboard. <br />
                <span className="font-semibold text-gray-800">By default, questions you got incorrect and flagged questions are selected. Passages, tables, and reference data are automatically included!</span>
              </p>

              <div className="space-y-3">
                {quizData.map(q => {
                  const isSelected = exportSelectedIds.has(q.id);
                  const isWrong = answers[q.id] !== q.correctAnswer;
                  const isFlagged = flagged[q.id];

                  return (
                    <label key={q.id} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center h-6 mt-0.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleExportSelection(q.id)}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900">Question {q.id}</span>
                          {q.passageTitle && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium border border-blue-200">Includes Passage Context</span>
                          )}
                          {isWrong && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium border border-red-200">Incorrect</span>
                          )}
                          {isFlagged && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium border border-yellow-200 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd"></path></svg>
                              Flagged
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          <MathText text={q.text} />
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center rounded-b-lg gap-4">
              <span className="text-sm font-medium text-gray-600">
                <span className="font-bold text-gray-900">{exportSelectedIds.size}</span> questions selected
              </span>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyForAI}
                  className={`flex-1 sm:flex-none px-5 py-2.5 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${copySuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      { }
      <div className="max-w-7xl mx-auto">

        <div className="fixed bottom-6 right-6 sm:top-6 sm:right-8 sm:bottom-auto z-40 flex-shrink-0">
          {isTimerHidden ? (
            <button
              onClick={() => setIsTimerHidden(false)}
              className="flex items-center justify-center w-10 h-10 bg-white text-gray-400 hover:text-gray-700 rounded-full shadow-md border border-gray-200 transition-colors focus:outline-none"
              title="Show Timer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          ) : (
            <div className="bg-white rounded-full border border-gray-200 shadow-md py-1.5 px-3 flex items-center gap-3">
              <button onClick={() => setIsTimerHidden(true)} className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none" title="Hide Timer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              {timerStatus === 'idle' && !isSubmitted ? (
                <div className="flex items-center text-sm font-mono text-gray-700 font-medium">
                  <select value={inputHours} onChange={(e) => setInputHours(Number(e.target.value))} className="appearance-none bg-transparent outline-none cursor-pointer text-center w-6 hover:text-blue-600 transition-colors">
                    {[...Array(13).keys()].map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                  </select>
                  <span>:</span>
                  <select value={inputMinutes} onChange={(e) => setInputMinutes(Number(e.target.value))} className="appearance-none bg-transparent outline-none cursor-pointer text-center w-6 hover:text-blue-600 transition-colors">
                    {[...Array(60).keys()].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                  <span>:</span>
                  <select value={inputSeconds} onChange={(e) => setInputSeconds(Number(e.target.value))} className="appearance-none bg-transparent outline-none cursor-pointer text-center w-6 hover:text-blue-600 transition-colors">
                    {[...Array(60).keys()].map(s => <option key={s} value={s}>{String(s).padStart(2, '0')}</option>)}
                  </select>
                </div>
              ) : (
                <div className={`font-mono font-bold text-base tracking-wider ${timeLeft <= 300 && (timerStatus === 'running_english' || timerStatus === 'running_math') ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                  {formatTime(timeLeft)}
                </div>
              )}

              {!isSubmitted && (
                <div className="flex items-center pl-1 border-l border-gray-200">
                  {timerStatus === 'idle' && (
                    <button onClick={startTimer} className="p-1 ml-1 rounded-full text-green-600 hover:bg-green-50 transition-colors focus:outline-none" title="Start Exam">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                  {(timerStatus === 'running_english' || timerStatus === 'running_math') && (
                    <button onClick={pauseTimer} className="p-1 ml-1 rounded-full text-amber-500 hover:bg-amber-50 transition-colors focus:outline-none" title="Pause Timer">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                  {(timerStatus === 'paused_english' || timerStatus === 'paused_math') && (
                    <button onClick={resumeTimer} className="p-1 ml-1 rounded-full text-blue-500 hover:bg-blue-50 transition-colors focus:outline-none" title="Resume Timer">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <header className="mb-6 text-center mt-2 border-b border-gray-200 pb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2">UAT Model Exam 10</h1>
          <div className="flex justify-center items-center gap-4 text-gray-500 text-sm sm:text-base">
            <span className={`px-3 py-1 rounded-full ${phase === 'english' ? 'bg-blue-100 text-blue-800 font-bold' : phase === 'results' ? 'bg-gray-100' : ''}`}>English: 60 mins</span>
            <span className={`px-3 py-1 rounded-full ${phase === 'math' ? 'bg-blue-100 text-blue-800 font-bold' : phase === 'results' ? 'bg-gray-100' : ''}`}>Mathematics: 90 mins</span>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 relative">

          { }
          <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 h-fit bg-white rounded-lg border border-gray-200 shadow-sm p-4 order-2 lg:order-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2 flex justify-between items-center">
              <span>
                {phase === 'english' ? 'English Section' : phase === 'math' ? 'Math Section' : 'Exam Results'}
              </span>
            </h3>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-5 gap-2 mb-6 pr-2 pb-2 max-h-[300px] lg:max-h-[50vh] overflow-y-auto custom-scrollbar">
              {visibleQuestions.map((q) => {
                const actualIndex = quizData.findIndex(item => item.id === q.id);
                const isAnswered = !!answers[q.id];
                const isFlagged = !!flagged[q.id];
                const isActive = currentIndex === actualIndex;

                let bgClass = "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";

                if (isSubmitted) {
                  if (!answers[q.id]) {
                    bgClass = "bg-gray-100 text-gray-500 border-gray-300";
                  } else if (answers[q.id] === q.correctAnswer) {
                    bgClass = "bg-green-100 text-green-800 border-green-400";
                  } else {
                    bgClass = "bg-red-100 text-red-800 border-red-400";
                  }
                } else if (isAnswered) {
                  bgClass = "bg-blue-100 text-blue-800 border-blue-300";
                }

                return (
                  <button
                    onClick={() => setCurrentIndex(actualIndex)}
                    key={q.id}
                    className={`
                      relative flex items-center justify-center py-2 px-1 text-xs sm:text-sm font-medium rounded border transition-colors
                      ${bgClass}
                      ${isActive ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    `}
                  >
                    {q.id}

                    {isFlagged && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-red-500 border-l-transparent rounded-tr-[3px]"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {!isSubmitted ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm text-gray-600 mb-1">
                  Answered: <span className="font-bold">
                    {Object.keys(answers).filter(id => quizData.find(q => q.id == id)?.section === phase).length}
                  </span> / {visibleQuestions.length}
                </div>

                {phase === 'english' ? (
                  <button
                    onClick={handleEnglishSubmit}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                  >
                    Submit English & Start Math
                  </button>
                ) : (
                  <button
                    onClick={handleMathSubmit}
                    className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                  >
                    Submit Final Exam
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-bold text-gray-800 border-b pb-1">Score Breakdown</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">English:</span>
                  <span className="font-semibold text-blue-700">{englishScore} / 55</span>
                </div>
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-600">Mathematics:</span>
                  <span className="font-semibold text-green-700">{mathScore} / 45</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1">
                  <span>Total:</span>
                  <span className={englishScore + mathScore >= 80 ? 'text-green-600' : (englishScore + mathScore >= 50 ? 'text-yellow-600' : 'text-red-600')}>
                    {englishScore + mathScore} / 100
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Retake Exam
                  </button>

                  <button
                    onClick={openExportModal}
                    className="w-full px-4 py-2 bg-purple-100 text-purple-800 font-medium rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 border border-purple-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Export for AI Agent
                  </button>
                </div>
              </div>
            )}
          </aside>

          { }
          <main className="flex-1 order-1 lg:order-2">
            <div className="bg-[#f8f9fa] border border-gray-200 rounded-lg p-5 sm:p-8 shadow-sm min-h-[400px] flex flex-col justify-between">
              <div>
                {question.passage && (
                  <Passage title={question.passageTitle} text={question.passage} isHTML={question.isHTML} />
                )}

                <div className="mb-5 flex justify-between items-start gap-4">
                  <div className="w-full overflow-hidden">
                    <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
                      {question.section === 'english' ? 'English' : 'Mathematics'} - Question {question.id}
                    </h2>
                    {question.image && (
                      <div className="mb-4">
                        <img src={question.image} alt={`Figure for Question ${question.id}`} className="max-w-full rounded-md shadow-sm border border-gray-200 mt-2 max-h-64 object-contain" />
                      </div>
                    )}
                    <div className="text-gray-900 text-lg sm:text-xl whitespace-pre-wrap leading-relaxed">
                      <span className="font-bold mr-2">{question.id}.</span>
                      <MathText text={question.text} />
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFlag(question.id)}
                    className="p-1.5 rounded-md hover:bg-gray-200 transition-colors shrink-0 group"
                    title={flagged[question.id] ? "Unflag Question" : "Flag Question"}
                  >
                    <svg
                      className={`w-7 h-7 transition-colors ${flagged[question.id] ? "text-red-500 fill-red-500" : "text-gray-400 group-hover:text-gray-600 fill-none"}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4 pl-0 sm:pl-6 flex-grow transition-all duration-300">
                  {question.options.map((option) => {
                    const isSelected = answers[question.id] === option.id;
                    const isCorrect = option.id === question.correctAnswer;
                    const showCorrect = isSubmitted && isCorrect;
                    const showIncorrect = isSubmitted && isSelected && !isCorrect;

                    let labelClass = "flex items-start p-3 border rounded-lg transition-colors cursor-pointer group w-full";
                    let textClass = "ml-3 text-gray-700 leading-relaxed text-base mt-0.5 overflow-hidden w-full";

                    if (showCorrect) {
                      labelClass += " bg-green-50 border-green-300";
                      textClass = "ml-3 text-green-800 font-medium leading-relaxed text-base mt-0.5 w-full";
                    } else if (showIncorrect) {
                      labelClass += " bg-red-50 border-red-300";
                      textClass = "ml-3 text-red-800 font-medium leading-relaxed text-base mt-0.5 w-full";
                    } else if (isSelected) {
                      labelClass += " bg-blue-50 border-blue-300";
                    } else if (!isSubmitted) {
                      labelClass += " bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                    } else {
                      labelClass += " bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed";
                    }

                    return (
                      <label key={option.id} className={labelClass}>
                        <div className="flex items-center h-6 mt-0.5 shrink-0">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(question.id, option.id)}
                            disabled={isSubmitted}
                            className={`w-5 h-5 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 cursor-pointer ${isSubmitted ? 'cursor-not-allowed opacity-70' : ''}`}
                          />
                        </div>
                        <span className={textClass}>
                          <span className="font-semibold mr-1">{option.id}.</span> <MathText text={option.text} />
                        </span>

                        <div className="ml-auto pl-2 flex items-center h-6 shrink-0 mt-0.5">
                          {showCorrect && (
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          )}
                          {showIncorrect && (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {answers[question.id] && !isSubmitted && (
                    <div className="mt-4 flex justify-start pl-0 sm:pl-6">
                      <button
                        onClick={() => clearSelection(question.id)}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium flex items-center gap-1 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Clear my choice
                      </button>
                    </div>
                  )}
                </div>

                {/* NEW FEATURE: Flagging Reason Textbox */}
                {flagged[question.id] && (
                  <div className="mt-6 pl-0 sm:pl-6 transition-all duration-300">
                    <label className="block text-sm font-semibold text-yellow-800 mb-2">
                      Why did you flag this question? (Helps AI explain it to you later)
                    </label>
                    <textarea
                      className={`w-full p-3 border border-yellow-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800 bg-yellow-50 resize-y transition-colors ${isSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
                      rows="2"
                      placeholder="E.g., I was confused between options B and C because..."
                      value={flagReasons[question.id] || ''}
                      onChange={(e) => handleReasonChange(question.id, e.target.value)}
                      disabled={isSubmitted}
                    ></textarea>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-between border-t border-gray-200 pt-5">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0 || (phase === 'math' && !isSubmitted && currentIndex === 55)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${(currentIndex === 0 || (phase === 'math' && !isSubmitted && currentIndex === 55))
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  Previous
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(quizData.length - 1, prev + 1))}
                  disabled={currentIndex === quizData.length - 1 || (phase === 'english' && !isSubmitted && currentIndex === 54)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${(currentIndex === quizData.length - 1 || (phase === 'english' && !isSubmitted && currentIndex === 54))
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);