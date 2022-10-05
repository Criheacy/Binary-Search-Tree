import draft, { Node, NodeWithProperties } from "../core/Draft";

type Position = {
  x: number;
  y: number;
};

const draftChecker = (root: NodeWithProperties<Position>) => {
  let nodesInLine = [root];
  let children = [] as NodeWithProperties<Position>[];

  // BFS
  while (nodesInLine.length > 0) {
    children = [];
    nodesInLine.forEach((node) => {
      if (node.children.length > 0) {
        // should be centralized among children
        expect(node.x).toBeCloseTo((node.children[0].x + node.children[node.children.length - 1].x) / 2);
      }
      node.children.forEach((child) => {
        expect(child.y).toEqual(node.y + 1);
        children.push(child);
      });
    });

    nodesInLine
      .sort((a, b) => a.x - b.x)
      .forEach((node, index) => {
        if (index === 0) return;
        // the gap between nodes should be at least 1
        expect(node.x - nodesInLine[index - 1].x).toBeGreaterThanOrEqual(1);
      });
    nodesInLine = children;
  }
};

// test cases
const tree1: Node = {
  id: "O",
  children: [
    {
      id: "E",
      children: [
        { id: "A", children: [] },
        {
          id: "D",
          children: [
            { id: "B", children: [] },
            { id: "C", children: [] },
          ],
        },
      ],
    },
    { id: "F", children: [] },
    { id: "W", children: [] },
    {
      id: "N",
      children: [
        { id: "G", children: [] },
        {
          id: "M",
          children: [
            { id: "H", children: [] },
            { id: "I", children: [] },
            { id: "J", children: [] },
            { id: "K", children: [] },
            { id: "L", children: [] },
          ],
        },
      ],
    },
  ],
};

const tree2: Node = {
  id: "R",
  children: [
    {
      id: "1",
      children: [
        {
          id: "2",
          children: [
            {
              id: "3",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "4",
      children: [
        {
          id: "5",
          children: [],
        },
      ],
    },
    { id: "6", children: [] },
    {
      id: "7",
      children: [
        {
          id: "8",
          children: [
            { id: "9", children: [] },
            { id: "A", children: [] },
            { id: "B", children: [] },
          ],
        },
        { id: "C", children: [] },
        { id: "D", children: [] },
        { id: "E", children: [] },
        { id: "F", children: [] },
      ],
    },
  ],
};

const tree3: Node = {
  id: "O",
  children: [
    {
      id: "0",
      children: [
        {
          id: "P",
          children: [
            { id: "A", children: [] },
            { id: "B", children: [] },
            { id: "C", children: [] },
            { id: "D", children: [] },
            { id: "E", children: [] },
            { id: "F", children: [] },
            { id: "G", children: [] },
            { id: "H", children: [] },
          ],
        },
      ],
    },
    { id: "1", children: [] },
    {
      id: "2",
      children: [
        { id: "Q", children: [] },
        { id: "R", children: [] },
      ],
    },
    {
      id: "3",
      children: [
        { id: "S", children: [] },
        { id: "T", children: [] },
      ],
    },
    { id: "4", children: [] },
    {
      id: "5",
      children: [
        {
          id: "U",
          children: [
            { id: "I", children: [] },
            { id: "J", children: [] },
            { id: "K", children: [] },
            { id: "L", children: [] },
            { id: "M", children: [] },
            { id: "N", children: [] },
            { id: "X", children: [] },
            { id: "Y", children: [] },
          ],
        },
      ],
    },
  ],
};

const tree4: Node = {
  id: "O",
  children: [
    { id: "1", children: [{ id: "2", children: [{ id: "3", children: [] }] }] },
    {
      id: "0",
      children: [
        {
          id: "P",
          children: [
            { id: "A", children: [] },
            { id: "B", children: [] },
            { id: "C", children: [] },
            { id: "D", children: [] },
            { id: "E", children: [] },
            { id: "F", children: [] },
            { id: "G", children: [] },
            { id: "H", children: [] },
            { id: "I", children: [] },
            { id: "J", children: [] },
          ],
        },
      ],
    },
    { id: "5", children: [{ id: "6", children: [{ id: "7", children: [] }] }] },
  ],
};

const tree5: Node = {
  id: "O",
  children: [
    {
      id: "H",
      children: [
        { id: "I", children: [] },
        { id: "J", children: [] },
      ],
    },
    {
      id: "0",
      children: [
        {
          id: "P",
          children: [
            { id: "A", children: [] },
            { id: "B", children: [] },
            { id: "C", children: [] },
            { id: "D", children: [] },
            { id: "E", children: [] },
            { id: "F", children: [] },
            { id: "G", children: [] },
            { id: "H", children: [] },
            { id: "I", children: [] },
            { id: "J", children: [] },
          ],
        },
      ],
    },
    { id: "5", children: [{ id: "6", children: [{ id: "7", children: [] }] }] },
  ],
};

describe("Tree draft should work correctly", () => {
  [tree1, tree2, tree3, tree4, tree5].forEach((tree, index) => {
    it(`Tree #${index + 1}`, () => {
      draftChecker(draft(tree));
    });
  });
});
