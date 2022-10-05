type NodeKey = string | number;

export type Node = {
  id: NodeKey;
  children: Node[];
};

export type NodeWithProperties<T> = Omit<Node, "children"> &
  T & {
    children: NodeWithProperties<T>[];
  };

type Position = {
  x: number;
  y: number;
};

type DeltaPosition = Position & {
  delta: number;
};

type PropertiesOf<T extends Node> = Omit<T, "children">;

const getProperties = <T extends Node>(node: T): PropertiesOf<T> => {
  const { ["children"]: _, ...properties } = node;
  return properties;
};

const initialize = (node: Node): NodeWithProperties<DeltaPosition> => ({
  ...getProperties(node),
  x: 0,
  y: 0,
  delta: 0,
  children: node.children.map(initialize),
});

const assignY = (node: NodeWithProperties<Position>, depth?: number): void => {
  node.y = depth ?? 0;
  node.children.forEach((child) => assignY(child, (depth ?? 0) + 1));
};

type Contour = {
  left: number;
  right: number;
};

type IndexedContour = Contour & {
  childIndex: number;
};

const assignX = (node: NodeWithProperties<DeltaPosition>): IndexedContour[] => {
  const contour = node.children.reduce((prevContour, child, childIndex) => {
    // recursively calculate the child contour first
    const childContour = assignX(child);

    // resolve x-position conflicts
    const { conflict, conflictIndex } = childContour.slice(1, prevContour.length).reduce(
      (max, item, depth) => {
        const conflict = prevContour[depth + 1].right - item.left + 1;
        return conflict > max.conflict ? { conflict, conflictIndex: prevContour[depth + 1].childIndex } : max;
      },
      {
        conflict: prevContour.length > 0 ? prevContour[0].right - childContour[0].left + 1 : 0,
        conflictIndex: prevContour.length > 0 ? prevContour[0].childIndex : 0,
      }
    );
    child.delta += conflict;

    if (childIndex > 0) {
      // the excess gap should be divided equally among all intermediate nodes
      const gap = child.delta + child.x - (node.children[childIndex - 1].delta + node.children[childIndex - 1].x) - 1;
      for (let i = conflictIndex + 1; i < childIndex; ++i) {
        node.children[i].delta += (gap * (i - conflictIndex)) / (childIndex - conflictIndex);
      }
    }

    // merge the contours
    return childContour.concat(prevContour.slice(childContour.length)).map((contour, depth) => ({
      left: depth >= prevContour.length ? contour.left + conflict : prevContour[depth].left,
      right: depth >= childContour.length ? prevContour[depth].right : contour.right + conflict,
      childIndex: depth >= childContour.length ? prevContour[depth].childIndex : childIndex,
    }));
  }, [] as IndexedContour[]);

  // centralize the parent node among all children
  if (node.children.length > 0) {
    const lastChild = node.children[node.children.length - 1];
    node.x = (node.children[0].x + lastChild.x + lastChild.delta) / 2 - node.x;
  }
  return [{ left: node.x + node.delta, right: node.x + node.delta, childIndex: 0 }].concat(contour);
};

const pushDownDelta = (node: NodeWithProperties<DeltaPosition>): number => {
  node.x += node.delta;

  const min = node.children.reduce((prevMin, child) => {
    child.delta += node.delta;
    const childMin = pushDownDelta(child);
    return Math.min(prevMin, childMin);
  }, node.x);
  node.delta = 0;

  return min;
};

const flattenWithChildren = (node: NodeWithProperties<Position>): NodeWithProperties<Position>[] =>
  node.children.reduce((prev, child) => prev.concat(flattenWithChildren(child)), [node]);

const draft = (root: Node) => {
  const positionedRoot = initialize(root);

  assignX(positionedRoot);
  assignY(positionedRoot);

  // pushdown twice to resolve negative coordinates
  positionedRoot.delta -= pushDownDelta(positionedRoot);
  pushDownDelta(positionedRoot);

  return positionedRoot;
};

export default draft;
