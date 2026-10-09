// Designjoy Labs: small, free tools. Add new ones here and they show up on /labs.

export type LabTool = {
  slug: string;
  name: string;
  description: string;
};

export const labTools: LabTool[] = [
  {
    slug: "sequence",
    name: "Sequence",
    description: "Drop in a stack of images and get a looping GIF. Set the speed, size and quality.",
  },
];
