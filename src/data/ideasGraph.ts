export type IdeaNode = {
  id: string;
  label: string;
  description: string;
  url?: string;
  tags: string[];
  type?: "concept" | "resource" | "fact" | "person" | "location" | "year";
};

export const ideaNodes: IdeaNode[] = [
  {
    id: "dub-music",
    label: "Dub Music",
    description:
      "A subgenre of reggae and a remixing technique that originated in Jamaica in the late 1960s, defined by producers stripping original tracks down to their drum and bass foundations and augmenting them with studio effects such as echo, reverb and delay.",
    url: "",
    tags: ["jamaica"],
    type: "concept",
  },
  {
    id: "king-tubby",
    label: "King Tubby",
    description:
      'Osbourne Ruddock was a Jamaican electronic engineer and sound system operator widely considered the "father of dub" for his pioneering use of customized studio equipment to deconstruct and remix reggae tracks into innovative new sonic forms.',
    url: "",
    tags: ["jamaica", "dub", "dancehall", "remixing", "sound-system"],
    type: "person",
  },
  {
    id: "digital-audio-workstations",
    label: "Digital Audio Workstations",
    description:
      "The core software used for recording, arranging, editing and mixing music, acting as a virtual production studio which allows for the manipulation of audio and MIDI data.",
    url: "",
    tags: ["software", "midi", "arrangement", "mixing"],
    type: "concept",
  },
  {
    id: "commercialization",
    label: "Commercialization",
    description:
      "The trajectory of music cultures moving from underground origins into mainstream acceptance, a process often characterized by commodification and the dilution of original political or communal values by corporate brands and the leisure industry.",
    url: "",
    tags: [
      "commodification",
      "sanitization",
      "branding",
      "illicit",
      "subculture",
    ],
    type: "concept",
  },
  {
    id: "digital-disruption",
    label: "Digital Disruption",
    description:
      "The transition from physical media to digital formats dismantled established social hierarchies by democratizing access to music for newcomers, while simultaneously devaluing recorded music sales via piracy, forcing artists to rely on live performance revenue.",
    url: "",
    tags: [
      "dub-plate-culture",
      "hyper-repetition",
      "piracy",
      "democratization",
      "exclusivity",
    ],
    type: "concept",
  },
  {
    id: "mongrel-evolution",
    label: "Mongrel Evolution",
    description:
      "Musical genres which evolve through the cross-fertilisation and syncretism of diverse cultural influences resulting in fluid repertoires reflecting the diasporic nature of contemporary urban identity.",
    url: "",
    tags: [
      "mongrel",
      "hybridity",
      "cross-fertilisation",
      "bricolage",
      "syncretism",
    ],
    type: "concept",
  },
  {
    id: "techno-spirituality",
    label: "Techno-Spirituality",
    description:
      "Where the dance floor functions as a sacred space for re-enchantment and communitas, facilitated by the DJ and often catalyzed by entheogens to produce a state of collective transcendence and healing.",
    url: "",
    tags: [
      "new-religious-movements",
      "techno-shamanism",
      "communitas",
      "re-enchantment",
      "entheogen",
    ],
    type: "concept",
  },
  {
    id: "bass-culture",
    label: "Bass Culture",
    description:
      "Bass dominates, transcending auditory perception to become a somatic experience of safety while simultaneously articulating dread, political resistance and the uncanny nature of the modern city.",
    url: "",
    tags: ["sonic", "somatic", "bass", "maternal", "urban"],
    type: "concept",
  },
  {
    id: "collectivism-versus-individualism",
    label: "Collectivism Versus Individualism",
    description:
      "While dance cultures strive for an egalitarian communitas which subverts societal atomization, they simultaneously operate within a framework celebrating entrepreneurial success, thus creating a persistent friction between the ideal of the raving collective and the economic reality of the hustle.",
    url: "",
    tags: [
      "communitas",
      "neoliberalism",
      "hustling",
      "subculture",
      "individuation",
    ],
    type: "concept",
  },
  {
    id: "globalization",
    label: "Globalization",
    description:
      "The evolution of dance culture into a transnational phenomenon, facilitating a sonic diaspora where identity is constructed through shared rhythms and affect rather than fixed national or geographic roots.",
    url: "",
    tags: ["technomadic", "sonic-diaspora", "transnationalism"],
    type: "concept",
  },
  {
    id: "spatial-reclamation",
    label: "Spatial Reclamation",
    description:
      "Music scenes function as forms of spatial reclamation of urban and rural environments challenging control and discipline, often provoking moral panics and legislative crackdowns like the Criminal Justice Act 1994 which attempted to ban repetitive beats and unauthorized gatherings.",
    url: "",
    tags: [
      "1994",
      "criminal-justice-act",
      "temporary-autonomous-zone",
      "subversion",
      "moral-panic",
    ],
    type: "concept",
  },
  {
    id: "lee-scratch-perry",
    label: "Lee 'Scratch' Perry",
    description:
      "A visionary Jamaican producer and father of the dub genre who created dense, sculptural soundscapes at his legendary Black Ark studio by layering rhythms, reverb and found sounds influencing artists ranging from Bob Marley to The Clash and Adrian Sherwood.",
    url: "",
    tags: ["upsetter", "black-art-studio", "dub", "sonic", "remixing"],
    type: "person",
  },
  {
    id: "frankie-knuckles",
    label: "Frankie Knuckles",
    description:
      "Pioneered the house music genre during his residency at Chicago's Warehouse nightclub by combining disco, soul and gospel with innovative reel-to-reel tape editing and drum machine rhythms to create a spiritual, communal experience on the dance floor.",
    url: "",
    tags: ["house", "the-warehouse", "grammy-winner", "editing", "dance-floor"],
    type: "person",
  },
];
