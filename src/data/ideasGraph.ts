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
    tags: ["jamaica"],
    type: "person",
  },
];
