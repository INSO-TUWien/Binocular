import { Package } from "./type.ts";
export const developerKnowledge: Package[] = [
  {
    name: "React",
    score: 0.8,
    subpackages: [
      { name: "React DOM", score: 0.9 },
      {
        name: "React Router",
        score: 0.7,
        subpackages: [
          { name: "Route", score: 0.8 },
          { name: "Link", score: 1 },
          { name: "Switch", score: 0.7 },
          { name: "Redirect", score: 1 }
        ]
      },
      { name: "Redux", score: 0.6 },
      {
        name: "React Hooks",
        score: 0.8,
        subpackages: [
          { name: "useState", score: 0.9 },
          { name: "useEffect", score: 0.85 },
          { name: "useContext", score: 0.7 },
          { name: "useReducer", score: 0.65 }
        ]
      }
    ]
  },
  {
    name: "Node.js",
    score: 0.7,
    subpackages: [
      { name: "Express", score: 0.8 },
      {
        name: "Socket.io",
        score: 0.5,
        subpackages: [
          { name: "Emit", score: 0.6 },
          { name: "On", score: 0.7 },
          { name: "Rooms", score: 0.4 }
        ]
      },
      { name: "Mongoose", score: 0.6 },
      { name: "Passport", score: 0.4 }
    ]
  },
  {
    name: "TypeScript",
    score: 0.9,
    subpackages: [
      { name: "Types", score: 0.95 },
      { name: "Interfaces", score: 0.9 },
      {
        name: "Generics",
        score: 0.85,
        subpackages: [
          { name: "Type Parameters", score: 0.8 },
          { name: "Constraints", score: 0.7 },
          { name: "Default Types", score: 0.6 }
        ]
      },
      { name: "Decorators", score: 0.7 }
    ]
  },
  {
    name: "Testing",
    score: 0.6,
    subpackages: [
      { name: "Jest", score: 0.7 },
      { name: "Cypress", score: 0.5 },
      { name: "React Testing Library", score: 0.6 },
      { name: "Mocha", score: 0.4 }
    ]
  },
  {
    name: "CSS",
    score: 0.75,
    subpackages: [
      { name: "SASS", score: 0.8 },
      { name: "CSS Modules", score: 0.7 },
      { name: "Styled Components", score: 0.6 },
      { name: "Tailwind", score: 0.9 }
    ]
  },
  {
    name: "Low Score Example",
    score: 0.1,
    subpackages: [
      { name: "Feature 1", score: 0.05 },
      { name: "Feature 2", score: 0.1 },
      { name: "Feature 3", score: 0.15 },
      { name: "Feature 4", score: 0.2 }
    ]
  }
];
