/** Checks if given target is a DOM Node */
export const isNode = (target: EventTarget | null): target is Node => target instanceof Node;

/** Checks if DOM node contains given event target */
export const containsNode = (container: Node, target: EventTarget | null): boolean =>
    isNode(target) && container.contains(target);
